import React, { useEffect, useState } from 'react'
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { getAllSalesRequests, updateSalesRequestStatus } from '../../sales/SalesApi'
import { SalesRequestsTable } from './SalesRequestsTable'

export const AdminSalesRequests=()=>{
  const [requests,setRequests]=useState([])
  const [loading,setLoading]=useState(true)
  const [updatingId,setUpdatingId]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    getAllSalesRequests()
      .then(setRequests)
      .catch((requestError)=>setError(requestError?.message || 'Unable to load sales requests.'))
      .finally(()=>setLoading(false))
  },[])

  const updateStatus=async(id,status)=>{
    setError('')
    setUpdatingId(id)
    try{
      const updated=await updateSalesRequestStatus(id,status)
      setRequests((current)=>current.map((request)=>request._id===id?updated:request))
    }catch(requestError){
      setError(requestError?.message || 'Unable to update this request.')
    }finally{
      setUpdatingId('')
    }
  }

  return (
    <Stack maxWidth="xl" mx="auto" p={{xs:2,md:4}} spacing={2} mb={5}>
      <Typography variant="h4" fontWeight={600}>{'Sales order requests'}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Stack alignItems="center" py={8}><CircularProgress/></Stack>
      ) : (
        <SalesRequestsTable
          requests={requests}
          updatingId={updatingId}
          onStatusChange={updateStatus}
        />
      )}
    </Stack>
  )
}
