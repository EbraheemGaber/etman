import { Stack, TextField, Typography, Button, Radio, Paper, IconButton, Box, useMediaQuery, useTheme } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import React, { useEffect, useState } from 'react'
import { Cart } from '../../cart/components/Cart'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { addAddressAsync, selectAddressAddStatus, selectAddresses } from '../../address/AddressSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { useNavigate } from 'react-router-dom'
import { createOrderAsync, selectCurrentOrder, selectOrderStatus } from '../../order/OrderSlice'
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-toastify'


export const Checkout = () => {

    const addresses=useSelector(selectAddresses)
    const [selectedAddress,setSelectedAddress]=useState(addresses[0])
    const [selectedPaymentMethod,setSelectedPaymentMethod]=useState('COD')
    const [step,setStep]=useState(1)
    const { register, handleSubmit, reset } = useForm()
    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const addressAddStatus=useSelector(selectAddressAddStatus)
    const navigate=useNavigate()
    const cartItems=useSelector(selectCartItems)
    const orderStatus=useSelector(selectOrderStatus)
    const currentOrder=useSelector(selectCurrentOrder)
    const orderTotal=cartItems.reduce((acc,item)=>(item.product.price*item.quantity)+acc,0)
    const theme=useTheme()
    const is480=useMediaQuery(theme.breakpoints.down(480))
    
    useEffect(()=>{
        if (addressAddStatus === 'fulfilled') {
            setSelectedAddress(addresses[addresses.length - 1])
            reset()
        } else if (addressAddStatus === 'rejected') {
            toast.error('تعذر حفظ العنوان. يرجى المحاولة مرة أخرى.')
        }
    },[addressAddStatus, addresses, reset])

    useEffect(() => {
        if (!selectedAddress && addresses.length > 0) {
            setSelectedAddress(addresses[0])
        }
    }, [addresses, selectedAddress])

    useEffect(()=>{
        if(currentOrder && currentOrder?._id){
            dispatch(resetCartByUserIdAsync(loggedInUser?._id))
            navigate(`/order-success/${currentOrder?._id}`)
        }
    },[currentOrder])
    
    const handleAddAddress=(data)=>{
        const address={...data,user:loggedInUser._id}
        dispatch(addAddressAsync(address))
    }

    const handleCreateOrder=()=>{
        if (!selectedAddress) {
            toast.error('يرجى اختيار عنوان الشحن أولاً.')
            setStep(1)
            return
        }
        const order={user:loggedInUser._id,item:cartItems,address:selectedAddress,paymentMode:selectedPaymentMethod,total:orderTotal+SHIPPING+TAXES}
        dispatch(createOrderAsync(order))
    }

  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', bgcolor: '#f8f5f4', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          maxWidth: 1180,
          mx: 'auto',
          bgcolor: '#fff',
          border: '1px solid #f1e1df',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(112, 44, 44, 0.04)',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: '1px solid #f3e5e2',
            background: '#fffaf9',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <motion.div whileHover={{ x: -4 }}>
              <IconButton
                aria-label={step === 1 ? 'العودة إلى السلة' : 'العودة إلى معلومات الشحن'}
                onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
                sx={{ border: '1px solid #f0d7d4', color: '#222', bgcolor: '#fff' }}
              >
                <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
              </IconButton>
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1c1c1c', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              {step === 1 ? 'معلومات الشحن' : 'ملخص الطلب'}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 700, color: step === 2 ? '#1d1d1d' : '#888', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              {step === 1 ? 'معلومات الشحن' : 'ملخص الطلب'}
            </Typography>
            <Box
              component="span"
              sx={{
                minWidth: 28,
                height: 28,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: step === 2 ? '#d32f2f' : '#bdbdbd',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'Cairo, Tahoma, sans-serif',
              }}
            >
              {step}
            </Box>
          </Stack>
        </Stack>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <AnimatePresence mode="wait" initial={false}>
          {step === 1 ? (
          <motion.div
            key="shipping-step"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
          <Stack spacing={3}>
            <Box sx={{ flex: 1 }}>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit(handleAddAddress)}
                  sx={{
                    border: '1px solid #f0d9d5',
                    borderRadius: 4,
                    p: { xs: 2, sm: 3 },
                    bgcolor: '#fffdfd',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#222', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
                      إضافة عنوان شحن جديد
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        bgcolor: '#f8e5e5',
                        color: '#d32f2f',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 99,
                        fontWeight: 700,
                        fontSize: 12,
                        fontFamily: 'Cairo, Tahoma, sans-serif',
                      }}
                    >
                      {addresses.length} عنوان
                    </Box>
                  </Stack>

                  <Stack spacing={2.2}>
                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>نوع العنوان</Typography>
                      <TextField
                        {...register('type', { required: true })}
                        placeholder="مثل: المنزل، العمل"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }}
                      />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>الشارع</Typography>
                      <TextField {...register('street', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>المحافظة</Typography>
                      <TextField {...register('state', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>المدينة</Typography>
                      <TextField {...register('city', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>الدولة</Typography>
                      <TextField {...register('country', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>الرمز البريدي</Typography>
                      <TextField type="number" {...register('postalCode', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: '#2a2a2a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>رقم الهاتف</Typography>
                      <TextField type="number" {...register('phoneNumber', { required: true })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: '#fff' } }} />
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 1 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => reset()}
                        sx={{
                          borderRadius: 99,
                          borderColor: '#d32f2f',
                          color: '#d32f2f',
                          px: 3,
                          fontWeight: 700,
                          fontFamily: 'Cairo, Tahoma, sans-serif',
                        }}
                      >
                        مسح
                      </Button>
                      <LoadingButton
                        type="submit"
                        loading={addressAddStatus === 'pending'}
                        variant="contained"
                        sx={{
                          borderRadius: 99,
                          bgcolor: '#d32f2f',
                          px: 3,
                          fontWeight: 700,
                          fontFamily: 'Cairo, Tahoma, sans-serif',
                          '&:hover': { bgcolor: '#b71c1c' },
                        }}
                      >
                        حفظ العنوان
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </Box>
            </Box>

            <Box sx={{ width: '100%' }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
                <Stack spacing={2}>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#1d1d1d', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
                    اختر عنوان الشحن
                  </Typography>

                  {addresses.length === 0 ? (
                    <Box sx={{ border: '1px solid #f0d9d5', borderRadius: 4, p: 3, textAlign: 'center', color: '#666', bgcolor: '#fffdfd' }}>
                      <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>لا توجد عناوين محفوظة بعد</Typography>
                    </Box>
                  ) : (
                    addresses.map((address, index) => (
                      <Paper
                        key={address._id}
                        elevation={0}
                        sx={{
                          border: selectedAddress === address ? '2px solid #d32f2f' : '1px solid #f0d9d5',
                          borderRadius: 3,
                          p: 2,
                          bgcolor: selectedAddress === address ? '#fff8f8' : '#fffdfd',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontWeight: 800, color: '#1d1d1d', fontFamily: 'Cairo, Tahoma, sans-serif' }}>{address.type}</Typography>
                          <Radio
                            checked={selectedAddress === address}
                            onChange={() => setSelectedAddress(addresses[index])}
                            sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }}
                          />
                        </Stack>

                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif', color: '#4b4b4b' }}>{address.street}</Typography>
                          <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif', color: '#4b4b4b' }}>
                            {address.state}, {address.city}, {address.country}, {address.postalCode}
                          </Typography>
                          <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif', color: '#4b4b4b' }}>{address.phoneNumber}</Typography>
                        </Stack>
                      </Paper>
                    ))
                  )}
                    <LoadingButton
                      fullWidth
                      size="large"
                      variant="contained"
                      onClick={() => {
                        if (!selectedAddress) {
                          toast.error('يرجى إضافة أو اختيار عنوان الشحن أولاً.')
                          return
                        }
                        setStep(2)
                      }}
                      sx={{
                        maxWidth: { xs: '100%', sm: 320 },
                        alignSelf: 'flex-start',
                        borderRadius: 99,
                        bgcolor: '#d32f2f',
                        fontWeight: 800,
                        fontFamily: 'Cairo, Tahoma, sans-serif',
                        '&:hover': { bgcolor: '#b71c1c' },
                      }}
                    >
                      متابعة إلى ملخص الطلب
                    </LoadingButton>
                </Stack>
              </motion.div>
            </Box>
          </Stack>
          </motion.div>
          ) : (
          <motion.div
            key="order-summary-step"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #f0d9d5', borderRadius: 2, bgcolor: '#fff' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0.4}>
                      <Typography sx={{ fontWeight: 800, fontFamily: 'Cairo, Tahoma, sans-serif' }}>عنوان الشحن</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>{selectedAddress?.type} - {selectedAddress?.street}</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>
                        {[selectedAddress?.city, selectedAddress?.state, selectedAddress?.country, selectedAddress?.postalCode].filter(Boolean).join('، ')}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>{selectedAddress?.phoneNumber}</Typography>
                    </Stack>
                    <Button onClick={() => setStep(1)} sx={{ color: '#b71c1c', fontFamily: 'Cairo, Tahoma, sans-serif' }}>تغيير</Button>
                  </Stack>
              </Paper>

              <Stack direction={{ xs: 'column', lg: 'row' }} dir="rtl" spacing={3} alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <Cart checkout arabic />
                </Box>

                <Paper elevation={0} sx={{ width: { xs: '100%', lg: 260 }, p: 2, border: '1px solid #f0d9d5', borderRadius: 2, bgcolor: '#fff' }}>
                  <Typography sx={{ fontWeight: 800, mb: 1.5, fontFamily: 'Cairo, Tahoma, sans-serif' }}>طريقة الدفع</Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>الدفع عند الاستلام</Typography>
                      <Radio checked={selectedPaymentMethod === 'COD'} onChange={() => setSelectedPaymentMethod('COD')} sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: 'Cairo, Tahoma, sans-serif' }}>الدفع بالبطاقة</Typography>
                      <Radio checked={selectedPaymentMethod === 'CARD'} onChange={() => setSelectedPaymentMethod('CARD')} sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }} />
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>

              <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => setStep(1)}
                    sx={{ borderRadius: 99, borderColor: '#d32f2f', color: '#d32f2f', px: 3, fontWeight: 700, fontFamily: 'Cairo, Tahoma, sans-serif' }}
                  >
                    الرجوع لمعلومات الشحن
                  </Button>
                  <LoadingButton
                    size="large"
                    loading={orderStatus === 'pending'}
                    variant="contained"
                    onClick={handleCreateOrder}
                    sx={{ borderRadius: 99, bgcolor: '#d32f2f', px: 4, fontWeight: 800, fontFamily: 'Cairo, Tahoma, sans-serif', '&:hover': { bgcolor: '#b71c1c' } }}
                  >
                    تأكيد الطلب
                  </LoadingButton>
              </Stack>
            </Stack>
          </motion.div>
          )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  )
}
