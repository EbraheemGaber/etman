import { useEffect, useState } from 'react'
import { Box, Button, Grid, IconButton, Paper, Radio, Stack, TextField, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { toast } from 'react-toastify'
import { addAddressAsync, selectAddressAddStatus, selectAddresses } from '../../address/AddressSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { createOrderAsync, selectCurrentOrder, selectOrderStatus } from '../../order/OrderSlice'
import { resetCartByUserIdAsync, selectCartItems, selectCartStatus } from '../../cart/CartSlice'
import { SHIPPING, TAXES } from '../../../constants'

const formatPrice=(value)=>new Intl.NumberFormat('ar-EG-u-nu-latn',{
  maximumFractionDigits:2
}).format(value)

const ltrFieldSx={
  '& input, & textarea':{direction:'ltr',textAlign:'left'},
  '& input::placeholder, & textarea::placeholder':{direction:'ltr',textAlign:'left',opacity:1}
}

const ltrInputProps={dir:'ltr'}

const OrderSummary=({items,subtotal,onContinue,buttonLabel,isSubmitting})=>{
  const total=subtotal+SHIPPING+TAXES

  return (
    <Paper
      elevation={0}
      dir="rtl"
      lang="ar"
      sx={{
        position:{lg:'sticky'},
        top:{lg:24},
        p:{xs:2,sm:2.5},
        border:'1px solid #f0d7d9',
        borderRadius:3,
        bgcolor:'#fff',
        boxShadow:'0 14px 36px rgba(117,29,36,.08)',
        fontFamily:'Cairo, Tahoma, sans-serif',
        '& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb:2}}>
        <Typography component="h2" sx={{fontSize:20,fontWeight:800,color:'#2a2021'}}>
          {'ملخص الطلب'}
        </Typography>
        <Typography sx={{fontSize:12,fontWeight:700,color:'#a5272d',bgcolor:'#fff1f1',px:1.2,py:.55,borderRadius:99}}>
          {`${items.length} ${items.length===1?'منتج':'منتجات'}`}
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{maxHeight:{xs:240,lg:310},overflowY:'auto',pr:.25}}>
        {items.map((item)=>(
          <Stack key={item._id} direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width:58,
                height:58,
                flexShrink:0,
                display:'grid',
                placeItems:'center',
                overflow:'hidden',
                borderRadius:1.5,
                bgcolor:'#fff6f6'
              }}
            >
              <Box
                component="img"
                src={item.product.thumbnail}
                alt={item.product.title}
                sx={{width:'90%',height:'90%',objectFit:'contain',mixBlendMode:'multiply'}}
              />
            </Box>
            <Stack sx={{flex:1,minWidth:0}}>
              <Typography
                sx={{
                  fontSize:13,
                  fontWeight:700,
                  color:'#302526',
                  lineHeight:1.45,
                  display:'-webkit-box',
                  WebkitBoxOrient:'vertical',
                  WebkitLineClamp:2,
                  overflow:'hidden'
                }}
              >
                {item.product.title}
              </Typography>
              <Typography sx={{mt:.35,fontSize:11,color:'#817475'}}>
                {`${item.quantity} × ${formatPrice(item.product.price)} ج.م`}
              </Typography>
            </Stack>
            <Typography dir="ltr" sx={{flexShrink:0,fontSize:12,fontWeight:800,color:'#3b3031'}}>
              {`${formatPrice(item.product.price*item.quantity)} ج.م`}
            </Typography>
          </Stack>
        ))}
        {!items.length && (
          <Typography sx={{py:2,color:'#7b7071',fontSize:13,textAlign:'center'}}>
            {'سلة التسوق فارغة'}
          </Typography>
        )}
      </Stack>

      <Box sx={{height:1,bgcolor:'#f0e5e5',my:2}} />
      <Stack spacing={1.2}>
        <SummaryRow label="المجموع الفرعي" value={`${formatPrice(subtotal)} ج.م`}/>
        <SummaryRow label="الشحن" value={`${formatPrice(SHIPPING)} ج.م`}/>
        <SummaryRow label="الضرائب" value={`${formatPrice(TAXES)} ج.م`}/>
        <SummaryRow label="طريقة الدفع" value="الدفع عند الاستلام"/>
      </Stack>
      <Box sx={{height:1,bgcolor:'#ead9da',my:2}} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{fontSize:15,fontWeight:800,color:'#302526'}}>{'الإجمالي'}</Typography>
        <Typography dir="ltr" sx={{fontSize:19,fontWeight:900,color:'#c62828'}}>
          {`${formatPrice(total)} ج.م`}
        </Typography>
      </Stack>
      <LoadingButton
        fullWidth
        loading={isSubmitting}
        disabled={!items.length}
        variant="contained"
        onClick={onContinue}
        sx={{
          mt:2.5,
          py:1.35,
          borderRadius:2,
          bgcolor:'#c62828',
          color:'#fff',
          fontWeight:800,
          boxShadow:'0 7px 16px rgba(198,40,40,.18)',
          '&:hover':{bgcolor:'#a3151b'},
          '&:disabled':{bgcolor:'#c7b9ba',color:'#fff'}
        }}
      >
        {buttonLabel}
      </LoadingButton>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={.75} sx={{mt:1.25,color:'#817475'}}>
        <LocalShippingOutlinedIcon sx={{fontSize:16}}/>
        <Typography sx={{fontSize:11}}>{'توصيل آمن من عتمان جروب'}</Typography>
      </Stack>
    </Paper>
  )
}

const SummaryRow=({label,value})=>(
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography sx={{fontSize:13,color:'#766b6c'}}>{label}</Typography>
    <Typography dir="ltr" sx={{fontSize:13,fontWeight:700,color:'#392e2f'}}>{value}</Typography>
  </Stack>
)

export const Checkout = () => {
  const addresses=useSelector(selectAddresses)
  const [selectedAddress,setSelectedAddress]=useState(addresses[0])
  const { register, handleSubmit, reset } = useForm()
  const dispatch=useDispatch()
  const loggedInUser=useSelector(selectLoggedInUser)
  const addressAddStatus=useSelector(selectAddressAddStatus)
  const navigate=useNavigate()
  const cartItems=useSelector(selectCartItems)
  const cartStatus=useSelector(selectCartStatus)
  const orderStatus=useSelector(selectOrderStatus)
  const currentOrder=useSelector(selectCurrentOrder)
  const orderTotal=cartItems.reduce((acc,item)=>(item.product.price*item.quantity)+acc,0)

  useEffect(()=>{
    if(addressAddStatus==='fulfilled'){
      setSelectedAddress(addresses[addresses.length-1])
      reset()
    }else if(addressAddStatus==='rejected'){
      toast.error('تعذر حفظ العنوان. يرجى المحاولة مرة أخرى.')
    }
  },[addressAddStatus,addresses,reset])

  useEffect(()=>{
    if(!selectedAddress && addresses.length>0){
      setSelectedAddress(addresses[0])
    }
  },[addresses,selectedAddress])

  useEffect(()=>{
    if(currentOrder?._id){
      dispatch(resetCartByUserIdAsync(loggedInUser?._id))
      navigate(`/order-success/${currentOrder._id}`)
    }
  },[currentOrder,dispatch,loggedInUser?._id,navigate])

  useEffect(()=>{
    if(cartStatus==='fulfilled' && cartItems.length===0){
      navigate('/cart')
    }
  },[cartStatus,cartItems.length,navigate])

  const handleAddAddress=(data)=>{
    const address={...data,user:loggedInUser._id}
    dispatch(addAddressAsync(address))
  }

  const handleCreateOrder=()=>{
    if(!selectedAddress){
      toast.error('يرجى اختيار عنوان الشحن أولاً.')
      return
    }
    const order={
      user:loggedInUser._id,
      item:cartItems,
      address:selectedAddress,
      paymentMode:'COD',
      total:orderTotal+SHIPPING+TAXES
    }
    dispatch(createOrderAsync(order))
  }

  return (
    <Box
      dir="rtl"
      lang="ar"
      sx={{
        bgcolor:'#faf7f6',
        px:{xs:1.5,sm:3},
        py:{xs:2,sm:4},
        pb:{xs:'calc(64px + env(safe-area-inset-bottom) + 1rem)',sm:4},
        fontFamily:'Cairo, Tahoma, sans-serif',
        '& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}
      }}
    >
      <Box sx={{maxWidth:1240,mx:'auto'}}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems={{xs:'stretch',sm:'center'}}
          gap={2}
          sx={{
            mb:2.5,
            p:{xs:1.75,sm:2.25},
            border:'1px solid #f0dedd',
            borderRadius:2.5,
            bgcolor:'#fff',
            boxShadow:'0 6px 22px rgba(85,30,34,.04)'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <IconButton
              aria-label="العودة إلى السلة"
              onClick={()=>navigate('/cart')}
              sx={{border:'1px solid #f0d7d9',color:'#c62828',bgcolor:'#fffafa'}}
            >
              <ArrowBackIcon/>
            </IconButton>
            <Stack spacing={.15}>
              <Typography sx={{fontSize:12,fontWeight:900,letterSpacing:1.3,color:'#c62828'}} dir="ltr">
                {'ETMAN GROUP'}
              </Typography>
              <Typography component="h1" sx={{fontSize:20,fontWeight:800,color:'#302526'}}>
                {'إتمام الطلب'}
              </Typography>
            </Stack>
          </Stack>

        </Stack>

        <Box
          sx={{
            display:'grid',
            gridTemplateColumns:{xs:'minmax(0,1fr)',lg:'minmax(0,1fr) 370px'},
            gridTemplateAreas:{xs:'"main" "summary"',lg:'"main summary"'},
            gap:{xs:2,md:3},
            alignItems:'start',
            direction:'ltr'
          }}
        >
          <Box sx={{gridArea:'main',minWidth:0,direction:'rtl'}}>
            <Stack spacing={2.25}>
                    <Paper elevation={0} sx={{p:{xs:2,sm:3},border:'1px solid #f0dedd',borderRadius:2.5,bgcolor:'#fff'}}>
                      <Stack spacing={.5} sx={{mb:2.5}}>
                        <Typography component="h2" sx={{fontSize:20,fontWeight:800,color:'#302526'}}>
                          {'معلومات الشحن'}
                        </Typography>
                        <Typography sx={{fontSize:13,color:'#807475'}}>
                          {'أدخل بيانات التوصيل أو اختر عنواناً محفوظاً.'}
                        </Typography>
                      </Stack>

                      <Box component="form" noValidate onSubmit={handleSubmit(handleAddAddress)}>
                        <Grid container spacing={1.75}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="نوع العنوان"
                              placeholder="المنزل أو العمل"
                              {...register('type',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="رقم الهاتف"
                              type="tel"
                              {...register('phoneNumber',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="العنوان والشارع"
                              {...register('street',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="المدينة"
                              {...register('city',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="المحافظة"
                              {...register('state',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="الدولة"
                              {...register('country',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="الرمز البريدي"
                              {...register('postalCode',{required:true})}
                              inputProps={ltrInputProps}
                              sx={{...ltrFieldSx,'& .MuiOutlinedInput-root':{borderRadius:1.75,bgcolor:'#fff'}}}
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="flex-start" spacing={1.25} sx={{mt:2}}>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={()=>reset()}
                            sx={{borderRadius:1.75,borderColor:'#d9c4c5',color:'#6e5557',px:2.5,fontWeight:700}}
                          >
                            {'مسح'}
                          </Button>
                          <LoadingButton
                            type="submit"
                            loading={addressAddStatus==='pending'}
                            variant="contained"
                            sx={{borderRadius:1.75,bgcolor:'#c62828',px:2.5,fontWeight:800,'&:hover':{bgcolor:'#a3151b'}}}
                          >
                            {'حفظ العنوان'}
                          </LoadingButton>
                        </Stack>
                      </Box>
                    </Paper>

                    <Paper elevation={0} sx={{p:{xs:2,sm:3},border:'1px solid #f0dedd',borderRadius:2.5,bgcolor:'#fff'}}>
                      <Typography component="h2" sx={{mb:1.5,fontSize:17,fontWeight:800,color:'#302526'}}>
                        {'عناويني المحفوظة'}
                      </Typography>
                      {addresses.length===0?(
                        <Typography sx={{py:1,color:'#807475',fontSize:13}}>
                          {'لا توجد عناوين محفوظة. احفظ عنواناً جديداً للمتابعة.'}
                        </Typography>
                      ):(
                        <Stack spacing={1}>
                          {addresses.map((address)=>(
                            <Paper
                              key={address._id}
                              component="button"
                              type="button"
                              elevation={0}
                              onClick={()=>setSelectedAddress(address)}
                              sx={{
                                width:'100%',
                                p:1.5,
                                textAlign:'right',
                                cursor:'pointer',
                                border:selectedAddress?._id===address._id?'1px solid #c62828':'1px solid #eee3e3',
                                borderRadius:1.75,
                                bgcolor:selectedAddress?._id===address._id?'#fff7f7':'#fff',
                                color:'inherit',
                                fontFamily:'inherit'
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack spacing={.35}>
                                  <Typography sx={{fontWeight:800,fontSize:13}}>{address.type}</Typography>
                                  <Typography sx={{fontSize:12,color:'#766b6c'}}>
                                    {[address.street,address.city,address.state,address.country,address.postalCode].filter(Boolean).join('، ')}
                                  </Typography>
                                  <Typography sx={{fontSize:12,color:'#766b6c'}}>{address.phoneNumber}</Typography>
                                </Stack>
                                <Radio
                                  checked={selectedAddress?._id===address._id}
                                  inputProps={{'aria-label':`اختيار عنوان ${address.type}`}}
                                  sx={{color:'#c62828','&.Mui-checked':{color:'#c62828'}}}
                                />
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
            </Stack>
          </Box>

          <Box component="aside" sx={{gridArea:'summary',minWidth:0,direction:'rtl'}}>
            <OrderSummary
              items={cartItems}
              subtotal={orderTotal}
              buttonLabel="تأكيد الطلب"
              isSubmitting={orderStatus==='pending'}
              onContinue={handleCreateOrder}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
