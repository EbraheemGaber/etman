import React, { useEffect, useState } from 'react'
import { Alert, Autocomplete, Avatar, Box, Button, CircularProgress, MenuItem, Select, Stack, Step, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../../products/ProductApi'
import { createCustomer, createSalesRequest, getCustomers, logCustomerVisit } from '../SalesApi'
import { FormCard } from '../../../components/FormCard'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'

const errorTranslations={
  'Choose a product and enter a whole-number quantity greater than zero.':'اختر منتجًا وأدخل كمية صحيحة أكبر من صفر.',
  'Select a customer with a name, email, and phone number before continuing.':'اختر عميلًا لديه اسم وبريد إلكتروني ورقم هاتف قبل المتابعة.',
  'Enter the new customer’s name, email, and phone number.':'أدخل اسم العميل الجديد وبريده الإلكتروني ورقم هاتفه.',
  'Enter the customer details and add at least one product.':'أدخل بيانات العميل وأضف منتجًا واحدًا على الأقل.',
  'Enter a valid customer name, email, and phone':'أدخل اسم العميل وبريده الإلكتروني ورقم هاتفه بشكل صحيح.',
  'Add at least one product to the request':'أضف منتجًا واحدًا على الأقل إلى الطلب.',
  'Each item must contain a product and quantity':'يجب تحديد المنتج والكمية لكل عنصر.',
  'Each item must have a valid product and a positive whole-number quantity':'يجب أن يحتوي كل عنصر على منتج صالح وكمية صحيحة أكبر من صفر.',
  'One or more selected products are unavailable':'منتج واحد أو أكثر من المنتجات المختارة غير متاح.',
  'Requested quantities cannot exceed available stock':'لا يمكن أن تتجاوز الكمية المطلوبة المخزون المتاح.',
  'Error creating the sales request':'تعذر إنشاء طلب المبيعات.',
  'Select a customer with a valid name and email before logging a visit':'اختر عميلًا لديه اسم وبريد إلكتروني صالحان قبل تسجيل الزيارة.',
  'Error logging customer visit':'تعذر تسجيل زيارة العميل.',
  'Error fetching customers':'تعذر تحميل قائمة العملاء.',
  'Error fetching products, please try again later':'تعذر تحميل المنتجات. يرجى المحاولة لاحقًا.',
  'Error saving the customer':'تعذر حفظ بيانات العميل.',
  'A customer with this email already exists. Select them from Current customer.':'يوجد عميل مسجل بهذا البريد الإلكتروني. اختره من قائمة العملاء الحاليين.',
  'Monthly sales target must be a non-negative number':'يجب أن يكون هدف المبيعات الشهري رقمًا غير سالب.',
  'Error fetching salesperson statistics':'تعذر تحميل إحصاءات المبيعات.',
  'Error fetching your sales requests':'تعذر تحميل طلبات المبيعات.',
  'Error updating the monthly sales target':'تعذر تحديث هدف المبيعات الشهري.',
}
const errorMessage=(error)=>{
  const message=error?.response?.data?.message || error?.message
  return errorTranslations[message] || 'حدث خطأ. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
}
const numberFormat=(value)=>Number(value || 0).toLocaleString('ar-EG-u-nu-latn',{maximumFractionDigits:2})

export const SalespersonOrderRequest=()=>{
  const [products,setProducts]=useState([])
  const [customers,setCustomers]=useState([])
  const [customerType,setCustomerType]=useState('existing')
  const [step,setStep]=useState(0)
  const [selectedCustomerId,setSelectedCustomerId]=useState('')
  const [customer,setCustomer]=useState({name:'',email:'',phone:''})
  const [productId,setProductId]=useState('')
  const [quantity,setQuantity]=useState(1)
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)
  const [loggingVisit,setLoggingVisit]=useState(false)
  const [visitLogged,setVisitLogged]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const navigate=useNavigate()

  useEffect(()=>{
    let active=true
    Promise.all([
      fetchProducts({user:true}),
      getCustomers()
    ])
      .then(([productResult,customerResults])=>{
        if(active){
          setProducts(productResult.data)
          setCustomers(customerResults)
        }
      })
      .catch((requestError)=>{
        if(active) setError(errorMessage(requestError))
      })
      .finally(()=>{
        if(active) setLoading(false)
      })
    return ()=>{active=false}
  },[])

  const changeCustomerType=(_,nextType)=>{
    if(!nextType) return
    setCustomerType(nextType)
    setCustomer({name:'',email:'',phone:''})
    setSelectedCustomerId('')
    setVisitLogged(false)
    setItems([])
    setError('')
    setMessage('')
  }

  const addItem=()=>{
    setError('')
    if(!productId || !Number.isInteger(Number(quantity)) || Number(quantity)<1){
      setError('اختر منتجًا وأدخل كمية صحيحة أكبر من صفر.')
      return
    }
    const product=products.find((item)=>item._id===productId)
    if(!product) return
    setItems((current)=>{
      const existing=current.find((item)=>item.productId===productId)
      if(existing){
        return current.map((item)=>item.productId===productId
          ?{...item,quantity:item.quantity+Number(quantity)}
          :item)
      }
      return [...current,{productId,quantity:Number(quantity),product}]
    })
    setProductId('')
    setQuantity(1)
  }

  const logVisitAndContinue=async(customerToVisit=customer)=>{
    setError('')
    setMessage('')
    if(!selectedCustomerId || !customerToVisit.name?.trim() || !customerToVisit.email?.trim() || !customerToVisit.phone?.trim()){
      setError('اختر عميلًا لديه اسم وبريد إلكتروني ورقم هاتف قبل المتابعة.')
      return
    }

    if(visitLogged){
      setStep(3)
      return
    }

    setLoggingVisit(true)
    try{
      await logCustomerVisit({
        customerName:customerToVisit.name,
        customerEmail:customerToVisit.email
      })
      setVisitLogged(true)
      setStep(3)
      setError('')
      setMessage('تم تسجيل الزيارة. يمكنك الآن إنشاء طلب المبيعات.')
    }catch(visitError){
      setError(errorMessage(visitError))
    }finally{
      setLoggingVisit(false)
    }
  }

  const saveCustomer=async()=>{
    setError('')
    setMessage('')
    if(!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()){
      setError('أدخل اسم العميل الجديد وبريده الإلكتروني ورقم هاتفه.')
      return
    }

    setSubmitting(true)
    let savedCustomer
    try{
      savedCustomer=await createCustomer(customer)
    }catch(saveError){
      setError(errorMessage(saveError))
      setSubmitting(false)
      return
    }

    setCustomers((current)=>[...current,savedCustomer].sort((first,second)=>first.name.localeCompare(second.name)))
    setCustomerType('existing')
    setSelectedCustomerId(savedCustomer._id)
    setCustomer(savedCustomer)
    setMessage('تم حفظ العميل. جارٍ تسجيل الزيارة والانتقال إلى طلب المبيعات…')
    try{
      await logCustomerVisit({
        customerName:savedCustomer.name,
        customerEmail:savedCustomer.email
      })
      setVisitLogged(true)
      setStep(3)
      setError('')
      setMessage('تم حفظ العميل وتسجيل الزيارة. يمكنك الآن إنشاء طلب المبيعات.')
    }catch(visitError){
      setError(`تم حفظ العميل، لكن تعذر تسجيل الزيارة. ${errorMessage(visitError)}`)
    }finally{
      setSubmitting(false)
    }
  }

  const submitRequest=async(event)=>{
    event.preventDefault()
    setError('')
    setMessage('')
    if(customerType!=='existing'){
      setError('احفظ بيانات العميل الجديد أولًا قبل إنشاء طلب المبيعات.')
      return
    }
    if(!customer.name.trim() || !customer.email.trim() || !customer.phone.trim() || !items.length){
      setError('أدخل بيانات العميل وأضف منتجًا واحدًا على الأقل.')
      return
    }

    setSubmitting(true)
    try{
      await createSalesRequest({
        customer,
        items:items.map(({productId:requestedProduct,quantity:requestedQuantity})=>({
          productId:requestedProduct,
          quantity:requestedQuantity
        }))
      })
      setItems([])
      setCustomerType('existing')
      setSelectedCustomerId('')
      setCustomer({name:'',email:'',phone:''})
      setVisitLogged(false)
      setStep(0)
      setMessage('تم إرسال طلب المبيعات للموافقة.')
    }catch(requestError){
      setError(errorMessage(requestError))
    }finally{
      setSubmitting(false)
    }
  }

  const handleFormSubmit=(event)=>{
    if(step===3) return submitRequest(event)
    event.preventDefault()
  }

  const steps=['نوع العميل','بيانات الزيارة','طلب المبيعات']

  return (
    <Stack dir="rtl" lang="ar" maxWidth="md" mx="auto" p={{xs:2,md:4}} spacing={3} mb={5} sx={{fontFamily:'Cairo, Tahoma, sans-serif','& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="overline" color="error.main" fontWeight={700} letterSpacing={1.5}>
            {'زيارة عميل'}
          </Typography>
          <Typography variant="h4" fontWeight={700}>{'هيا بنا نبدأ'}</Typography>
        </Box>
        <Button onClick={()=>navigate('/sales/dashboard')} startIcon={<ArrowBackRoundedIcon sx={{transform:'scaleX(-1)'}}/>}>
          {'لوحة التحكم'}
        </Button>
      </Stack>

      {step>0 && (
        <Stepper activeStep={step-1} alternativeLabel sx={{mb:1}}>
          {steps.map((label)=>(
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      <FormCard onSubmit={handleFormSubmit} sx={{width:'100%',overflow:'hidden'}}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{opacity:0,x:24}}
            animate={{opacity:1,x:0}}
            exit={{opacity:0,x:-24}}
            transition={{duration:.25,ease:'easeOut'}}
          >
            <Stack spacing={2.5}>
              {step===0 && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  spacing={2}
                  sx={{
                    position:'relative',
                    overflow:'hidden',
                    py:{xs:4,md:6},
                    px:2,
                    borderRadius:4,
                    color:'#fff',
                    background:'linear-gradient(120deg,#7f171b 0%,#c62828 55%,#ef6c00 100%)'
                  }}
                >
                  <motion.div
                    aria-hidden="true"
                    animate={{scale:[1,1.15,1],opacity:[.16,.3,.16]}}
                    transition={{duration:3.5,repeat:Infinity,ease:'easeInOut'}}
                    style={{
                      position:'absolute',
                      width:260,
                      height:260,
                      border:'1px solid rgba(255,255,255,.55)',
                      borderRadius:'50%',
                      top:'50%',
                      left:'50%',
                      x:'-50%',
                      y:'-50%',
                      pointerEvents:'none'
                    }}
                  />
                  <Typography variant="overline" sx={{position:'relative',letterSpacing:2,opacity:.85}}>
                    {'زيارة عميل'}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{position:'relative'}}>
                    {'هل أنت مستعد لزيارة عميل جديد؟'}
                  </Typography>
                  <Typography sx={{position:'relative',maxWidth:460,color:'rgba(255,255,255,.86)'}}>
                    {'ابدأ الزيارة، وابحث عن عميل حالي أو أضف عميلًا جديدًا، ثم أنشئ طلب المبيعات.'}
                  </Typography>
                  <motion.div whileHover={{scale:1.05}} whileTap={{scale:.96}} style={{position:'relative',display:'inline-block'}}>
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowRoundedIcon/>}
                      endIcon={<ArrowForwardRoundedIcon sx={{transform:'scaleX(-1)'}}/>}
                      onClick={()=>setStep(1)}
                      sx={{
                        px:4,
                        py:1.25,
                        borderRadius:50,
                        color:'#8e1b1b',
                        bgcolor:'#fff',
                        fontWeight:800,
                        boxShadow:'0 8px 24px rgba(70,0,0,.24)',
                        '&:hover':{bgcolor:'#fff8f4'}
                      }}
                    >
                      {'ابدأ الزيارة'}
                    </Button>
                  </motion.div>
                </Stack>
              )}

              {step===1 && (
                <>
                  <Stack spacing={.5} textAlign="center">
                    <Typography variant="h5" fontWeight={700}>{'من العميل الذي ستزوره؟'}</Typography>
                    <Typography color="text.secondary">{'اختر نوع العميل للبدء.'}</Typography>
                  </Stack>
                  <ToggleButtonGroup
                    value={customerType}
                    exclusive
                    onChange={changeCustomerType}
                    aria-label="نوع العميل"
                    fullWidth
                    sx={{gap:2,'& .MuiToggleButtonGroup-grouped':{border:'0 !important',borderRadius:'16px !important'}}}
                  >
                    <ToggleButton value="existing" sx={{flex:1,py:2,textTransform:'none'}}>
                      <Stack alignItems="center">
                        <PersonSearchRoundedIcon color="primary" sx={{fontSize:42,mb:1}}/>
                        <Typography variant="h6" fontWeight={700}>{'عميل حالي'}</Typography>
                        <Typography variant="body2" color="text.secondary">{'ابحث عن عميل موجود في قائمتك.'}</Typography>
                      </Stack>
                    </ToggleButton>
                    <ToggleButton value="new" sx={{flex:1,py:2,textTransform:'none'}}>
                      <Stack alignItems="center">
                        <PersonAddAlt1RoundedIcon color="secondary" sx={{fontSize:42,mb:1}}/>
                        <Typography variant="h6" fontWeight={700}>{'عميل جديد'}</Typography>
                        <Typography variant="body2" color="text.secondary">{'أضف بيانات التواصل وسجّل الزيارة.'}</Typography>
                      </Stack>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    type="button"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon sx={{transform:'scaleX(-1)'}}/>}
                    onClick={()=>setStep(2)}
                    sx={{alignSelf:'center',px:4,borderRadius:3,fontWeight:700}}
                  >
                    {'متابعة'}
                  </Button>
                </>
              )}

              {step===2 && (
                <>
                  <Stack spacing={.5}>
                    <Typography variant="h5" fontWeight={700}>
                      {customerType==='existing'?'ابحث عن عميلك':'إضافة عميل جديد'}
                    </Typography>
                    <Typography color="text.secondary">
                      {customerType==='existing'
                        ?'ابحث بالاسم، وتأكد من بيانات التواصل، ثم سجّل الزيارة.'
                        :'احفظ بيانات التواصل، وسنسجل الزيارة وننتقل إلى طلب المبيعات.'}
                    </Typography>
                  </Stack>

                  {customerType==='existing' && (
                    <Autocomplete
                      options={customers}
                      loading={loading}
                      value={customers.find((match)=>match._id===selectedCustomerId) || null}
                      getOptionLabel={(option)=>option?.name || ''}
                      isOptionEqualToValue={(option,value)=>option._id===value._id}
                      onChange={(_,foundCustomer)=>{
                        setSelectedCustomerId(foundCustomer?._id || '')
                        setCustomer({
                          name:foundCustomer?.name || '',
                          email:foundCustomer?.email || '',
                          phone:foundCustomer?.phone || ''
                        })
                        setVisitLogged(false)
                        setError('')
                        setMessage(foundCustomer
                          ?foundCustomer.phone
                            ?'تم تحميل بيانات العميل.'
                              :'تم تحميل بيانات العميل. أضف رقم الهاتف للمتابعة.'
                          :'')
                      }}
                      renderOption={(props,option)=>(
                        <li {...props} key={option._id}>
                          {option.name} — {option.email}
                        </li>
                      )}
                      renderInput={(params)=>(
                        <TextField
                          {...params}
                          label="ابحث عن العملاء بالاسم"
                          required
                          placeholder="ابدأ بكتابة اسم العميل"
                        />
                      )}
                      noOptionsText={loading?'جارٍ تحميل العملاء…':'لم يتم العثور على عملاء'}
                    />
                  )}

                  <Stack direction={{xs:'column',sm:'row'}} spacing={2}>
                    <TextField
                      label="اسم العميل"
                      required
                      fullWidth
                      value={customer.name}
                      onChange={(event)=>setCustomer({...customer,name:event.target.value})}
                      InputProps={{readOnly:customerType==='existing' && Boolean(selectedCustomerId)}}
                    />
                    <TextField
                      label="البريد الإلكتروني للعميل"
                      type="email"
                      required
                      fullWidth
                      value={customer.email}
                      inputProps={{dir:'ltr'}}
                      onChange={(event)=>setCustomer({...customer,email:event.target.value})}
                      InputProps={{readOnly:customerType==='existing' && Boolean(selectedCustomerId)}}
                    />
                    <TextField
                      label="رقم هاتف العميل"
                      required
                      fullWidth
                      value={customer.phone}
                      inputProps={{dir:'ltr'}}
                      onChange={(event)=>setCustomer({...customer,phone:event.target.value})}
                    />
                  </Stack>

                  <Stack direction={{xs:'column-reverse',sm:'row'}} justifyContent="space-between" gap={1}>
                    <Button type="button" onClick={()=>setStep(1)} startIcon={<ArrowBackRoundedIcon sx={{transform:'scaleX(-1)'}}/>}>
                      {'رجوع'}
                    </Button>
                    {customerType==='new'?(
                      <Button
                        type="button"
                        variant="contained"
                        onClick={saveCustomer}
                        disabled={submitting || loggingVisit}
                        endIcon={visitLogged?<CheckCircleRoundedIcon/>:<ArrowForwardRoundedIcon sx={{transform:'scaleX(-1)'}}/>}
                        sx={{borderRadius:3,fontWeight:700}}
                      >
                        {submitting?'جارٍ حفظ العميل…':'حفظ العميل والمتابعة'}
                      </Button>
                    ):(
                      <Button
                        type="button"
                        variant="contained"
                        onClick={()=>logVisitAndContinue()}
                        disabled={loggingVisit || submitting || !selectedCustomerId || !customer.phone.trim()}
                        endIcon={visitLogged?<CheckCircleRoundedIcon/>:<ArrowForwardRoundedIcon sx={{transform:'scaleX(-1)'}}/>}
                        sx={{borderRadius:3,fontWeight:700}}
                      >
                        {loggingVisit?'جارٍ تسجيل الزيارة…':visitLogged?'متابعة إلى الطلب':'تسجيل الزيارة والمتابعة'}
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {step===3 && (
                <>
                  <Stack spacing={.5}>
                    <Typography variant="h5" fontWeight={700}>{'إنشاء طلب المبيعات'}</Typography>
                    <Typography color="text.secondary">
                      {`للعميل ${customer.name}. أضف المنتجات وأرسل الطلب للموافقة.`}
                    </Typography>
                  </Stack>
                  <Stack direction={{xs:'column',sm:'row'}} spacing={2}>
                    <Select
                      value={productId}
                      displayEmpty
                      fullWidth
                      disabled={loading}
                      onChange={(event)=>setProductId(event.target.value)}
                    >
                      <MenuItem value="" disabled>{loading?'جارٍ تحميل المنتجات…':'اختر منتجًا'}</MenuItem>
                      {products.map((product)=>(
                        <MenuItem key={product._id} value={product._id}>
                          {product.title} — {numberFormat(product.price)}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      label="الكمية"
                      type="number"
                      inputProps={{min:1,step:1}}
                      value={quantity}
                      onChange={(event)=>setQuantity(event.target.value)}
                      sx={{width:{xs:'100%',sm:150}}}
                    />
                    <Button type="button" variant="outlined" onClick={addItem} disabled={loading}>
                      {'إضافة منتج'}
                    </Button>
                  </Stack>

                  {items.map((item)=>(
                    <Stack key={item.productId} direction="row" alignItems="center" spacing={1}>
                      <Avatar src={item.product.thumbnail} variant="rounded"/>
                      <Typography sx={{flex:1}}>{item.product.title} × {item.quantity}</Typography>
                      <Typography>{numberFormat(item.product.price*item.quantity)}</Typography>
                      <Button type="button" color="error" onClick={()=>setItems((current)=>current.filter((entry)=>entry.productId!==item.productId))}>
                        {'إزالة'}
                      </Button>
                    </Stack>
                  ))}

                  {items.length>0 && (
                    <Stack direction="row" justifyContent="space-between" sx={{pt:1,borderTop:'1px solid',borderColor:'divider'}}>
                      <Typography fontWeight={700}>{'إجمالي الطلب'}</Typography>
                      <Typography fontWeight={700}>
                        {numberFormat(items.reduce((total,item)=>total+item.product.price*item.quantity,0))}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction={{xs:'column-reverse',sm:'row'}} justifyContent="space-between" gap={1}>
                    <Button type="button" onClick={()=>setStep(2)} startIcon={<ArrowBackRoundedIcon sx={{transform:'scaleX(-1)'}}/>}>
                      {'بيانات العميل'}
                    </Button>
                    <Button type="submit" variant="contained" disabled={submitting || loading || !items.length} sx={{borderRadius:3,fontWeight:700}}>
                      {submitting?'جارٍ إرسال الطلب…':'إرسال للموافقة'}
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </motion.div>
        </AnimatePresence>
      </FormCard>
    </Stack>
  )
}
