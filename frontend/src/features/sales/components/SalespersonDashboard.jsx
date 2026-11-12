import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, LinearProgress, Stack, TextField, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { getMySalesRequests, getSalesStatistics, updateMonthlySalesTarget } from '../SalesApi'
import { SalesRequestsTable } from '../../admin/components/SalesRequestsTable'
import { Link } from 'react-router-dom'
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded'
import PaidRoundedIcon from '@mui/icons-material/PaidRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded'

const errorMessage=(error)=>{
  const message=error?.response?.data?.message || error?.message
  const translations={
    'Error fetching your sales requests':'تعذر تحميل طلبات المبيعات.',
    'Error fetching salesperson statistics':'تعذر تحميل إحصاءات المبيعات.',
    'Monthly sales target must be a non-negative number':'يجب أن يكون هدف المبيعات الشهري رقمًا غير سالب.',
    'Salesperson account not found':'لم يتم العثور على حساب مندوب المبيعات.',
    'Error updating the monthly sales target':'تعذر تحديث هدف المبيعات الشهري.'
  }
  return translations[message] || 'حدث خطأ. يرجى المحاولة مرة أخرى.'
}
const numberFormat=(value)=>Number(value || 0).toLocaleString('ar-EG-u-nu-latn',{maximumFractionDigits:2})
const currencyFormat=(value)=>new Intl.NumberFormat('ar-EG-u-nu-latn',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value) || 0)
const formatMonth=(month)=>{
  const date=new Date(`${month} 1`)
  return Number.isNaN(date.getTime())?month:date.toLocaleDateString('ar-EG-u-nu-latn',{month:'short',year:'numeric'})
}

const MetricChart=({title,monthly,field,color})=>{
  const maxValue=Math.max(...monthly.map((month)=>month[field]),0)
  return (
    <Card elevation={2} sx={{flex:1,minWidth:280}}>
      <CardContent>
        <Typography variant="h6" mb={2}>{title}</Typography>
        {monthly.length ? (
          <Box sx={{display:'flex',alignItems:'flex-end',gap:1.5,overflowX:'auto',height:220,pb:1}}>
            {monthly.map((month,index)=>{
              const value=month[field]
              const height=maxValue?Math.max(value/maxValue*145,value?6:0):0
              return (
                <Stack key={month.month} alignItems="center" justifyContent="flex-end" sx={{height:'100%',minWidth:58}}>
                  <Typography variant="caption" color="text.secondary">
                    {field==='revenue'?currencyFormat(value):numberFormat(value)}
                  </Typography>
                  <Box sx={{height:150,width:28,display:'flex',alignItems:'flex-end'}}>
                    <motion.div
                      initial={{height:0}}
                      animate={{height}}
                      transition={{duration:.5,delay:Math.min(index*.04,.6)}}
                      style={{width:'100%',backgroundColor:color,borderRadius:'5px 5px 0 0'}}
                    />
                  </Box>
                  <Typography variant="caption" noWrap sx={{mt:.5}}>{formatMonth(month.month)}</Typography>
                </Stack>
              )
            })}
          </Box>
        ):<Typography color="text.secondary">{'لا توجد بيانات شهرية بعد.'}</Typography>}
      </CardContent>
    </Card>
  )
}

export const SalespersonDashboard=()=>{
  const [requests,setRequests]=useState([])
  const [statistics,setStatistics]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [targetDraft,setTargetDraft]=useState('10000')
  const [savingTarget,setSavingTarget]=useState(false)

  useEffect(()=>{
    let active=true
    Promise.all([
      getMySalesRequests(),
      getSalesStatistics()
    ])
      .then(([myRequests,myStatistics])=>{
        if(active){
          setRequests(myRequests)
          setStatistics(myStatistics)
          setTargetDraft(String(myStatistics.kpis?.monthlySalesTarget ?? 10000))
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

  const saveTarget=async(event)=>{
    event.preventDefault()
    const target=Number(targetDraft)
    if(!Number.isFinite(target) || target<0){
      setError('أدخل هدف مبيعات شهريًا صحيحًا يساوي صفرًا أو أكثر.')
      return
    }

    setError('')
    setMessage('')
    setSavingTarget(true)
    try{
      const result=await updateMonthlySalesTarget(target)
      setStatistics((current)=>({
        ...current,
        kpis:{
          ...current.kpis,
          monthlySalesTarget:result.monthlySalesTarget,
          salesTargetAchievement:target>0
            ?current.kpis.monthlySalesRevenue/target*100
            :0
        }
      }))
      setMessage('تم تحديث هدف المبيعات الشهري.')
    }catch(updateError){
      setError(errorMessage(updateError))
    }finally{
      setSavingTarget(false)
    }
  }

  if(loading) return <Stack alignItems="center" py={8}><CircularProgress /></Stack>

  const kpis=statistics?.kpis || {}
  const revenueProgress=kpis.monthlySalesTarget>0
    ?Math.min(kpis.salesTargetAchievement || 0,100)
    :0
  const kpiCards=[
    {
      title:'تحقيق هدف المبيعات',
      value:`${numberFormat(kpis.salesTargetAchievement)}%`,
      subtitle:`${currencyFormat(kpis.monthlySalesRevenue)} من هدف شهري قدره ${currencyFormat(kpis.monthlySalesTarget)}`,
      icon:<TrackChangesRoundedIcon/>,
      color:'#c62828',
      content:(
        <Stack component="form" onSubmit={saveTarget} spacing={1.25} mt={1.5}>
          <LinearProgress
            variant="determinate"
            value={revenueProgress}
            sx={{height:8,borderRadius:8,bgcolor:'#f5d6d6','& .MuiLinearProgress-bar':{bgcolor:'#c62828',borderRadius:8}}}
          />
          <Stack direction="row" spacing={1}>
            <TextField
              label="الهدف الشهري"
              type="number"
              size="small"
              value={targetDraft}
              onChange={(event)=>setTargetDraft(event.target.value)}
              inputProps={{min:0,step:100}}
              sx={{flex:1}}
            />
            <Button type="submit" variant="outlined" disabled={savingTarget}>
              {savingTarget?'جارٍ الحفظ…':'تحديث'}
            </Button>
          </Stack>
        </Stack>
      )
    },
    {
      title:'إيرادات المبيعات الشهرية',
      value:currencyFormat(kpis.monthlySalesRevenue),
      subtitle:'طلبات المبيعات المكتملة هذا الشهر',
      icon:<PaidRoundedIcon/>,
      color:'#00897b'
    },
    {
      title:'العملاء الجدد',
      value:numberFormat(kpis.newCustomers),
      subtitle:'أضفتهم هذا الشهر · الهدف ٥–١٠',
      icon:<PersonAddAlt1RoundedIcon/>,
      color:'#7b1fa2'
    },
    {
      title:'زيارات العملاء',
      value:numberFormat(kpis.customerVisitsToday),
      subtitle:'تم تسجيلها اليوم · الهدف ٥–٨',
      icon:<GroupsRoundedIcon/>,
      color:'#1565c0',
      content:(
        <Button component={Link} to="/sales/request-order" size="small" sx={{mt:1}}>
          {'اختر عميلًا لتسجيل زيارة'}
        </Button>
      )
    },
    {
      title:'معدل التحويل',
      value:kpis.conversionRate==null?'—':`${numberFormat(kpis.conversionRate)}%`,
      subtitle:kpis.conversionRate==null?'لا توجد فرص عملاء جدد هذا الشهر':'الطلبات المكتملة ÷ فرص العملاء الجدد · الهدف ٢٥٪ فأكثر',
      icon:<TrendingUpRoundedIcon/>,
      color:'#ef6c00'
    },
    {
      title:'متوسط قيمة الطلب',
      value:kpis.averageOrderValue==null?'—':currencyFormat(kpis.averageOrderValue),
      subtitle:`لـ ${numberFormat(kpis.completedOrders)} طلبات مكتملة هذا الشهر`,
      icon:<ShoppingBagRoundedIcon/>,
      color:'#3949ab',
    }
  ]

  return (
    <Stack dir="rtl" lang="ar" maxWidth="xl" mx="auto" p={{xs:2,md:4}} spacing={3} mb={5} sx={{fontFamily:'Cairo, Tahoma, sans-serif','& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}}}>
      <Typography variant="h4" fontWeight={700}>{'لوحة تحكم مندوب المبيعات'}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      <Stack spacing={2}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>{'مؤشرات الأداء الرئيسية'}</Typography>
          <Typography variant="body2" color="text.secondary">{'إنجازاتك لهذا الشهر واليوم'}</Typography>
        </Stack>
        <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(2,minmax(0,1fr))',lg:'repeat(3,minmax(0,1fr))'},gap:2}}>
          {kpiCards.map((kpi)=>(
            <Card
              key={kpi.title}
              elevation={0}
              sx={{
                minWidth:0,
                borderRadius:3,
                border:'1px solid #eee7e7',
                background:'linear-gradient(145deg,#fff 0%,#fffafa 100%)',
                boxShadow:'0 8px 24px rgba(41,35,43,.06)',
                transition:'transform .2s ease, box-shadow .2s ease',
                '&:hover':{transform:'translateY(-3px)',boxShadow:'0 12px 28px rgba(41,35,43,.11)'}
              }}
            >
              <CardContent sx={{p:2.5,'&:last-child':{pb:2.5}}}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{display:'grid',placeItems:'center',width:44,height:44,borderRadius:2,bgcolor:`${kpi.color}14`,color:kpi.color}}>
                    {kpi.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>{kpi.title}</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{mt:2,color:'#29232b',fontSize:{xs:'1.75rem',sm:'2rem'}}}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{kpi.subtitle}</Typography>
                {kpi.content}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>

      <Stack direction={{xs:'column',sm:'row'}} spacing={2}>
        <Card sx={{flex:1}}><CardContent><Typography color="text.secondary">{'إجمالي طلباتي'}</Typography><Typography variant="h4">{numberFormat(statistics?.totals.requests)}</Typography></CardContent></Card>
        <Card sx={{flex:1}}><CardContent><Typography color="text.secondary">{'إجمالي الإيرادات المكتملة'}</Typography><Typography variant="h4">{currencyFormat(statistics?.totals.revenue)}</Typography></CardContent></Card>
        <Card sx={{flex:1}}><CardContent><Typography color="text.secondary">{'المنتجات المباعة'}</Typography><Typography variant="h4">{numberFormat(statistics?.totals.productsSold)}</Typography></CardContent></Card>
      </Stack>

      <Typography variant="h5">{'الأداء الشهري'}</Typography>
      <Stack direction={{xs:'column',lg:'row'}} spacing={2}>
        <MetricChart title={"طلبات المبيعات"} monthly={statistics?.monthly || []} field="requests" color="#c62828"/>
        <MetricChart title={"الإيرادات المكتملة"} monthly={statistics?.monthly || []} field="revenue" color="#ef5350"/>
        <MetricChart title={"المنتجات المباعة"} monthly={statistics?.monthly || []} field="productsSold" color="#b71c1c"/>
      </Stack>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" mb={2}>{'طلبات المبيعات الخاصة بي'}</Typography>
          <SalesRequestsTable
            requests={requests}
            showActions={false}
            showSalesperson={false}
            emptyMessage="لم ترسل أي طلبات حتى الآن."
            locale="ar"
          />
        </CardContent>
      </Card>
    </Stack>
  )
}
