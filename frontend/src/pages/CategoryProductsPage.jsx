import React from 'react'
import { Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { useSelector } from 'react-redux'
import { selectCategories } from '../features/categories/CategoriesSlice'

export const CategoryProductsPage=()=>{
  const {id}=useParams()
  const categories=useSelector(selectCategories)
  const category=categories.find((item)=>item._id===id)

  return (
    <>
      <Navbar isProductList={true} />
      <Stack alignItems="center" py={3}>
        <Typography variant="h4">{category?.name || 'Category products'}</Typography>
      </Stack>
      <ProductList categoryId={id} />
    </>
  )
}
