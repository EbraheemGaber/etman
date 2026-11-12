import { Box, Card, Checkbox, Chip, Stack, Typography, useMediaQuery } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import Favorite from '@mui/icons-material/Favorite'
import { useDispatch, useSelector } from 'react-redux'
import { selectWishlistItems } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice'
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined'

const formatPrice=(value)=>Number(value || 0).toLocaleString('en-EG',{
    minimumFractionDigits:2,
    maximumFractionDigits:2
})

export const ProductCard = ({
    id,
    title,
    price,
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
    const location=useLocation()
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()
    const canHover=useMediaQuery('(hover: hover) and (pointer: fine)')

    const isProductAlreadyInWishlist=wishlistItems.some((item)=>item.product._id===id)
    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)
    const discount=Math.min(Math.max(Number(discountPercentage) || 0,0),100)
    const discountedPrice=Number(price || 0)*(1-discount/100)
    const isAvailable=isUnlimitedStock || stockQuantity>0
    const [isAddingToCart,setIsAddingToCart]=React.useState(false)

    const handleAddToCart=(event)=>{
        event.stopPropagation()
        if(!loggedInUser?.isVerified){
            navigate('/login',{state:{from:location}})
            return
        }
        setIsAddingToCart(true)
        dispatch(addToCartAsync({user:loggedInUser?._id,product:id}))
            .finally(()=>setIsAddingToCart(false))
    }

    const handleWishlistChange=(event)=>{
        event.stopPropagation()
        if(!loggedInUser?.isVerified){
            navigate('/login',{state:{from:location}})
            return
        }
        handleAddRemoveFromWishlist?.(event,id)
    }

    return (
        <Card
            variant="outlined"
            component="article"
            dir="rtl"
            lang="ar"
            onClick={(event)=>{
                if(event.target.closest('button, a, input')) return
                navigate(`/product-details/${id}`)
            }}
            sx={{
                position:'relative',
                display:'flex',
                flexDirection:'column',
                width:isGridCard?{xs:'100%',sm:264}:250,
                minWidth:isGridCard?0:undefined,
                flex:isGridCard?{xs:'auto',sm:'0 0 264px'}:'0 0 250px',
                height:isGridCard?405:375,
                p:{xs:1.15,sm:1.4},
                borderColor:'rgba(198,40,40,.16)',
                borderRadius:3.5,
                bgcolor:'#fff',
                boxShadow:'0 8px 26px rgba(135,25,30,.06)',
                cursor:'pointer',
                fontFamily:'Cairo, Tahoma, sans-serif',
                '& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'},
                transition:'box-shadow 220ms ease, transform 220ms ease, border-color 220ms ease',
                ...(canHover?{
                    '&:hover':{
                        boxShadow:'0 18px 38px rgba(135,25,30,.15)',
                        transform:'translateY(-4px)',
                        borderColor:'rgba(198,40,40,.38)'
                    },
                    '&:hover .product-card-image':{transform:'scale(1.045)'}
                }:{})
            }}
        >
            {!isAdminCard && !isWishlistCard && (
                <Checkbox
                    aria-label={isProductAlreadyInWishlist?'إزالة من قائمة الأمنيات':'إضافة إلى قائمة الأمنيات'}
                    onClick={(event)=>event.stopPropagation()}
                    checked={isProductAlreadyInWishlist}
                    onChange={handleWishlistChange}
                    icon={<FavoriteBorder sx={{fontSize:20,color:'#777078'}} />}
                    checkedIcon={<Favorite sx={{fontSize:20,color:'#c62828'}} />}
                    sx={{
                        position:'absolute',
                        top:15,
                        left:15,
                        zIndex:1,
                        p:.8,
                        bgcolor:'rgba(255,255,255,.92)',
                        borderRadius:'50%',
                        '&:hover':{bgcolor:'#fff'}
                    }}
                />
            )}

            <Box
                sx={{
                    position:'relative',
                    height:isGridCard?190:175,
                    flexShrink:0,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    overflow:'hidden',
                    borderRadius:2.5,
                    bgcolor:'#fff7f7',
                    backgroundImage:'radial-gradient(circle at 50% 42%,#fff 0%,#fffafa 62%,#f9eded 100%)'
                }}
            >
                <Box
                    className="product-card-image"
                    component="img"
                    src={thumbnail}
                    alt={title}
                    loading="lazy"
                    sx={{
                        width:'88%',
                        height:'88%',
                        objectFit:'contain',
                        mixBlendMode:'multiply',
                        transition:'transform 300ms ease'
                    }}
                />
            </Box>

            <Stack flex={1} spacing={1.1} justifyContent="space-between" alignItems="stretch" sx={{pt:1.4,px:.3}}>
                <Box sx={{minHeight:50}}>
                    <Typography
                        title={title}
                        sx={{
                            color:'#251e1f',
                            fontSize:15,
                            fontWeight:800,
                            textAlign:'right',
                            lineHeight:1.55,
                            display:'-webkit-box',
                            WebkitBoxOrient:'vertical',
                            WebkitLineClamp:2,
                            overflow:'hidden'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography sx={{mt:.2,color:'#8b8181',fontSize:11.5,fontWeight:600}}>
                        {brand==='Etman Group'?'عتمان جروب':brand}
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{minHeight:44}}>
                    <Stack spacing={.35} alignItems="flex-start">
                        <Typography sx={{color:'#7a6d6c',fontSize:10.5,fontWeight:600}}>
                            {'السعر'}
                        </Typography>
                        <Typography component="span" dir="ltr" sx={{color:'#c62828',fontSize:17,fontWeight:900,lineHeight:1.2}}>
                            {formatPrice(discountedPrice)} <Box component="span" sx={{fontSize:11,fontWeight:700}}>{'ج.م'}</Box>
                        </Typography>
                    </Stack>
                    <Chip
                        label={isAvailable?'متوفر':'غير متوفر'}
                        size="small"
                        sx={{
                            height:25,
                            bgcolor:isAvailable?'#edf5ef':'#fff0ef',
                            color:isAvailable?'#2f6d43':'#a32e32',
                            fontSize:11,
                            fontWeight:800
                        }}
                    />
                </Stack>

                {!isWishlistCard && !isAdminCard && (
                    <LoadingButton
                        type="button"
                        variant="contained"
                        aria-label={isProductAlreadyInCart?'عرض السلة':'إضافة إلى السلة'}
                        onClick={(event)=>{
                            event.stopPropagation()
                            if(!loggedInUser?.isVerified){
                                navigate('/login',{state:{from:location}})
                                return
                            }
                            if(isProductAlreadyInCart) navigate('/cart')
                            else handleAddToCart(event)
                        }}
                        disabled={!isProductAlreadyInCart && !isAvailable}
                        loading={isAddingToCart}
                        sx={{
                            width:'100%',
                            minHeight:43,
                            border:'1px solid #c62828',
                            borderRadius:1.8,
                            bgcolor:'#c62828',
                            color:'#fff',
                            fontFamily:'inherit',
                            fontSize:13,
                            fontWeight:800,
                            boxShadow:'0 5px 14px rgba(198,40,40,.16)',
                            transition:'background-color 180ms ease,box-shadow 180ms ease,transform 180ms ease',
                            ...(canHover?{
                                '&:hover':{bgcolor:'#a3151b',borderColor:'#a3151b',transform:'translateY(-1px)',boxShadow:'0 7px 16px rgba(198,40,40,.22)'}
                            }:{}),
                            '&:disabled':{bgcolor:'#bdb8b7',borderColor:'#bdb8b7',color:'#fff'}
                        }}
                    >
                        <Stack direction="row" spacing={.8} alignItems="center">
                            {isProductAlreadyInCart?'عرض السلة':'أضف إلى السلة'}
                            <AddShoppingCartOutlinedIcon sx={{fontSize:18}}/>
                        </Stack>
                    </LoadingButton>
                )}
            </Stack>
        </Card>
    )
}
