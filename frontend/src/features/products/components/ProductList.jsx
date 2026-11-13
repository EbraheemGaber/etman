import {Grid, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsAsync, resetProductFetchStatus, selectProductFetchStatus, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters } from '../ProductSlice'
import { ProductCard } from './ProductCard'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import Pagination from '@mui/material/Pagination';
import { ITEMS_PER_PAGE } from '../../../constants'
import {createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems} from '../../wishlist/WishlistSlice'
import {selectLoggedInUser} from '../../auth/AuthSlice'
import {toast} from 'react-toastify'
import {loadingAnimation} from '../../../assets'
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice'
import { motion } from 'framer-motion'
import ClearIcon from '@mui/icons-material/Clear';
import Lottie from 'lottie-react'
import { getCategoryParentId, getCategoryTreeIds } from '../../categories/categoryUtils'


export const ProductList = ({categoryId}) => {
    const navigate=useNavigate()
    const location=useLocation()
    const [filters,setFilters]=useState(()=>categoryId?{category:[categoryId]}:{})
    const [page,setPage]=useState(1)
    const theme=useTheme()

    const is700=useMediaQuery(theme.breakpoints.down(700))
    const is600=useMediaQuery(theme.breakpoints.down(600))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is488=useMediaQuery(theme.breakpoints.down(488))

    const categories=useSelector(selectCategories)
    const products=useSelector(selectProducts)
    const totalResults=useSelector(selectProductTotalResults)
    const loggedInUser=useSelector(selectLoggedInUser)

    const productFetchStatus=useSelector(selectProductFetchStatus)

    const wishlistItems=useSelector(selectWishlistItems)
    const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)

    const cartItemAddStatus=useSelector(selectCartItemAddStatus)

    const isProductFilterOpen=useSelector(selectProductIsFilterOpen)

    const dispatch=useDispatch()

    useEffect(()=>{
        if(categoryId){
            setFilters({category:getCategoryTreeIds(categoryId,categories)})
            setPage(1)
        }
    },[categoryId,categories])

    const handleCategoryFilters=(e)=>{
        const filterSet=new Set(filters.category)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,category:filterArray})
    }

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        setPage(1)
    },[totalResults])


    useEffect(()=>{
        const finalFilters={...filters}

        finalFilters['pagination']={page:page,limit:ITEMS_PER_PAGE}
        if(!loggedInUser?.isAdmin){
            finalFilters['user']=true
        }

        dispatch(fetchProductsAsync(finalFilters))
        
    },[filters,page])


    const handleAddRemoveFromWishlist=(e,productId)=>{
        if(!loggedInUser?.isVerified){
            e.preventDefault()
            navigate('/login',{state:{from:location}})
            return
        }
        if(e.target.checked){
            const data={user:loggedInUser?._id,product:productId}
            dispatch(createWishlistItemAsync(data))
        }

        else if(!e.target.checked){
            const index=wishlistItems.findIndex((item)=>item.product._id===productId)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    useEffect(()=>{
        if(wishlistItemAddStatus==='fulfilled'){
            toast.success("Product added to wishlist")
        }
        else if(wishlistItemAddStatus==='rejected'){
            toast.error("Error adding product to wishlist, please try again later")
        }

    },[wishlistItemAddStatus])

    useEffect(()=>{
        if(wishlistItemDeleteStatus==='fulfilled'){
            toast.success("Product removed from wishlist")
        }
        else if(wishlistItemDeleteStatus==='rejected'){
            toast.error("Error removing product from wishlist, please try again later")
        }
    },[wishlistItemDeleteStatus])

    useEffect(()=>{
        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }
        else if(cartItemAddStatus==='rejected'){
            toast.error("Error adding product to cart, please try again later")
        }
        
    },[cartItemAddStatus])

    useEffect(()=>{
        if(productFetchStatus==='rejected'){
            toast.error("Error fetching products, please try again later")
        }
    },[productFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetProductFetchStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])


    const handleFilterClose=()=>{
        dispatch(toggleFilters())
    }

  return (
    <>
    {/* filters side bar */}

    {
        productFetchStatus==='pending'?
        <Stack width={is500?"35vh":'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} marginRight={'auto'} marginLeft={'auto'}>
            <Lottie animationData={loadingAnimation}/>
        </Stack>
        :
        <>
        <motion.div dir="rtl" lang="ar" style={{position:"fixed",backgroundColor:"white",height:"100vh",padding:'1rem',overflowY:"scroll",width:is500?"100vw":"30rem",zIndex:500,fontFamily:'Cairo, Tahoma, sans-serif'}}  variants={{show:{left:0},hide:{left:-500}}} initial={'hide'} transition={{ease:"easeInOut",duration:.7,type:"spring"}} animate={isProductFilterOpen===true?"show":"hide"}>

            {/* fitlers section */}
            <Stack mb={'5rem'}  sx={{scrollBehavior:"smooth",overflowY:"scroll"}}>

                    
                        <Typography variant='h5' fontWeight={800}>{'تصفية المنتجات'}</Typography>


                            <IconButton onClick={handleFilterClose} style={{position:"absolute",top:15,right:15}}>
                                <motion.div whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
                                    <ClearIcon fontSize='medium'/>
                                </motion.div>
                            </IconButton>


                    {/* category filters */}
                    <Stack mt={2}>
                        <Accordion>
                            <AccordionSummary expandIcon={<AddIcon />} aria-controls="category-filters" id="category-filters">
                                    <Typography>{'الفئة'}</Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{p:0}}>
                                <FormGroup onChange={handleCategoryFilters}>
                                    {
                                        categories?.map((category)=>{
                                            const parentCategory=categories.find(
                                                (item)=>String(item._id)===getCategoryParentId(category)
                                            )

                                            return (
                                            <motion.div key={category._id} style={{width:"fit-content"}} whileHover={{x:5}} whileTap={{scale:0.9}}>
                                                <FormControlLabel
                                                    sx={{ml:1}}
                                                    control={<Checkbox whileHover={{scale:1.1}} />}
                                                    label={parentCategory?`${parentCategory.name} / ${category.name}`:category.name}
                                                    value={category._id}
                                                />
                                            </motion.div>
                                            )
                                        })
                                    }
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    </Stack>
            </Stack>

        </motion.div>
        
        <Stack mb={'3rem'} dir="rtl" lang="ar">
                {/* products */}
                <Stack rowGap={5} mt={is600?2:0}>

                    {/* product grid */}
                    <Grid
                        container
                        justifyContent={'center'}
                        alignContent={'center'}
                        sx={{
                            gap:{xs:1,sm:2},
                            display:{xs:'grid',sm:'flex'},
                            gridTemplateColumns:{xs:'repeat(2, minmax(0, 1fr))'},
                            px:{xs:1,sm:0}
                        }}
                    >
                        {
                            products.map((product)=>(
                                <ProductCard key={product._id} id={product._id} title={product.title} thumbnail={product.thumbnail} price={product.price} priceIsEstimate={product.priceIsEstimate} discountPercentage={product.discountPercentage} stockQuantity={product.stockQuantity} isUnlimitedStock={product.isUnlimitedStock} handleAddRemoveFromWishlist={handleAddRemoveFromWishlist} isGridCard />
                            ))
                        }
                    </Grid>
                    
                    {/* pagination */}
                    <Stack alignSelf="center" alignItems="center" rowGap={2} p={is488?1:0}>
                        <Pagination size={is488?'medium':'large'} page={page}  onChange={(e,page)=>setPage(page)} count={Math.ceil(totalResults/ITEMS_PER_PAGE)} variant="outlined" shape="rounded" />
                        <Typography textAlign={'center'}>
                          {`${totalResults===0?0:(page-1)*ITEMS_PER_PAGE+1} إلى ${page*ITEMS_PER_PAGE>totalResults?totalResults:page*ITEMS_PER_PAGE} من ${totalResults} منتج`}
                        </Typography>
                    </Stack>    
                
                </Stack>
                
        </Stack>
        </>
    }

    </>
  )
}
