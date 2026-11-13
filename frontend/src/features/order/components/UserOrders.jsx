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

const formatOrderDate=(value)=>{
    const date=new Date(value)
    if(Number.isNaN(date.getTime())) return '—'
    const year=date.toLocaleString('ar-EG-u-nu-latn',{year:'numeric'})
    const month=date.toLocaleString('ar-EG-u-nu-latn',{month:'2-digit'})
    const day=date.toLocaleString('ar-EG-u-nu-latn',{day:'2-digit'})
    return `${year}/${month}/${day}`
}

const formatCurrency=(value)=>`ج.م ${Number(value || 0).toLocaleString('ar-EG-u-nu-latn')}`

const orderStatusLabels={
    Pending:'قيد الانتظار',
    Approved:'تمت الموافقة',
    Rejected:'مرفوض',
    Dispatched:'تم الشحن',
    'Out for delivery':'قيد التوصيل',
    Delivered:'تم التوصيل',
    Cancelled:'ملغي'
}

const paymentModeLabels={
    COD:'الدفع نقدًا عند الاستلام',
    CARD:'الدفع بالبطاقة'
}


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
            toast.success("تمت إضافة المنتج إلى سلة التسوق")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('تعذرت إضافة المنتج إلى سلة التسوق. يرجى المحاولة لاحقًا.')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(orderFetchStatus==='rejected'){
            toast.error("تعذر تحميل الطلبات. يرجى المحاولة مرة أخرى.")
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
    <Stack
        width="100%"
        minWidth={0}
        justifyContent={'center'}
        alignItems={'center'}
        dir="rtl"
        lang="ar"
        sx={{fontFamily:'Cairo, Tahoma, sans-serif','& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}}}
    >
        {
            orderFetchStatus==='pending'?
            <Stack width={is480?'auto':'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                <Lottie animationData={loadingAnimation}/>
            </Stack>
            :
            <Stack width="100%" maxWidth="42rem" minWidth={0} boxSizing="border-box" px={is480?2:3} pt={is480?2:3} pb={8}>
                
                {/* heading and navigation */}
                <Stack flexDirection={'row'} columnGap={1.5} alignItems="center" textAlign="right">
                    {
                        !is480 && <motion.div whileHover={{x:-5}} style={{alignSelf:"center"}}>
                        <IconButton component={Link} to={"/"} aria-label="العودة إلى الرئيسية"><ArrowBackIcon fontSize='large'/></IconButton>
                    </motion.div>
                    }
    

                    <Stack rowGap={0.5} flex={1}>
                        <Typography variant='h4' fontWeight={500}>{'سجل الطلبات'}</Typography>
                        <Typography sx={{wordWrap:"break-word"}} color={'text.secondary'}>{'تابع حالة طلباتك الأخيرة واستعرض تفاصيلها ومنتجاتها.'}</Typography>
                    </Stack>

                </Stack>

                {/* orders */}
                <Stack mt={3} width="100%" minWidth={0}>
                        {orders.length>0 && (
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                tabIndex={0}
                                aria-label="جدول سجل الطلبات القابل للتمرير"
                                sx={{
                                    width:'100%',
                                    maxWidth:'100%',
                                    minWidth:0,
                                    border:'1px solid #e0e0e0',
                                    borderRadius:0,
                                    overflowX:'auto',
                                    overscrollBehaviorX:'contain',
                                    WebkitOverflowScrolling:'touch'
                                }}
                            >
                                <Table size="small" sx={{minWidth:620}} aria-label={"سجل الطلبات"}>
                                    <TableHead>
                                        <TableRow sx={{'& th':{color:'text.secondary',fontWeight:600,whiteSpace:'nowrap',borderBottom:'1px solid #e0e0e0'}}}>
                                            <TableCell padding="checkbox" />
                                            <TableCell>{'رقم الطلب'}</TableCell>
                                            <TableCell>{'المنتجات'}</TableCell>
                                            <TableCell align="right">{'الإجمالي'}</TableCell>
                                            <TableCell>{'تاريخ الطلب'}</TableCell>
                                            <TableCell>{'الحالة'}</TableCell>
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
                                                                aria-label={expanded?'إخفاء تفاصيل الطلب':'عرض تفاصيل الطلب'}
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
                                                            {orderItems.length} {orderItems.length===1?'منتج':'منتجات'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{whiteSpace:'nowrap',fontWeight:600}}>
                                                            {formatCurrency(order.total)}
                                                        </TableCell>
                                                        <TableCell sx={{whiteSpace:'nowrap'}}>
                                                            {formatOrderDate(order.createdAt)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={orderStatusLabels[order.status] || order.status}
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
                                                                            {'الطلب'} #{order._id?.slice(-6).toUpperCase() || '—'} · {paymentModeLabels[order.paymentMode] || order.paymentMode || 'طريقة الدفع غير متاحة'}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            الإجمالي: {formatCurrency(order.total)}
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
                                                                                    alt={product.title || 'المنتج'}
                                                                                />
                                                                                <Stack flex={1} spacing={0.25}>
                                                                                    <Typography variant="body2" fontWeight={600}>{product.title || 'المنتج'}</Typography>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        الكمية: {entry.quantity} · {formatCurrency(product.price)} للقطعة
                                                                                    </Typography>
                                                                                </Stack>
                                                                                {product._id && (
                                                                                    <Stack direction="row" spacing={1}>
                                                                                        <Button size="small" component={Link} to={`/product-details/${product._id}`} variant="outlined">
                                                                                            {'عرض المنتج'}
                                                                                        </Button>
                                                                                        {alreadyInCart ? (
                                                                                            <Button size="small" variant="contained" component={Link} to="/cart">
                                                                                                {'موجود في السلة'}
                                                                                            </Button>
                                                                                        ) : (
                                                                                            <Button size="small" variant="contained" onClick={()=>handleAddToCart(product)}>
                                                                                                {'اشترِ مرة أخرى'}
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

                                <Typography textAlign={'center'} alignSelf={'center'} variant='h6' >{"لا توجد طلبات حتى الآن. ابدأ التسوق الآن!"}</Typography>

                            </Stack>
                        }

                </Stack>
            
            </Stack>
        
        }

    </Stack>
  )
}
