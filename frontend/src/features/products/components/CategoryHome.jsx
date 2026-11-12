import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, ButtonBase, CircularProgress, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../ProductApi'
import { selectCategories, selectCategoryStatus } from '../../categories/CategoriesSlice'
import { ProductCard } from './ProductCard'
import { selectWishlistItems, createWishlistItemAsync, deleteWishlistItemByIdAsync } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'

export const CategoryHome=()=>{
  const categories=useSelector(selectCategories)
  const categoryStatus=useSelector(selectCategoryStatus)
  const wishlistItems=useSelector(selectWishlistItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const dispatch=useDispatch()
  const prefersReducedMotion=useReducedMotion()
  const theme=useTheme()
  const isMobile=useMediaQuery(theme.breakpoints.down('sm'))
  const [productsByCategory,setProductsByCategory]=useState({})
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  useEffect(()=>{
    if(!categories.length || categoryStatus!=='fulfilled') return undefined

    let active=true
    setLoading(true)
    setError('')

    Promise.all(categories.map(async(category)=>{
      const result=await fetchProducts({
        category:[category._id],
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
      {error && <Alert severity="error" sx={{mx:2}}>{error}</Alert>}
      {!!categories.length && (
        <Box component="nav" aria-label={"Shop by category"}>
          <Box sx={{
            overflow:'hidden',
            px:{xs:2,md:4},
            pb:1,
            '@media (prefers-reduced-motion: reduce)':{
              overflowX:'auto',
              scrollbarWidth:'none',
              '&::-webkit-scrollbar':{display:'none'}
            },
            '&:hover .category-rail-track, &:focus-within .category-rail-track':{
              animationPlayState:'paused'
            }
          }}>
            <Box
              className="category-rail-track"
              sx={{
                display:'flex',
                width:'max-content',
                animation:'category-rail-scroll 90s linear infinite',
                '@keyframes category-rail-scroll':{
                  from:{transform:'translateX(0)'},
                  to:{transform:'translateX(-50%)'}
                },
                '@media (prefers-reduced-motion: reduce)':{animation:'none'}
              }}
            >
              {[false,true].map((isDuplicate)=>(
                <Box
                  key={isDuplicate?'duplicate':'original'}
                  aria-hidden={isDuplicate || undefined}
                  sx={{
                    display:'flex',
                    gap:1.5,
                    pr:1.5,
                    flexShrink:0,
                    '& > *':{flexShrink:0}
                  }}
                >
                  {categories.map((category)=>{
                    const thumbnail=productsByCategory[category._id]?.[0]?.thumbnail

                    return (
                      <ButtonBase
                        key={`${category._id}-${isDuplicate?'duplicate':'original'}`}
                        component={Link}
                        to={`/category/${category._id}`}
                        aria-label={`${'Shop'} ${category.name}`}
                        tabIndex={isDuplicate?-1:undefined}
                        sx={{
                          width:{xs:112,sm:124},
                          display:'flex',
                          flexDirection:'column',
                          gap:1,
                          borderRadius:2,
                          p:0.5,
                          color:'text.primary',
                          textAlign:'center',
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
                            bgcolor:'#f0f1f0',
                            transition:'transform 180ms ease, box-shadow 180ms ease'
                          }}
                        >
                          {thumbnail ? (
                            <Box
                              component="img"
                              src={thumbnail}
                              alt={isDuplicate?'':`${category.name} product`}
                              loading="lazy"
                              sx={{width:'88%',height:'88%',objectFit:'contain',mixBlendMode:'multiply'}}
                            />
                          ) : loading ? (
                            <CircularProgress size={22} aria-label={`${'Loading'} ${category.name} ${'image'}`} />
                          ) : (
                            <Typography aria-hidden="true" sx={{color:'text.secondary',fontSize:28,fontWeight:700}}>
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
      {categories.map((category,index)=>{
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
              <Typography variant="h5" fontWeight={600}>{category.name}</Typography>
              <Button component={Link} to={`/category/${category._id}`} variant="outlined" size="small">
                View all
              </Button>
            </Stack>

            <Box sx={{
              display:{xs:'grid',sm:'flex'},
              gridTemplateColumns:{xs:'repeat(2, minmax(0, 1fr))'},
              gap:{xs:1,sm:2},
              overflowX:{xs:'visible',sm:'auto'},
              px:{xs:2,md:4},
              pb:2,
              scrollSnapType:{sm:'x mandatory'},
              '& > *':{scrollSnapAlign:'start',flexShrink:0}
            }}>
              {(isMobile ? categoryProducts.slice(0, 2) : categoryProducts).map((product,productIndex)=>(
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
                  sx={{width:{xs:'100%',sm:250},minWidth:0,flexShrink:0}}
                >
                  <ProductCard
                    id={product._id}
                    title={product.title}
                    thumbnail={product.thumbnail}
                    brand={product.brand?.name || ''}
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
