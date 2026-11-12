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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

const editOptions=['Pending','Dispatched','Out for delivery','Delivered','Cancelled']

const getStatusColor=(status)=>{
  if(status==='Pending') return {bgcolor:'#dfc9f7',color:'#7c59a4'}
  if(status==='Dispatched') return {bgcolor:'#feed80',color:'#927b1e'}
  if(status==='Out for delivery') return {bgcolor:'#AACCFF',color:'#4793AA'}
  if(status==='Delivered') return {bgcolor:'#b3f5ca',color:'#548c6a'}
  if(status==='Cancelled') return {bgcolor:'#ffebee',color:'#c62828'}
  return {bgcolor:'#f5f5f5',color:'text.primary'}
}

const formatCurrency=(amount)=>new Intl.NumberFormat('en-US',{
  style:'currency',
  currency:'USD'
}).format(Number(amount) || 0)

const formatDate=(date)=>{
  const parsedDate=new Date(date)
  return Number.isNaN(parsedDate.getTime())?'—':parsedDate.toLocaleDateString()
}

export const AdminOrders=()=>{
  const dispatch=useDispatch()
  const orders=useSelector(selectOrders)
  const fetchStatus=useSelector(selectOrderFetchStatus)
  const updateStatus=useSelector(selectOrderUpdateStatus)
  const [expandedId,setExpandedId]=useState('')
  const [selectedStatuses,setSelectedStatuses]=useState({})

  useEffect(()=>{
    dispatch(getAllOrdersAsync())
  },[dispatch])

  useEffect(()=>{
    if(updateStatus==='fulfilled'){
      toast.success('Status updated')
    }else if(updateStatus==='rejected'){
      toast.error('Error updating order status')
    }
  },[updateStatus])

  useEffect(()=>{
    return ()=>dispatch(resetOrderUpdateStatus())
  },[dispatch])

  const toggleExpanded=(order)=>{
    const opening=expandedId!==order._id
    setExpandedId(opening?order._id:'')
    if(opening){
      setSelectedStatuses((current)=>({...current,[order._id]:order.status}))
    }
  }

  const saveStatus=(order)=>{
    dispatch(updateOrderByIdAsync({
      _id:order._id,
      status:selectedStatuses[order._id] || order.status
    }))
  }

  return (
    <Stack maxWidth="xl" mx="auto" p={{xs:2,md:4}} spacing={2} mb={5}>
      <Typography variant="h4" fontWeight={600}>{'Customer orders'}</Typography>
      {fetchStatus==='rejected' && <Alert severity="error">{'Unable to load customer orders.'}</Alert>}
      {fetchStatus==='pending' ? (
        <Stack alignItems="center" py={8}><CircularProgress/></Stack>
      ) : orders.length ? (
        <TableContainer component={Paper} elevation={1} sx={{borderRadius:2,overflowX:'auto'}}>
          <Table size="small" sx={{minWidth:900}} aria-label={'Customer orders'}>
            <TableHead>
              <TableRow sx={{'& th':{color:'text.secondary',fontWeight:600,whiteSpace:'nowrap',borderBottom:'1px solid #e0e0e0'}}}>
                <TableCell padding="checkbox" />
                <TableCell>{'Order'}</TableCell>
                <TableCell>{'Items'}</TableCell>
                <TableCell align="right">{'Total'}</TableCell>
                <TableCell>{'Payment'}</TableCell>
                <TableCell>{'Order date'}</TableCell>
                <TableCell>{'Status'}</TableCell>
                <TableCell align="right">{'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order)=>{
                const expanded=expandedId===order._id
                const items=order.item || []
                const address=Array.isArray(order.address)?order.address[0]:order.address
                const selectedStatus=selectedStatuses[order._id] || order.status

                return (
                  <React.Fragment key={order._id}>
                    <TableRow
                      hover
                      sx={{
                        '& td':{py:0.75,verticalAlign:'middle'},
                        ...(expanded?{'& td':{py:0.75,verticalAlign:'middle',borderBottom:0}}:{})
                      }}
                    >
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          aria-label={expanded?'Hide order details':'Show order details'}
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
                      <TableCell sx={{whiteSpace:'nowrap'}}>{items.length} {items.length===1?'item':'items'}</TableCell>
                      <TableCell align="right" sx={{whiteSpace:'nowrap',fontWeight:600}}>
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}}>{order.paymentMode || '—'}</TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}}>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Chip label={order.status} size="small" sx={getStatusColor(order.status)}/>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={()=>toggleExpanded(order)}>
                          {expanded?'Hide details':'Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} sx={{p:0,borderBottom:expanded?'1px solid rgba(224, 224, 224, 1)':0}}>
                        <Collapse in={expanded} timeout={220} unmountOnExit>
                          <Stack
                            direction={{xs:'column',md:'row'}}
                            spacing={{xs:2,md:4}}
                            sx={{px:3,py:2,backgroundColor:'action.hover'}}
                          >
                            <Stack spacing={0.75} flex={1}>
                              <Typography variant="subtitle2">{'Order items'}</Typography>
                              {items.map((entry,index)=>(
                                <Stack
                                  key={`${order._id}-${index}`}
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Avatar src={entry.product?.thumbnail} variant="rounded" sx={{width:36,height:36}}/>
                                  <Typography variant="body2" sx={{flex:1}}>
                                    {entry.product?.title || 'Product'} × {entry.quantity}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatCurrency((entry.product?.price || 0)*(entry.quantity || 1))}
                                  </Typography>
                                </Stack>
                              ))}
                              <Typography variant="body2" fontWeight={600} sx={{pt:0.5}}>
                                Total: {formatCurrency(order.total)}
                              </Typography>
                            </Stack>
                            <Stack spacing={0.5} minWidth={{md:220}}>
                              <Typography variant="subtitle2">{'Shipping address'}</Typography>
                              {address ? (
                                <>
                                  {address.street && <Typography variant="body2" color="text.secondary">{address.street}</Typography>}
                                  {[address.city,address.state,address.postalCode].filter(Boolean).length ? (
                                    <Typography variant="body2" color="text.secondary">
                                      {[address.city,address.state,address.postalCode].filter(Boolean).join(', ')}
                                    </Typography>
                                  ) : null}
                                </>
                              ) : <Typography variant="body2" color="text.secondary">{'Address unavailable'}</Typography>}
                              <Typography variant="body2" color="text.secondary">
                                {'Payment'}: {order.paymentMode || '—'}
                              </Typography>
                            </Stack>
                            <Stack spacing={1} minWidth={{md:200}}>
                              <Typography variant="subtitle2">{'Update status'}</Typography>
                              <FormControl size="small" fullWidth>
                                <InputLabel id={`order-status-label-${order._id}`}>{'Status'}</InputLabel>
                                <Select
                                  labelId={`order-status-label-${order._id}`}
                                  value={selectedStatus}
                                  label={'Status'}
                                  onChange={(event)=>setSelectedStatuses((current)=>({
                                    ...current,
                                    [order._id]:event.target.value
                                  }))}
                                >
                                  {editOptions.map((option)=>(
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={updateStatus==='pending' || selectedStatus===order.status}
                                onClick={()=>saveStatus(order)}
                              >
                                {'Save status'}
                              </Button>
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
            {'There are no orders currently'}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
