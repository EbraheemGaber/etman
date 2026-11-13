import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { getAllSalesRequests, updateSalesRequestStatus } from '../../sales/SalesApi'
import { SalesRequestsTable } from './SalesRequestsTable'

const archivedStatuses=['Approved','Rejected','Completed']

export const AdminSalesRequests=({archiveMode=false})=>{
  const [requests,setRequests]=useState([])
  const [loading,setLoading]=useState(true)
  const [updatingId,setUpdatingId]=useState('')
  const [error,setError]=useState('')
  const realtimeRequestsRef=useRef([])
  const visibleRequests=requests.filter((request)=>(
    archiveMode
      ? archivedStatuses.includes(request.status)
      : request.status==='Pending'
  ))

  useEffect(()=>{
    let active=true
    getAllSalesRequests()
      .then((result)=>{
        if(active){
          const resultIds=new Set(result.map((request)=>String(request._id)))
          const newestRequests=realtimeRequestsRef.current.filter((request)=>!resultIds.has(String(request._id)))
          setRequests([...newestRequests,...result])
        }
      })
      .catch((requestError)=>{
        if(active) setError(requestError?.message || 'تعذر تحميل طلبات المبيعات.')
      })
      .finally(()=>{
        if(active) setLoading(false)
      })
    const handleRequestCreated=(event)=>{
      const request=event.detail
      if(!request?._id) return
      realtimeRequestsRef.current=[
        request,
        ...realtimeRequestsRef.current.filter((existing)=>String(existing._id)!==String(request._id))
      ]
      setRequests((current)=>[
        request,
        ...current.filter((existing)=>String(existing._id)!==String(request._id))
      ])
    }
    window.addEventListener('sales-request-created',handleRequestCreated)

    return ()=>{
      active=false
      window.removeEventListener('sales-request-created',handleRequestCreated)
    }
  },[])

  const updateStatus=async(id,status)=>{
    setError('')
    setUpdatingId(id)
    try{
      const updated=await updateSalesRequestStatus(id,status)
      setRequests((current)=>current.map((request)=>request._id===id?updated:request))
    }catch(requestError){
      setError(requestError?.message || 'تعذر تحديث هذا الطلب.')
    }finally{
      setUpdatingId('')
    }
  }

  return (
    <Stack dir="rtl" lang="ar" maxWidth="xl" mx="auto" p={{xs:2,md:4}} spacing={2} mb={5}>
      <Typography variant="h4" fontWeight={600}>
        {archiveMode?'أرشيف طلبات المبيعات':'طلبات المبيعات'}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Stack alignItems="center" py={8}><CircularProgress/></Stack>
      ) : (
        <SalesRequestsTable
          requests={visibleRequests}
          updatingId={updatingId}
          onStatusChange={updateStatus}
          showActions={!archiveMode}
          locale="ar"
          emptyMessage={archiveMode?'لا توجد طلبات مبيعات مؤرشفة حالياً.':'لا توجد طلبات مبيعات حالياً.'}
        />
      )}
    </Stack>
  )
}
