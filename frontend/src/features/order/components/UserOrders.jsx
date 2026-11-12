import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderByUserIdAsync, resetOrderFetchStatus, selectOrderFetchStatus, selectOrders } from '../OrderSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import {
    Button,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {Link} from 'react-router-dom'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import Lottie from 'lottie-react'
import { loadingAnimation, noOrdersAnimation } from '../../../assets'
import { toast } from 'react-toastify'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {motion} from 'framer-motion'


export const UserOrders = () => {

    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const orders=useSelector(selectOrders)
    const cartItems=useSelector(selectCartItems)
    const orderFetchStatus=useSelector(selectOrderFetchStatus)

    const theme=useTheme()
    const is660=useMediaQuery(theme.breakpoints.down(660))
    const is480=useMediaQuery(theme.breakpoints.down("480"))

    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    const [expandedOrderId,setExpandedOrderId]=React.useState('')
    
    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        dispatch(getOrderByUserIdAsync(loggedInUser?._id))
    },[dispatch])


    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Error adding product to cart, please try again later')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(orderFetchStatus==='rejected'){
            toast.error("Error fetching orders, please try again later")
        }
    },[orderFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetOrderFetchStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])


    const handleAddToCart=(product)=>{
        const item={user:loggedInUser._id,product:product._id,quantity:1}
        dispatch(addToCartAsync(item))
    }


  return (
    <Stack width="100%" minWidth={0} justifyContent={'center'} alignItems={'center'}>
        {
            orderFetchStatus==='pending'?
            <Stack width={is480?'auto':'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                <Lottie animationData={loadingAnimation}/>
            </Stack>
            :
            <Stack width="100%" maxWidth="60rem" minWidth={0} boxSizing="border-box" p={is480?2:4} mb={'5rem'}>
                
                {/* heading and navigation */}
                <Stack flexDirection={'row'} columnGap={2} >
                    {
                        !is480 && <motion.div whileHover={{x:-5}} style={{alignSelf:"center"}}>
                        <IconButton component={Link} to={"/"}><ArrowBackIcon fontSize='large'/></IconButton>
                    </motion.div>
                    }
    

                    <Stack rowGap={1} >
                        <Typography variant='h4' fontWeight={500}>{'Order history'}</Typography>
                        <Typography sx={{wordWrap:"break-word"}} color={'text.secondary'}>{'Check the status of recent orders, manage returns, and discover similar products.'}</Typography>
                    </Stack>

                </Stack>

                {/* orders */}
                <Stack mt={5} width="100%" minWidth={0}>
                        {orders.length>0 && (
                            <TableContainer
                                component={Paper}
                                elevation={1}
                                tabIndex={0}
                                aria-label="Scrollable order history table"
                                sx={{
                                    width:'100%',
                                    maxWidth:'100%',
                                    minWidth:0,
                                    borderRadius:2,
                                    overflowX:'auto',
                                    overscrollBehaviorX:'contain',
                                    WebkitOverflowScrolling:'touch'
                                }}
                            >
                                <Table size="small" sx={{minWidth:700}} aria-label={"Order history"}>
                                    <TableHead>
                                        <TableRow sx={{'& th':{color:'text.secondary',fontWeight:600,whiteSpace:'nowrap',borderBottom:'1px solid #e0e0e0'}}}>
                                            <TableCell padding="checkbox" />
                                            <TableCell>{'Order'}</TableCell>
                                            <TableCell>{'Items'}</TableCell>
                                            <TableCell align="right">{'Total'}</TableCell>
                                            <TableCell>{'Order date'}</TableCell>
                                            <TableCell>{'Status'}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders.map((order)=>{
                                            const expanded=expandedOrderId===order._id
                                            const orderItems=order.item || []
                                            const statusColors={
                                                Pending:{bgcolor:'#dfc9f7',color:'#7c59a4'},
                                                Dispatched:{bgcolor:'#feed80',color:'#927b1e'},
                                                'Out for delivery':{bgcolor:'#AACCFF',color:'#4793AA'},
                                                Delivered:{bgcolor:'#b3f5ca',color:'#548c6a'},
                                                Cancelled:{bgcolor:'#ffebee',color:'#c62828'}
                                            }

                                            return (
                                                <React.Fragment key={order._id}>
                                                    <TableRow hover sx={{'& td':{py:0.75,verticalAlign:'middle'},...(expanded?{'& td':{py:0.75,verticalAlign:'middle',borderBottom:0}}:{})}}>
                                                        <TableCell padding="checkbox">
                                                            <IconButton
                                                                size="small"
                                                                aria-label={expanded?'Hide order details':'Show order details'}
                                                                aria-expanded={expanded}
                                                                onClick={()=>setExpandedOrderId(expanded?'':order._id)}
                                                                sx={{transform:expanded?'rotate(180deg)':'rotate(0deg)',transition:'transform 200ms ease'}}
                                                            >
                                                                <KeyboardArrowDownIcon fontSize="small"/>
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell sx={{whiteSpace:'nowrap'}}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                #{order._id?.slice(-6).toUpperCase() || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{whiteSpace:'nowrap'}}>
                                                            {orderItems.length} {orderItems.length===1?'item':'items'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{whiteSpace:'nowrap',fontWeight:600}}>
                                                            ${Number(order.total || 0).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell sx={{whiteSpace:'nowrap'}}>
                                                            {Number.isNaN(new Date(order.createdAt).getTime())?'—':new Date(order.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={order.status}
                                                                size="small"
                                                                sx={statusColors[order.status] || {bgcolor:'#f5f5f5'}}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={6} sx={{p:0,borderBottom:expanded?'1px solid rgba(224, 224, 224, 1)':0}}>
                                                            <Collapse in={expanded} timeout={220} unmountOnExit>
                                                                <Stack spacing={1.5} sx={{px:3,py:2,backgroundColor:'action.hover'}}>
                                                                    <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" spacing={1}>
                                                                        <Typography variant="subtitle2">
                                                                            {'Order'} #{order._id?.slice(-6).toUpperCase() || '—'} · {order.paymentMode || 'Payment method unavailable'}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Total: ${Number(order.total || 0).toLocaleString()}
                                                                        </Typography>
                                                                    </Stack>
                                                                    {orderItems.map((entry,index)=>{
                                                                        const product=entry.product || {}
                                                                        const alreadyInCart=cartItems.some((cartItem)=>cartItem.product?._id===product._id)

                                                                        return (
                                                                            <Stack
                                                                                key={`${order._id}-${index}`}
                                                                                direction={{xs:'column',sm:'row'}}
                                                                                alignItems={{xs:'flex-start',sm:'center'}}
                                                                                spacing={1.5}
                                                                                sx={{py:1,borderTop:'1px solid',borderColor:'divider'}}
                                                                            >
                                                                                <img
                                                                                    style={{width:56,height:56,objectFit:'contain',borderRadius:6,background:'#fff'}}
                                                                                    src={product.thumbnail || product.images?.[0] || ''}
                                                                                    alt={product.title || 'Product'}
                                                                                />
                                                                                <Stack flex={1} spacing={0.25}>
                                                                                    <Typography variant="body2" fontWeight={600}>{product.title || 'Product'}</Typography>
                                                                                    {product.brand?.name && (
                                                                                        <Typography variant="caption" color="text.secondary">{product.brand.name}</Typography>
                                                                                    )}
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        Quantity: {entry.quantity} · ${Number(product.price || 0).toLocaleString()} each
                                                                                    </Typography>
                                                                                </Stack>
                                                                                {product._id && (
                                                                                    <Stack direction="row" spacing={1}>
                                                                                        <Button size="small" component={Link} to={`/product-details/${product._id}`} variant="outlined">
                                                                                            {'View product'}
                                                                                        </Button>
                                                                                        {alreadyInCart ? (
                                                                                            <Button size="small" variant="contained" component={Link} to="/cart">
                                                                                                {'Already in cart'}
                                                                                            </Button>
                                                                                        ) : (
                                                                                            <Button size="small" variant="contained" onClick={()=>handleAddToCart(product)}>
                                                                                                {'Buy again'}
                                                                                            </Button>
                                                                                        )}
                                                                                    </Stack>
                                                                                )}
                                                                            </Stack>
                                                                        )
                                                                    })}
                                                                </Stack>
                                                            </Collapse>
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* no orders animation */}
                        {
                        !orders.length && 
                            <Stack mt={is480?'2rem':0} mb={'7rem'} alignSelf={'center'} rowGap={2}>

                                <Stack width={is660?"auto":'30rem'} height={is660?"auto":'30rem'}>
                                    <Lottie animationData={noOrdersAnimation}/>
                                </Stack>

                                <Typography textAlign={'center'} alignSelf={'center'} variant='h6' >{"oh! Looks like you haven't been shopping lately"}</Typography>

                            </Stack>
                        }

                </Stack>
            
            </Stack>
        
        }

    </Stack>
  )
}
