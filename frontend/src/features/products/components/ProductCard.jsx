import { Box, Card, Checkbox, Chip, Stack, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice';
import {motion} from 'framer-motion'
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';

const formatPrice=(value)=>Number(value || 0).toLocaleString(undefined,{
    minimumFractionDigits:2,
    maximumFractionDigits:2
})

export const ProductCard = ({
    id,
    title,
    price,
    priceIsEstimate=false,
    discountPercentage=0,
    thumbnail,
    brand,
    stockQuantity,
    isUnlimitedStock=false,
    handleAddRemoveFromWishlist,
    isWishlistCard,
    isAdminCard,
    isGridCard=false
}) => {
    const navigate=useNavigate()
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()

    const isProductAlreadyInWishlist=wishlistItems.some((item)=>item.product._id===id)
    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)
    const discount=Math.min(Math.max(Number(discountPercentage) || 0,0),100)
    const discountedPrice=Number(price || 0)*(1-discount/100)

    const handleAddToCart=(event)=>{
        event.stopPropagation()
        dispatch(addToCartAsync({user:loggedInUser?._id,product:id}))
    }

    const handleWishlistChange=(event)=>{
        event.stopPropagation()
        handleAddRemoveFromWishlist?.(event,id)
    }

    return (
        <Card
            variant="outlined"
            onClick={()=>navigate(`/product-details/${id}`)}
            sx={{
                position:'relative',
                display:'flex',
                flexDirection:'column',
                width:isGridCard?{xs:'100%',sm:250}:250,
                minWidth:isGridCard?0:undefined,
                flex:isGridCard?{xs:'auto',sm:'0 0 250px'}:'0 0 250px',
                height:340,
                p:isGridCard?{xs:1,sm:2}:2,
                borderColor:'divider',
                borderRadius:3,
                bgcolor:'#fff',
                boxShadow:'none',
                cursor:'pointer',
                transition:'box-shadow 180ms ease, transform 180ms ease',
                '&:hover':{boxShadow:'0 8px 24px rgba(0,0,0,.1)',transform:'translateY(-2px)'}
            }}
        >
            {!isAdminCard && !isWishlistCard && (
                <motion.div
                    style={{position:'absolute',top:7,left:7,zIndex:1}}
                >
                    <Checkbox
                        aria-label={isProductAlreadyInWishlist?'Remove from wishlist':'Add to wishlist'}
                        onClick={(event)=>event.stopPropagation()}
                        checked={isProductAlreadyInWishlist}
                        onChange={handleWishlistChange}
                        icon={<FavoriteBorder sx={{fontSize:20,color:'#8b8b94'}} />}
                        checkedIcon={<Favorite sx={{fontSize:20,color:'primary.main'}} />}
                        sx={{p:1}}
                    />
                </motion.div>
            )}

            {!isAdminCard && !isWishlistCard && (
                <LayersOutlinedIcon
                    aria-hidden="true"
                    sx={{position:'absolute',top:16,right:16,fontSize:19,color:'#92929a'}}
                />
            )}

            <Box sx={{height:isGridCard?{xs:115,sm:135}:135,display:'flex',alignItems:'center',justifyContent:'center',mb:.5,mt:.5}}>
                <Box
                    component="img"
                    src={thumbnail}
                    alt={`${title} photo`}
                    sx={{width:'100%',height:'100%',objectFit:'contain'}}
                />
            </Box>

            <Stack flex={1} spacing={.75} justifyContent="space-between" alignItems="stretch">
                <Box sx={{minHeight:42}}>
                    <Typography
                        variant="body2"
                        title={title}
                        sx={{
                            color:'text.primary',
                            fontWeight:600,
                            textAlign:'center',
                            lineHeight:1.4,
                            display:'-webkit-box',
                            WebkitBoxOrient:'vertical',
                            WebkitLineClamp:2,
                            overflow:'hidden'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{minHeight:28}}>
                    <Typography
                        component="span"
                        sx={{
                            px:1,
                            py:.25,
                            border:'1px solid',
                            borderColor:isUnlimitedStock || stockQuantity>0?'success.light':'error.light',
                            borderRadius:5,
                            color:isUnlimitedStock || stockQuantity>0?'success.main':'error.main',
                            fontSize:11,
                            lineHeight:1.2
                        }}
                    >
                        {isUnlimitedStock?'In stock':stockQuantity>0?'Available':'Out of stock'}
                    </Typography>
                    <Stack alignItems="flex-end" spacing={.25}>
                        <Typography component="span" sx={{color:'text.primary',fontSize:15,fontWeight:700,lineHeight:1.2}}>
                            EGP {formatPrice(discountedPrice)}
                        </Typography>
                        {priceIsEstimate && <Typography component="span" sx={{color:'warning.dark',fontSize:10,lineHeight:1.2}}>{'Estimated price'}</Typography>}
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={.75} justifyContent="center" sx={{minHeight:24,overflow:'hidden'}}>
                    {brand && <Chip label={brand} size="small" variant="outlined" sx={{height:23,maxWidth:100,fontSize:11,borderRadius:1,borderColor:'#e2e2e2',color:'#62626a'}} />}
                </Stack>

                {!isWishlistCard && !isAdminCard && (
                    <Box
                        component="button"
                        type="button"
                        aria-label={isProductAlreadyInCart?'View cart':'Add to cart'}
                        onClick={(event)=>{
                            event.stopPropagation()
                            if(isProductAlreadyInCart) navigate('/cart')
                            else handleAddToCart(event)
                        }}
                        disabled={!isProductAlreadyInCart && !isUnlimitedStock && stockQuantity<=0}
                        sx={{
                            width:'100%',
                            minHeight:40,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            gap:.75,
                            border:0,
                            borderRadius:1.5,
                            bgcolor:'primary.main',
                            color:'#fff',
                            fontFamily:'inherit',
                            fontSize:14,
                            fontWeight:700,
                            cursor:'pointer',
                            boxShadow:'0 3px 7px rgba(0,0,0,.12)',
                            '&:hover':{bgcolor:'primary.dark'},
                            '&:disabled':{bgcolor:'#bdbdbd',cursor:'not-allowed'}
                        }}
                    >
                        {isProductAlreadyInCart?'View cart':'Add to cart'}
                        <AddShoppingCartOutlinedIcon sx={{fontSize:18}}/>
                    </Box>
                )}

            </Stack>
        </Card>
    )
}
