import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { fetchAllCategoriesAsync, selectCategories } from '../features/categories/CategoriesSlice'
import { getCategoryParentId } from '../features/categories/categoryUtils'

export const CategoryProductsPage=()=>{
  const {id}=useParams()
  const dispatch=useDispatch()
  const categories=useSelector(selectCategories)
  const category=categories.find((item)=>item._id===id)
  const parentCategory=category
    ? categories.find((item)=>String(item._id)===getCategoryParentId(category)) || category
    : null
  const subcategories=parentCategory
    ? categories.filter((item)=>getCategoryParentId(item)===String(parentCategory._id))
    : []
  const selectedSubcategoryId=category && getCategoryParentId(category)?category._id:null

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
        sx={{display:'grid',placeItems:'center',px:2,py:{xs:2.5,sm:3}}}
      >
        {category && parentCategory && (
          <Stack spacing={1.5} alignItems="center" width="100%" maxWidth={1100}>
            <AnimatePresence mode="wait" initial={false}>
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
                  {parentCategory.name}
                </Typography>
                {selectedSubcategoryId && (
                  <Typography sx={{mt:.35,color:'#8b6c6d',fontSize:14,fontWeight:700,textAlign:'center'}}>
                    {category.name}
                  </Typography>
                )}
              </motion.div>
            </AnimatePresence>
            {!!subcategories.length && (
              <Stack
                component="nav"
                aria-label="تصفية المنتجات حسب الفئة الفرعية"
                direction="row"
                gap={1}
                sx={{
                  maxWidth:'100%',
                  overflowX:'auto',
                  flexWrap:{xs:'nowrap',sm:'wrap'},
                  justifyContent:'center',
                  px:.5,
                  py:.5,
                  scrollbarWidth:'none',
                  '&::-webkit-scrollbar':{display:'none'}
                }}
              >
                <Chip
                  component={Link}
                  to={`/category/${parentCategory._id}`}
                  clickable
                  label="الكل"
                  color={selectedSubcategoryId?'default':'primary'}
                  variant={selectedSubcategoryId?'outlined':'filled'}
                  sx={{flexShrink:0,fontWeight:700}}
                />
                {subcategories.map((subcategory)=>(
                  <Chip
                    key={subcategory._id}
                    component={Link}
                    to={`/category/${subcategory._id}`}
                    clickable
                    label={subcategory.name}
                    color={selectedSubcategoryId===subcategory._id?'primary':'default'}
                    variant={selectedSubcategoryId===subcategory._id?'filled':'outlined'}
                    sx={{flexShrink:0,fontWeight:700}}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Box>
      <ProductList categoryId={id} />
    </>
  )
}
