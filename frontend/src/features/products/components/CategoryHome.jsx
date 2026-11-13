import React, { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, ButtonBase, CircularProgress, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../ProductApi'
import { fetchAllCategoriesAsync, selectCategories, selectCategoryErrors, selectCategoryStatus } from '../../categories/CategoriesSlice'
import { ProductCard } from './ProductCard'
import { selectWishlistItems, createWishlistItemAsync, deleteWishlistItemByIdAsync } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { getCategoryTreeIds, getRootCategories } from '../../categories/categoryUtils'

export const CategoryHome=()=>{
  const categories=useSelector(selectCategories)
  const categoryStatus=useSelector(selectCategoryStatus)
  const categoryErrors=useSelector(selectCategoryErrors)
  const topLevelCategories=getRootCategories(categories)
  const wishlistItems=useSelector(selectWishlistItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const dispatch=useDispatch()
  const prefersReducedMotion=useReducedMotion()
  const [productsByCategory,setProductsByCategory]=useState({})
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [isTouchingCategories,setIsTouchingCategories]=useState(false)
  const categoryRailRef=useRef(null)
  const firstCategoryGroupRef=useRef(null)
  const touchResumeTimerRef=useRef(null)

  useEffect(()=>{
    if(categoryStatus==='idle'){
      dispatch(fetchAllCategoriesAsync())
    }
  },[categoryStatus,dispatch])

  useEffect(()=>{
    if(!topLevelCategories.length || categoryStatus!=='fulfilled') return undefined

    let active=true
    setLoading(true)
    setError('')

    Promise.all(topLevelCategories.map(async(category)=>{
      const result=await fetchProducts({
        category:getCategoryTreeIds(category._id,categories),
        pagination:{page:1,limit:8},
        user:true
      })
      return [category._id,result.data]
    }))
      .then((categoryProducts)=>{
        if(active) setProductsByCategory(Object.fromEntries(categoryProducts))
      })
      .catch((requestError)=>{
        if(active) setError(requestError?.message || 'Unable to load products by category.')
      })
      .finally(()=>{
        if(active) setLoading(false)
      })

    return ()=>{active=false}
  },[categories,categoryStatus])

  useEffect(()=>{
    if(
      prefersReducedMotion ||
      !categories.length ||
      isTouchingCategories ||
      typeof window.matchMedia!=='function' ||
      !window.matchMedia('(hover: none) and (pointer: coarse)').matches
    ) return undefined

    const rail=categoryRailRef.current
    const firstGroup=firstCategoryGroupRef.current
    if(!rail || !firstGroup) return undefined

    let frameId
    let previousFrameTime
    const autoScroll=(timestamp)=>{
      if(previousFrameTime!==undefined){
        const elapsed=Math.min(timestamp-previousFrameTime,32)
        const loopWidth=firstGroup.offsetWidth
        if(loopWidth>0){
          rail.scrollLeft+=elapsed*.02
          if(rail.scrollLeft>=loopWidth) rail.scrollLeft-=loopWidth
        }
      }

      previousFrameTime=timestamp
      frameId=window.requestAnimationFrame(autoScroll)
    }

    frameId=window.requestAnimationFrame(autoScroll)
    return ()=>window.cancelAnimationFrame(frameId)
  },[categories.length,isTouchingCategories,prefersReducedMotion])

  useEffect(()=>()=>clearTimeout(touchResumeTimerRef.current),[])

  const pauseCategoryAutoScroll=()=>{
    clearTimeout(touchResumeTimerRef.current)
    setIsTouchingCategories(true)
  }

  const resumeCategoryAutoScroll=()=>{
    clearTimeout(touchResumeTimerRef.current)
    touchResumeTimerRef.current=setTimeout(()=>setIsTouchingCategories(false),800)
  }

  const handleAddRemoveFromWishlist=(event,productId)=>{
    if(event.target.checked){
      dispatch(createWishlistItemAsync({user:loggedInUser?._id,product:productId}))
      return
    }

    const wishlistItem=wishlistItems.find((item)=>item.product._id===productId)
    if(wishlistItem) dispatch(deleteWishlistItemByIdAsync(wishlistItem._id))
  }

  return (
    <Stack spacing={4} py={4} mb={2}>
      {categoryStatus==='rejected' && (
        <Alert
          severity="error"
          sx={{mx:2}}
          action={<Button color="inherit" size="small" onClick={()=>dispatch(fetchAllCategoriesAsync())}>{'Retry'}</Button>}
        >
          {categoryErrors?.message || 'Unable to load categories.'}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{mx:2}}>{error}</Alert>}
      {!!topLevelCategories.length && (
        <Box component="nav" aria-label="تسوق حسب الفئة" dir="rtl" lang="ar">
          <Stack spacing={.5} px={{xs:2,md:4}} mb={1}>
            <Typography sx={{color:'#a34a4e',fontSize:12,fontWeight:800,letterSpacing:.5}}>
              {'تشكيلة عتمان جروب'}
            </Typography>
            <Typography component="h2" sx={{color:'#2d2021',fontSize:{xs:22,sm:28},fontWeight:800}}>
              {'تسوق حسب الفئة'}
            </Typography>
          </Stack>
          <Box
            ref={categoryRailRef}
            onTouchStart={pauseCategoryAutoScroll}
            onTouchEnd={resumeCategoryAutoScroll}
            onTouchCancel={resumeCategoryAutoScroll}
            sx={{
              overflow:'hidden',
              direction:'ltr',
              px:{xs:2,md:4},
              pb:1,
              '@media (prefers-reduced-motion: reduce)':{
                overflowX:'auto',
                scrollbarWidth:'none',
                '&::-webkit-scrollbar':{display:'none'}
              },
              '@media (hover: none) and (pointer: coarse)':{
                overflowX:'auto',
                overflowY:'hidden',
                WebkitOverflowScrolling:'touch',
                scrollSnapType:'x mandatory',
                scrollbarWidth:'none',
                '&::-webkit-scrollbar':{display:'none'}
              },
              '&:hover .category-rail-track, &:focus-within .category-rail-track':{
                animationPlayState:'paused'
              }
            }}
          >
            <Box
              className="category-rail-track"
              dir="ltr"
              sx={{
                display:'flex',
                width:'max-content',
                direction:'ltr',
                animation:'category-rail-scroll 90s linear infinite',
                '@keyframes category-rail-scroll':{
                  from:{transform:'translateX(0)'},
                  to:{transform:'translateX(-50%)'}
                },
                '@media (prefers-reduced-motion: reduce)':{animation:'none'},
                '@media (hover: none) and (pointer: coarse)':{animation:'none'}
              }}
            >
              {[false,true].map((isDuplicate)=>(
                <Box
                  key={isDuplicate?'duplicate':'original'}
                  aria-hidden={isDuplicate || undefined}
                  dir="ltr"
                  sx={{
                    display:'flex',
                    gap:1.5,
                    pr:1.5,
                    flexShrink:0,
                    ...(isDuplicate?{
                      '@media (prefers-reduced-motion: reduce)':{display:'none'}
                    }:{}),
                    '& > *':{flexShrink:0}
                  }}
                  ref={isDuplicate?undefined:firstCategoryGroupRef}
                >
                  {topLevelCategories.map((category)=>{
                    const thumbnail=productsByCategory[category._id]?.[0]?.thumbnail

                    return (
                      <ButtonBase
                        key={`${category._id}-${isDuplicate?'duplicate':'original'}`}
                        component={Link}
                        dir="rtl"
                        to={`/category/${category._id}`}
                        aria-label={`تسوق ${category.name}`}
                        tabIndex={isDuplicate?-1:undefined}
                        sx={{
                          width:{xs:112,sm:124},
                          display:'flex',
                          flexDirection:'column',
                          gap:1,
                          p:.5,
                          borderRadius:2.5,
                          color:'text.primary',
                          textAlign:'center',
                          scrollSnapAlign:'start',
                          '&:hover .category-image':{transform:'translateY(-2px)',boxShadow:'0 5px 14px rgba(0,0,0,.1)'}
                        }}
                      >
                        <Box
                          className="category-image"
                          sx={{
                            width:'100%',
                            height:{xs:96,sm:112},
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            overflow:'hidden',
                            borderRadius:2,
                            bgcolor:'#fff7f7',
                            transition:'transform 180ms ease, box-shadow 180ms ease'
                          }}
                        >
                          {thumbnail ? (
                            <Box
                              component="img"
                              src={thumbnail}
                              alt={isDuplicate?'':`${category.name} من المنتجات`}
                              loading="lazy"
                              sx={{width:'88%',height:'88%',objectFit:'contain',mixBlendMode:'multiply'}}
                            />
                          ) : loading ? (
                            <CircularProgress size={22} aria-label={`جارٍ تحميل صورة ${category.name}`} />
                          ) : (
                            <Typography aria-hidden="true" sx={{color:'#c62828',fontSize:28,fontWeight:800}}>
                              {category.name?.charAt(0)}
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            minHeight:32,
                            maxWidth:'100%',
                            color:'text.primary',
                            fontSize:12,
                            fontWeight:700,
                            lineHeight:1.3,
                            display:'-webkit-box',
                            WebkitBoxOrient:'vertical',
                            WebkitLineClamp:2,
                            overflow:'hidden'
                          }}
                        >
                          {category.name}
                        </Typography>
                      </ButtonBase>
                    )
                  })}
                </Box>
              ))}
            </Box>
          </Box>
          <Box id="products" />
        </Box>
      )}
      {loading && !Object.keys(productsByCategory).length && (
        <Stack alignItems="center" py={2}><CircularProgress /></Stack>
      )}
      {topLevelCategories.map((category,index)=>{
        const categoryProducts=productsByCategory[category._id] || []
        if(!categoryProducts.length) return null

        return (
          <motion.section
            key={category._id}
            initial={{opacity:prefersReducedMotion?1:0,y:prefersReducedMotion?0:14}}
            whileInView={{opacity:1,y:0}}
            viewport={{once:true,amount:.15}}
            transition={{duration:prefersReducedMotion?0:.35,delay:prefersReducedMotion?0:Math.min(index*0.06,0.5)}}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={{xs:2,md:4}} mb={1}>
              <Typography variant="h5" fontWeight={800} dir="rtl">{category.name}</Typography>
              <Button component={Link} to={`/category/${category._id}`} variant="outlined" size="small">
                {'عرض الكل'}
              </Button>
            </Stack>

            <Box
              role="region"
              aria-label={`${category.name} المنتجات`}
              tabIndex={0}
              dir="ltr"
              sx={{
                display:'flex',
                gap:{xs:1,sm:2},
                overflowX:'auto',
                overflowY:'hidden',
                px:{xs:2,md:4},
                pb:2,
                direction:'ltr',
                WebkitOverflowScrolling:'touch',
                scrollSnapType:'x mandatory',
                scrollbarWidth:'none',
                '&::-webkit-scrollbar':{display:'none'},
                '& > *':{scrollSnapAlign:'start',flexShrink:0},
                '&:focus-visible':{outline:'2px solid',outlineColor:'primary.main',outlineOffset:2}
              }}
            >
              {categoryProducts.map((product,productIndex)=>(
                <Box
                  component={motion.div}
                  key={product._id}
                  initial={{opacity:prefersReducedMotion?1:0,y:prefersReducedMotion?0:18}}
                  whileInView={{opacity:1,y:0}}
                  viewport={{once:true,amount:.2}}
                  transition={{
                    duration:prefersReducedMotion?0:.32,
                    delay:prefersReducedMotion?0:Math.min(productIndex*.07,.35),
                    ease:'easeOut'
                  }}
                  sx={{width:{xs:'78vw',sm:264},maxWidth:264,minWidth:0,flexShrink:0}}
                >
                  <ProductCard
                    id={product._id}
                    title={product.title}
                    thumbnail={product.thumbnail}
                    price={product.price}
                    priceIsEstimate={product.priceIsEstimate}
                    discountPercentage={product.discountPercentage}
                    stockQuantity={product.stockQuantity}
                    isUnlimitedStock={product.isUnlimitedStock}
                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                    isGridCard
                  />
                </Box>
              ))}
            </Box>
          </motion.section>
        )
      })}
    </Stack>
  )
}
