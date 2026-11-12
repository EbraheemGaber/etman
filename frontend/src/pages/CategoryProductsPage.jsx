import React from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { fetchAllCategoriesAsync, selectCategories } from '../features/categories/CategoriesSlice'
import { useEffect } from 'react'

export const CategoryProductsPage=()=>{
  const {id}=useParams()
  const dispatch=useDispatch()
  const categories=useSelector(selectCategories)
  const category=categories.find((item)=>item._id===id)

  useEffect(()=>{
    dispatch(fetchAllCategoriesAsync())
  },[dispatch])

  return (
    <>
      <Navbar isProductList={true} />
      <Box
        component="header"
        dir="rtl"
        lang="ar"
        sx={{minHeight:{xs:84,sm:108},display:'grid',placeItems:'center',px:2,py:2}}
      >
        <AnimatePresence mode="wait" initial={false}>
          {category && (
            <motion.div
              key={id}
              initial={{opacity:0,y:-12}}
              animate={{opacity:1,y:0}}
              exit={{opacity:0,y:8}}
              transition={{duration:.35,ease:'easeOut'}}
            >
              <Typography
                component="h1"
                sx={{
                  color:'#302526',
                  fontSize:{xs:22,sm:30},
                  fontWeight:800,
                  textAlign:'center'
                }}
              >
                {category.name}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <ProductList categoryId={id} />
    </>
  )
}
