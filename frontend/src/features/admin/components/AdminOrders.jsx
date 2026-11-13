import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllOrdersAsync,
  resetOrderUpdateStatus,
  selectOrderFetchStatus,
  selectOrderUpdateStatus,
  selectOrders,
  updateOrderByIdAsync
} from '../../order/OrderSlice'
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
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
  Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { toast } from 'react-toastify'
import { noOrdersAnimation } from '../../../assets/index'
import Lottie from 'lottie-react'

const statusLabels={
  Pending:'قيد الانتظار',
  Dispatched:'تم الشحن',
  'Out for delivery':'قيد التوصيل',
  Delivered:'تم التوصيل',
  Cancelled:'ملغي',
  Approved:'تمت الموافقة',
  Rejected:'مرفوض'
}
const archivedStatuses=['Approved','Rejected']
const paymentModeLabels={
  COD:'الدفع نقدًا عند الاستلام',
  CARD:'الدفع بالبطاقة',
  UPI:'الدفع عبر UPI'
}

const getStatusColor=(status)=>{
  if(status==='Pending') return {bgcolor:'#c8e6c9',color:'#256029'}
  if(status==='Dispatched') return {bgcolor:'#feed80',color:'#927b1e'}
  if(status==='Out for delivery') return {bgcolor:'#AACCFF',color:'#4793AA'}
  if(status==='Delivered') return {bgcolor:'#b3f5ca',color:'#548c6a'}
  if(status==='Cancelled') return {bgcolor:'#ffebee',color:'#c62828'}
  if(status==='Approved') return {bgcolor:'#e3f2fd',color:'#1565c0'}
  if(status==='Rejected') return {bgcolor:'#ffebee',color:'#c62828'}
  return {bgcolor:'#f5f5f5',color:'text.primary'}
}

const formatCurrency=(amount)=>new Intl.NumberFormat('en-US',{
  style:'currency',
  currency:'USD'
}).format(Number(amount) || 0)

const formatDate=(date)=>{
  const parsedDate=new Date(date)
  return Number.isNaN(parsedDate.getTime())?'—':parsedDate.toLocaleDateString('ar-EG-u-nu-latn')
}

export const AdminOrders=({archiveMode=false})=>{
  const dispatch=useDispatch()
  const orders=useSelector(selectOrders)
  const fetchStatus=useSelector(selectOrderFetchStatus)
  const updateStatus=useSelector(selectOrderUpdateStatus)
  const [expandedId,setExpandedId]=useState('')
  const visibleOrders=orders.filter((order)=>(
    archiveMode
      ? archivedStatuses.includes(order.status)
      : !archivedStatuses.includes(order.status)
  ))

  useEffect(()=>{
    dispatch(getAllOrdersAsync())
  },[dispatch])

  useEffect(()=>{
    return ()=>dispatch(resetOrderUpdateStatus())
  },[dispatch])

  const toggleExpanded=(order)=>{
    setExpandedId(expandedId!==order._id?order._id:'')
  }

  const updateOrderStatus=async(order,status)=>{
    try{
      await dispatch(updateOrderByIdAsync({_id:order._id,status})).unwrap()
      toast.success('تم تحديث الحالة')
    }catch{
      toast.error('تعذر تحديث حالة الطلب')
    }
  }

  return (
    <Stack dir="rtl" lang="ar" maxWidth="xl" mx="auto" p={{xs:2,md:4}} spacing={2} mb={5}>
      <Typography variant="h4" fontWeight={600}>
        {archiveMode?'أرشيف طلبات العملاء':'طلبات العملاء'}
      </Typography>
      {fetchStatus==='rejected' && <Alert severity="error">{'تعذر تحميل طلبات العملاء.'}</Alert>}
      {fetchStatus==='pending' ? (
        <Stack alignItems="center" py={8}><CircularProgress/></Stack>
      ) : visibleOrders.length ? (
        <TableContainer component={Paper} elevation={1} sx={{borderRadius:2,overflowX:'auto'}}>
          <Table size="small" dir="rtl" sx={{minWidth:900}} aria-label={'طلبات العملاء'}>
            <TableHead>
              <TableRow sx={{'& th':{color:'text.secondary',fontWeight:600,whiteSpace:'nowrap',borderBottom:'1px solid #e0e0e0'}}}>
                <TableCell padding="checkbox" />
                <TableCell>{'الطلب'}</TableCell>
                <TableCell>{'المنتجات'}</TableCell>
                <TableCell align="right">{'الإجمالي'}</TableCell>
                <TableCell>{'الدفع'}</TableCell>
                <TableCell>{'تاريخ الطلب'}</TableCell>
                <TableCell>{'الحالة'}</TableCell>
                <TableCell align="right">{'الإجراءات'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleOrders.map((order)=>{
                const expanded=expandedId===order._id
                const items=order.item || []
                const address=Array.isArray(order.address)?order.address[0]:order.address

                return (
                  <React.Fragment key={order._id}>
                    <TableRow
                      hover
                      sx={{
                        ...(order.status==='Pending'?{
                          bgcolor:'#e8f5e9',
                          '&:hover':{bgcolor:'#dff1e2'}
                        }:{}),
                        '& td':{py:0.75,verticalAlign:'middle'},
                        ...(expanded?{'& td':{py:0.75,verticalAlign:'middle',borderBottom:0}}:{})
                      }}
                    >
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          aria-label={expanded?'إخفاء تفاصيل الطلب':'عرض تفاصيل الطلب'}
                          aria-expanded={expanded}
                          onClick={()=>toggleExpanded(order)}
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
                      <TableCell sx={{whiteSpace:'nowrap'}}>{items.length} {items.length===1?'منتج':'منتجات'}</TableCell>
                      <TableCell align="right" sx={{whiteSpace:'nowrap',fontWeight:600}}>
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}}>{paymentModeLabels[order.paymentMode] || order.paymentMode || '—'}</TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}}>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Chip label={statusLabels[order.status] || order.status} size="small" sx={getStatusColor(order.status)}/>
                      </TableCell>
                      <TableCell align="right">
                        {order.status==='Pending' ? (
                          <Stack direction="row" spacing={0.5} justifyContent="flex-start">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={updateStatus==='pending'}
                              onClick={()=>updateOrderStatus(order,'Approved')}
                            >
                              {'قبول'}
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={updateStatus==='pending'}
                              onClick={()=>updateOrderStatus(order,'Rejected')}
                            >
                              {'رفض'}
                            </Button>
                          </Stack>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={order.status==='Pending'?{'& > td':{bgcolor:'#e8f5e9'}}:{}}>
                      <TableCell colSpan={8} sx={{p:0,borderBottom:expanded?'1px solid rgba(224, 224, 224, 1)':0}}>
                        <Collapse in={expanded} timeout={220} unmountOnExit>
                          <Stack
                            direction={{xs:'column',md:'row'}}
                            spacing={{xs:2,md:4}}
                            sx={{px:3,py:2,backgroundColor:order.status==='Pending'?'#e8f5e9':'action.hover'}}
                          >
                            <Stack spacing={0.75} flex={1}>
                              <Typography variant="subtitle2">{'منتجات الطلب'}</Typography>
                              {items.map((entry,index)=>(
                                <Stack
                                  key={`${order._id}-${index}`}
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Avatar src={entry.product?.thumbnail} variant="rounded" sx={{width:36,height:36}}/>
                                  <Typography variant="body2" sx={{flex:1}}>
                                    {entry.product?.title || 'منتج'} × {entry.quantity}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatCurrency((entry.product?.price || 0)*(entry.quantity || 1))}
                                  </Typography>
                                </Stack>
                              ))}
                              <Typography variant="body2" fontWeight={600} sx={{pt:0.5}}>
                                الإجمالي: {formatCurrency(order.total)}
                              </Typography>
                            </Stack>
                            <Stack spacing={0.5} minWidth={{md:220}}>
                              <Typography variant="subtitle2">{'عنوان الشحن'}</Typography>
                              {address ? (
                                <>
                                  {address.street && <Typography variant="body2" color="text.secondary">{address.street}</Typography>}
                                  {[address.city,address.state,address.postalCode].filter(Boolean).length ? (
                                    <Typography variant="body2" color="text.secondary">
                                      {[address.city,address.state,address.postalCode].filter(Boolean).join(', ')}
                                    </Typography>
                                  ) : null}
                                </>
                              ) : <Typography variant="body2" color="text.secondary">{'عنوان الشحن غير متاح'}</Typography>}
                              <Typography variant="body2" color="text.secondary">
                                {'الدفع'}: {paymentModeLabels[order.paymentMode] || order.paymentMode || '—'}
                              </Typography>
                            </Stack>
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
      ) : fetchStatus==='rejected' ? null : (
        <Stack width={{xs:'auto',sm:'30rem'}} alignSelf="center" justifyContent="center">
          <Lottie animationData={noOrdersAnimation}/>
          <Typography textAlign="center" variant="h6" fontWeight={400}>
            {archiveMode?'لا توجد طلبات مؤرشفة حالياً':'لا توجد طلبات حالياً'}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
