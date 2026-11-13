import React, { useState } from 'react'
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
  Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const statusStyles={
  Pending:{backgroundColor:'#fff3cd',color:'#856404'},
  Approved:{backgroundColor:'#e3f2fd',color:'#1565c0'},
  Rejected:{backgroundColor:'#ffebee',color:'#c62828'},
  Completed:{backgroundColor:'#e8f5e9',color:'#2e7d32'}
}

const formatCurrency=(amount,locale)=>new Intl.NumberFormat(locale==='ar'?'ar-EG-u-nu-latn':locale,{
  style:'currency',
  currency:'USD'
}).format(Number(amount) || 0)

const formatDate=(date,locale)=>{
  const parsedDate=new Date(date)
  const numberLocale=locale==='ar'?'ar-EG-u-nu-latn':locale
  return Number.isNaN(parsedDate.getTime())?'—':parsedDate.toLocaleDateString(numberLocale)
}

export const SalesRequestsTable=({
  requests,
  updatingId,
  onStatusChange,
  showActions=true,
  showSalesperson=true,
  locale='en-US',
  emptyMessage='No sales requests yet.'
})=>{
  const [expandedId,setExpandedId]=useState('')
  const isArabic=locale==='ar'
  const statusLabels=isArabic
    ?{Pending:'قيد الانتظار',Approved:'تمت الموافقة',Rejected:'مرفوض',Completed:'مكتمل'}
    :{}
  const columnCount=7+Number(showActions)+Number(showSalesperson)

  if(!requests.length){
    return <Typography color="text.secondary">{emptyMessage}</Typography>
  }

  return (
    <TableContainer component={Paper} elevation={1} sx={{borderRadius:2,overflowX:'auto'}}>
      <Table size="small" dir={isArabic?'rtl':'ltr'} sx={{minWidth:1050}} aria-label={isArabic?'طلبات المبيعات':'Sales order requests'}>
        <TableHead>
          <TableRow sx={{'& th':{color:'text.secondary',fontWeight:600,whiteSpace:'nowrap',borderBottom:'1px solid #e0e0e0'}}}>
            <TableCell padding="checkbox" />
            <TableCell>{isArabic?'الطلب':'Request'}</TableCell>
            <TableCell>{isArabic?'العميل':'Customer'}</TableCell>
            {showSalesperson && <TableCell>{isArabic?'مندوب المبيعات':'Salesperson'}</TableCell>}
            <TableCell>{isArabic?'المنتجات':'Items'}</TableCell>
            <TableCell align="right">{isArabic?'الإجمالي':'Total'}</TableCell>
            <TableCell>{isArabic?'تاريخ الطلب':'Requested'}</TableCell>
            <TableCell>{isArabic?'الحالة':'Status'}</TableCell>
            {showActions && <TableCell align="right">{isArabic?'الإجراءات':'Actions'}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request)=>{
            const expanded=expandedId===request._id
            const items=request.items || []

            return (
              <React.Fragment key={request._id}>
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
                      aria-label={expanded
                        ?isArabic?'إخفاء تفاصيل الطلب':'Hide request details'
                        :isArabic?'عرض تفاصيل الطلب':'Show request details'}
                      aria-expanded={expanded}
                      onClick={()=>setExpandedId(expanded?'':request._id)}
                      sx={{transform:expanded?'rotate(180deg)':'rotate(0deg)',transition:'transform 200ms ease'}}
                    >
                      <KeyboardArrowDownIcon fontSize="small"/>
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{whiteSpace:'nowrap'}}>
                    <Typography variant="body2" fontWeight={600}>
                      #{request._id?.slice(-6).toUpperCase() || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{request.customer?.name || (isArabic?'عميل غير معروف':'Unknown customer')}</Typography>
                  </TableCell>
                  {showSalesperson && (
                    <TableCell>
                      <Typography variant="body2">{request.salesperson?.name || request.salesperson?.email || (isArabic?'غير معروف':'Unknown')}</Typography>
                    </TableCell>
                  )}
                  <TableCell sx={{whiteSpace:'nowrap'}}>{isArabic?`${items.length} ${items.length===1?'منتج':'منتجات'}`: `${items.length} ${items.length===1?'item':'items'}`}</TableCell>
                  <TableCell align="right" sx={{whiteSpace:'nowrap',fontWeight:600}}>
                    {formatCurrency(request.total,locale)}
                  </TableCell>
                  <TableCell sx={{whiteSpace:'nowrap'}}>{formatDate(request.createdAt,locale)}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[request.status] || request.status}
                      size="small"
                      sx={statusStyles[request.status] || {backgroundColor:'#f5f5f5',color:'text.primary'}}
                    />
                  </TableCell>
                  {showActions && <TableCell align="right" sx={{minWidth:180}}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {request.status==='Pending' && <>
                        <Button
                          size="small"
                          color="error"
                          disabled={updatingId===request._id}
                          onClick={()=>onStatusChange(request._id,'Rejected')}
                        >
                          {isArabic?'رفض':'Reject'}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={updatingId===request._id}
                          onClick={()=>onStatusChange(request._id,'Approved')}
                        >
                          {isArabic?'موافقة':'Approve'}
                        </Button>
                      </>}
                      {request.status==='Approved' &&
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={updatingId===request._id}
                          onClick={()=>onStatusChange(request._id,'Completed')}
                        >
                          {isArabic?'إكمال':'Complete'}
                        </Button>
                      }
                      {['Rejected','Completed'].includes(request.status) && '—'}
                    </Stack>
                  </TableCell>}
                </TableRow>
                <TableRow>
                  <TableCell colSpan={columnCount} sx={{p:0,borderBottom:expanded?'1px solid rgba(224, 224, 224, 1)':0}}>
                    <Collapse in={expanded} timeout={220} unmountOnExit>
                      <Stack
                        direction={{xs:'column',md:'row'}}
                        spacing={{xs:1.5,md:4}}
                        sx={{px:3,py:2,backgroundColor:'action.hover'}}
                      >
                        <Stack spacing={0.5} minWidth={{md:220}}>
                          <Typography variant="subtitle2">{isArabic?'بيانات العميل':'Customer details'}</Typography>
                          <Typography variant="body2" color="text.secondary">{request.customer?.email || '—'}</Typography>
                          <Typography variant="body2" color="text.secondary">{request.customer?.phone || '—'}</Typography>
                        </Stack>
                        {showSalesperson && (
                          <Stack spacing={0.5} minWidth={{md:220}}>
                            <Typography variant="subtitle2">{isArabic?'بيانات مندوب المبيعات':'Salesperson details'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.salesperson?.name || (isArabic?'غير معروف':'Unknown')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {request.salesperson?.email || '—'}
                            </Typography>
                          </Stack>
                        )}
                        <Stack spacing={0.5} flex={1}>
                          <Typography variant="subtitle2">{isArabic?'منتجات الطلب':'Order items'}</Typography>
                          {items.map((item,index)=>(
                            <Stack
                              key={`${request._id}-${index}`}
                              direction="row"
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {item.product?.title || (isArabic?'منتج':'Product')} × {item.quantity}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{whiteSpace:'nowrap'}}>
                                {formatCurrency((item.product?.price || 0)*item.quantity,locale)}
                              </Typography>
                            </Stack>
                          ))}
                          <Typography variant="body2" fontWeight={600} sx={{pt:0.5}}>
                            {isArabic?'الإجمالي:':'Total:'} {formatCurrency(request.total,locale)}
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
  )
}
