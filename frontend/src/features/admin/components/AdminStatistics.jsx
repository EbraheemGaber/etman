import React, { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography
} from '@mui/material'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { getOrderStatistics } from '../../order/OrderApi'
import { getAllSalesRequests } from '../../sales/SalesApi'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

const primaryRed='#c62828'
const mutedRed='#ef5350'
const formatNumber=(value)=>Number(value || 0).toLocaleString(undefined,{maximumFractionDigits:2})
const formatCompact=(value)=>Number(value || 0).toLocaleString(undefined,{notation:'compact',maximumFractionDigits:1})
const chartGrid='#f0f0f2'
const getErrorMessage=(error)=>error?.response?.data?.message || error?.message || 'Unknown error'

const summarizeSalesRequests=(requests)=>{
  const salespeople=new Map()
  const customers=new Map()

  requests.forEach((request)=>{
    const salesperson=request.salesperson
    const salespersonId=salesperson?._id || salesperson || 'unknown'
    const salespersonEntry=salespeople.get(String(salespersonId)) || {
      salespersonId,
      name:salesperson?.name || 'Unknown salesperson',
      email:salesperson?.email || '',
      requests:0,
      completedRequests:0,
      revenue:0
    }
    salespersonEntry.requests+=1
    if(request.status==='Completed'){
      salespersonEntry.completedRequests+=1
      salespersonEntry.revenue+=Number(request.total) || 0
    }
    salespeople.set(String(salespersonId),salespersonEntry)

    const email=String(request.customer?.email || '').trim().toLowerCase()
    const customerKey=email || String(request.customer?.name || 'unknown').trim().toLowerCase()
    const customerEntry=customers.get(customerKey) || {
      name:request.customer?.name || 'Unknown customer',
      email:request.customer?.email || '',
      requests:0
    }
    customerEntry.requests+=1
    customers.set(customerKey,customerEntry)
  })

  const rankedSalespeople=Array.from(salespeople.values()).sort(
    (first,second)=>second.requests-first.requests || second.revenue-first.revenue || first.name.localeCompare(second.name)
  )

  return {
    salespeople:rankedSalespeople.slice(0,10),
    customers:Array.from(customers.values())
      .sort((first,second)=>second.requests-first.requests || first.name.localeCompare(second.name))
      .slice(0,10),
    bestSalesperson:rankedSalespeople[0] || null,
    totals:{
      requests:requests.length,
      salespeople:salespeople.size,
      customers:customers.size
    }
  }
}

const createLineOptions=(formatValue)=>({
  responsive:true,
  maintainAspectRatio:false,
  interaction:{mode:'index',intersect:false},
  plugins:{
    legend:{display:false},
    tooltip:{
      backgroundColor:'#29232b',
      padding:10,
      displayColors:false,
      callbacks:{label:(context)=>formatValue(context.parsed.y)}
    }
  },
  scales:{
    x:{
      grid:{display:false},
      border:{display:false},
      ticks:{color:'#85858e',maxRotation:0,autoSkip:true,maxTicksLimit:6}
    },
    y:{
      beginAtZero:true,
      border:{display:false,dash:[3,5]},
      grid:{color:chartGrid,drawTicks:false},
      ticks:{color:'#92929b',padding:8,maxTicksLimit:4,callback:(value)=>formatValue(value)}
    }
  }
})

const MetricCard=({label,value,detail,Icon,accent=primaryRed})=>(
  <Card
    elevation={0}
    sx={{
      height:'100%',
      border:'1px solid #ececef',
      borderRadius:2.5,
      background:'linear-gradient(135deg,#fff 0%,#fff 72%,#fff7f7 100%)',
      overflow:'hidden',
      position:'relative',
      '&::before':{content:'""',position:'absolute',insetInlineStart:0,top:0,bottom:0,width:4,bgcolor:accent}
    }}
  >
    <CardContent sx={{p:{xs:2,sm:2.5},'&:last-child':{pb:{xs:2,sm:2.5}}}}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{minWidth:0}}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
          <Typography variant="h4" fontWeight={700} sx={{mt:1,color:'#29232b',fontSize:{xs:'1.55rem',sm:'1.85rem'}}}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{display:'block',mt:0.75}}>{detail}</Typography>
        </Box>
        <Box sx={{
          width:44,
          height:44,
          flexShrink:0,
          borderRadius:2,
          display:'grid',
          placeItems:'center',
          color:accent,
          bgcolor:accent==='#c62828'?'#ffebee':'#fff0f0'
        }}>
          <Icon fontSize="small"/>
        </Box>
      </Stack>
    </CardContent>
  </Card>
)

const MonthlyLineChart=({title,monthly,valueKey,formatValue,accent=primaryRed})=>{
  const data=monthly.slice(-12)
  const chartData={
    labels:data.map((entry)=>entry.month),
    datasets:[{
      label:title,
      data:data.map((entry)=>Number(entry[valueKey]) || 0),
      borderColor:accent,
      backgroundColor:'rgba(198,40,40,.10)',
      borderWidth:2.5,
      fill:true,
      tension:.35,
      pointRadius:data.length>10?2.5:4,
      pointHoverRadius:6,
      pointBorderWidth:2,
      pointBackgroundColor:'#fff',
      pointBorderColor:accent
    }]
  }
  const options=createLineOptions(formatValue)

  return (
    <Card elevation={0} sx={{height:'100%',border:'1px solid #ececef',borderRadius:2.5,bgcolor:'#fff'}}>
      <CardContent sx={{p:{xs:2,sm:2.5},'&:last-child':{pb:{xs:2,sm:2.5}}}}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight={650}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">Last 12 months</Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{width:7,height:7,borderRadius:'50%',bgcolor:accent}}/>
            <Typography variant="caption" color="text.secondary">{title}</Typography>
          </Stack>
        </Stack>
        {data.length ? (
          <Box sx={{mt:2,height:230,width:'100%',position:'relative'}}>
            <Line
              data={chartData}
              options={options}
              aria-label={`${title} for the last ${data.length} months`}
              role="img"
            />
          </Box>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{height:210}}>
            <Typography color="text.secondary">No monthly data available.</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

const TopProductsCard=({products})=>{
  const topProduct=products[0]
  const totalUnits=products.reduce((total,product)=>total+(Number(product.quantity)||0),0)
  const chartData={
    labels:products.map((product)=>product.title),
    datasets:[{
      label:'Units sold',
      data:products.map((product)=>Number(product.quantity) || 0),
      backgroundColor:(context)=>{
        const chart=context.chart
        const gradient=chart.ctx.createLinearGradient(0,0,chart.width,0)
        gradient.addColorStop(0,primaryRed)
        gradient.addColorStop(1,mutedRed)
        return gradient
      },
      borderRadius:8,
      borderSkipped:false,
      barThickness:20,
      maxBarThickness:24,
      hoverBackgroundColor:'#a91f27'
    }]
  }
  const valueLabelsPlugin={
    id:'topProductValueLabels',
    afterDatasetsDraw(chart){
      const {ctx}=chart
      const dataset=chart.data.datasets[0]
      const meta=chart.getDatasetMeta(0)
      ctx.save()
      ctx.font='600 11px Poppins, sans-serif'
      ctx.fillStyle='#5f5f68'
      ctx.textAlign='left'
      ctx.textBaseline='middle'
      meta.data.forEach((bar,index)=>{
        ctx.fillText(formatNumber(dataset.data[index]),bar.x+7,bar.y)
      })
      ctx.restore()
    }
  }
  const chartOptions={
    indexAxis:'y',
    responsive:true,
    maintainAspectRatio:false,
    layout:{padding:{right:32}},
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'#29232b',
        padding:10,
        displayColors:false,
        callbacks:{
          title:(items)=>products[items[0]?.dataIndex]?.title || '',
          label:(context)=>`${formatNumber(context.parsed.x)} units sold`
        }
      }
    },
    scales:{
      x:{
        beginAtZero:true,
        suggestedMax:Math.max(...products.map((product)=>Number(product.quantity)||0),1)*1.2,
        border:{display:false},
        grid:{color:chartGrid,drawTicks:false},
        ticks:{color:'#92929b',padding:6,precision:0}
      },
      y:{
        border:{display:false},
        grid:{display:false},
        ticks:{
          color:'#5f5f68',
          padding:8,
          callback(value){
            const label=this.getLabelForValue(value)
            return label.length>20?`${label.slice(0,18)}…`:label
          }
        }
      }
    }
  }

  return (
    <Card elevation={0} sx={{height:'100%',border:'1px solid #ececef',borderRadius:2.5,bgcolor:'#fff'}}>
      <CardContent sx={{p:{xs:2,sm:2.5},'&:last-child':{pb:{xs:2,sm:2.5}}}}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight={650}>Top-selling products</Typography>
            <Typography variant="caption" color="text.secondary">Ranked by units sold</Typography>
          </Box>
          {products.length>0 && (
            <Box sx={{px:1,py:.5,borderRadius:1.5,bgcolor:'#fff1f1',color:primaryRed}}>
              <Typography variant="caption" fontWeight={700}>TOP 5</Typography>
            </Box>
          )}
        </Stack>
        {products.length ? (
          <>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{mt:2,p:1.25,borderRadius:2,bgcolor:'#fff8f8',border:'1px solid #f8e5e5'}}
            >
              <Avatar
                src={topProduct.thumbnail}
                variant="rounded"
                alt={topProduct.title}
                sx={{width:42,height:42,bgcolor:'#ffebee',border:'1px solid #f3d9d9'}}
              >
                <Inventory2OutlinedIcon fontSize="small" sx={{color:primaryRed}}/>
              </Avatar>
              <Box sx={{flex:1,minWidth:0}}>
                <Typography variant="caption" fontWeight={700} sx={{color:primaryRed}}>BEST SELLER</Typography>
                <Typography variant="body2" fontWeight={600} noWrap title={topProduct.title}>{topProduct.title}</Typography>
              </Box>
              <Box sx={{textAlign:'right',flexShrink:0}}>
                <Typography variant="body2" fontWeight={700}>{formatNumber(topProduct.quantity)}</Typography>
                <Typography variant="caption" color="text.secondary">units</Typography>
              </Box>
            </Stack>
            <Box sx={{mt:1.5,height:Math.max(products.length*43,185),position:'relative'}}>
              <Bar
                data={chartData}
                options={chartOptions}
                plugins={[valueLabelsPlugin]}
                aria-label="Top-selling products by units sold"
                role="img"
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{display:'block',mt:1,textAlign:'right'}}>
              {formatNumber(totalUnits)} units across top products
            </Typography>
          </>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{height:190}}>
            <Typography color="text.secondary">No product sales available.</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

const RequestBreakdownChart=({title,subtitle,entries,entityLabel})=>{
  const chartData={
    labels:entries.map((entry)=>entry.name || entry.email || 'Unknown'),
    datasets:[{
      label:'Requests',
      data:entries.map((entry)=>Number(entry.requests) || 0),
      backgroundColor:['#c62828','#d84343','#e65a5a','#ef7777','#f59a9a','#f7b2b2','#f9caca','#fbdede','#fceaea','#fdf1f1'],
      borderRadius:6,
      borderSkipped:false,
      barThickness:18,
      maxBarThickness:22
    }]
  }
  const chartOptions={
    indexAxis:'y',
    responsive:true,
    maintainAspectRatio:false,
    interaction:{mode:'nearest',axis:'y',intersect:false},
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'#29232b',
        padding:10,
        displayColors:false,
        callbacks:{
          title:(items)=>{
            const entry=entries[items[0]?.dataIndex]
            return entry?.name || entry?.email || 'Unknown'
          },
          afterTitle:(items)=>{
            const entry=entries[items[0]?.dataIndex]
            return entry?.email && entry.email!==entry.name?entry.email:''
          },
          label:(context)=>`${formatNumber(context.parsed.x)} requests`
        }
      }
    },
    scales:{
      x:{
        beginAtZero:true,
        border:{display:false},
        grid:{color:chartGrid,drawTicks:false},
        ticks:{color:'#92929b',padding:6,precision:0}
      },
      y:{
        border:{display:false},
        grid:{display:false},
        ticks:{
          color:'#5f5f68',
          padding:8,
          callback(value){
            const label=this.getLabelForValue(value)
            return label.length>22?`${label.slice(0,20)}…`:label
          }
        }
      }
    }
  }

  return (
    <Card elevation={0} sx={{height:'100%',border:'1px solid #ececef',borderRadius:2.5,bgcolor:'#fff'}}>
      <CardContent sx={{p:{xs:2,sm:2.5},'&:last-child':{pb:{xs:2,sm:2.5}}}}>
        <Typography variant="subtitle1" fontWeight={650}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        {entries.length ? (
          <Box sx={{mt:2,height:Math.max(entries.length*43,190),maxHeight:420,position:'relative'}}>
            <Bar
              data={chartData}
              options={chartOptions}
              aria-label={title}
              role="img"
            />
          </Box>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{height:190}}>
            <Typography color="text.secondary">No {entityLabel} request data available.</Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

export const AdminStatistics=()=>{
  const [statistics,setStatistics]=useState(null)
  const [salesStatistics,setSalesStatistics]=useState(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let active=true

    Promise.allSettled([getOrderStatistics(),getAllSalesRequests()])
      .then(([ordersResult,salesResult])=>{
        if(active){
          const errors=[]
          if(ordersResult.status==='fulfilled'){
            setStatistics(ordersResult.value)
          }else{
            errors.push(`Unable to load order statistics: ${getErrorMessage(ordersResult.reason)}`)
          }
          if(salesResult.status==='fulfilled'){
            setSalesStatistics(summarizeSalesRequests(salesResult.value))
          }else{
            errors.push(`Unable to load sales request statistics: ${getErrorMessage(salesResult.reason)}`)
          }
          setError(errors.join(' '))
        }
      })
      .finally(()=>{
        if(active) setLoading(false)
      })

    return ()=>{active=false}
  },[])

  const monthly=statistics?.monthly || []
  const topProducts=statistics?.topProducts || []
  const totals=statistics?.totals || {orders:0,revenue:0}
  const topSalesperson=salesStatistics?.bestSalesperson
  const latestMonth=monthly[monthly.length-1]
  const latestMonthLabel=latestMonth?.month || 'Latest month'
  const currencyFormat=(value)=>`EGP ${formatNumber(value)}`

  return (
    <Box sx={{flexGrow:1,bgcolor:'#f6f7f9',py:{xs:2.5,md:4},px:{xs:1.5,sm:3,lg:5}}}>
      <Stack maxWidth={1500} mx="auto" spacing={{xs:2.5,md:3}}>
        <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{xs:'flex-start',sm:'flex-end'}} spacing={1}>
          <Box>
            <Typography variant="overline" sx={{color:primaryRed,fontWeight:700,letterSpacing:'.12em'}}>
              ADMIN ANALYTICS
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{color:'#29232b',mt:.25}}>
              Order statistics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mt:.75}}>
              Track order volume, revenue, and your best-selling products.
            </Typography>
          </Box>
          {latestMonth && (
            <Box sx={{px:1.5,py:.75,bgcolor:'#fff',border:'1px solid #ececef',borderRadius:2}}>
              <Typography variant="caption" color="text.secondary">Latest reporting month</Typography>
              <Typography variant="body2" fontWeight={650}>{latestMonthLabel}</Typography>
            </Box>
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Stack alignItems="center" py={10}><CircularProgress sx={{color:primaryRed}}/></Stack>
        ) : statistics || salesStatistics ? (
          <>
            <Grid container spacing={2}>
              {statistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="All-time orders"
                  value={formatNumber(totals.orders)}
                  detail="Orders recorded"
                  Icon={ShoppingBagOutlinedIcon}
                />
              </Grid>}
              {statistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="All-time revenue"
                  value={currencyFormat(totals.revenue)}
                  detail="Excludes cancelled orders"
                  Icon={PaidOutlinedIcon}
                  accent="#a91f27"
                />
              </Grid>}
              {statistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Orders this month"
                  value={formatNumber(latestMonth?.orders)}
                  detail={latestMonthLabel}
                  Icon={CalendarMonthOutlinedIcon}
                  accent="#d84343"
                />
              </Grid>}
              {statistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Revenue this month"
                  value={currencyFormat(latestMonth?.revenue)}
                  detail={latestMonthLabel}
                  Icon={PaidOutlinedIcon}
                  accent="#ef5350"
                />
              </Grid>}
              {salesStatistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Sales requests"
                  value={formatNumber(salesStatistics?.totals?.requests)}
                  detail={`${formatNumber(salesStatistics?.totals?.customers)} customers`}
                  Icon={ShoppingBagOutlinedIcon}
                  accent="#a91f27"
                />
              </Grid>}
              {salesStatistics && <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  label="Top salesperson"
                  value={topSalesperson?.name || '—'}
                  detail={topSalesperson
                    ? `${formatNumber(topSalesperson.requests)} requests`
                    : 'No sales requests yet'}
                  Icon={CalendarMonthOutlinedIcon}
                  accent="#d84343"
                />
              </Grid>}
            </Grid>

            {statistics && <Grid container spacing={2}>
              <Grid item xs={12} xl={4}>
                <MonthlyLineChart
                  title="Orders per month"
                  monthly={monthly}
                  valueKey="orders"
                  formatValue={formatCompact}
                  accent={primaryRed}
                />
              </Grid>
              <Grid item xs={12} xl={4}>
                <MonthlyLineChart
                  title="Revenue per month"
                  monthly={monthly}
                  valueKey="revenue"
                  formatValue={formatCompact}
                  accent={mutedRed}
                />
              </Grid>
              <Grid item xs={12} xl={4}>
                <TopProductsCard products={topProducts}/>
              </Grid>
            </Grid>}

            {salesStatistics && <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <RequestBreakdownChart
                  title="Requests by salesperson"
                  subtitle="Top salespeople ranked by requests"
                  entries={salesStatistics?.salespeople || []}
                  entityLabel="salesperson"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RequestBreakdownChart
                  title="Requests by customer"
                  subtitle="Top customers ranked by submitted requests"
                  entries={salesStatistics?.customers || []}
                  entityLabel="customer"
                />
              </Grid>
            </Grid>}
          </>
        ) : null}
      </Stack>
    </Box>
  )
}
