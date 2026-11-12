import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { getSalespeople, setSalespersonAccess } from '../../sales/SalesApi'

const getErrorMessage=(error)=>{
  if(typeof error==='string') return error
  return error?.message || error?.response?.data?.message || 'Unable to load verified users. Check the backend connection and admin session, then retry.'
}

export const AdminSalespeople=()=>{
  const [users,setUsers]=useState([])
  const [loading,setLoading]=useState(true)
  const [updatingId,setUpdatingId]=useState('')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  const loadUsers=useCallback(async()=>{
    setLoading(true)
    setError('')
    try{
      setUsers(await getSalespeople())
    }catch(requestError){
      setError(getErrorMessage(requestError))
    }finally{
      setLoading(false)
    }
  },[])

  useEffect(()=>{
    loadUsers()
  },[loadUsers])

  const toggleAccess=async(user)=>{
    setError('')
    setMessage('')
    setUpdatingId(user._id)
    try{
      const updated=await setSalespersonAccess(user._id,!user.isSalesperson)
      setUsers((current)=>current.map((item)=>item._id===user._id?{...item,...updated}:item))
      setMessage(`${user.name} salesperson access ${updated.isSalesperson?'granted':'removed'}. They must sign in again for the change to take effect.`)
    }catch(requestError){
      setError(getErrorMessage(requestError))
    }finally{
      setUpdatingId('')
    }
  }

  return (
    <Stack maxWidth="md" mx="auto" p={{xs:2,md:4}} spacing={2}>
      <Typography variant="h4" fontWeight={600}>{'Manage salespeople'}</Typography>
      <Typography color="text.secondary">{'Verified non-admin accounts can be granted or removed salesperson access.'}</Typography>
      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadUsers}>{'Retry'}</Button>}>{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      {loading ? <Stack alignItems="center" py={8}><CircularProgress/></Stack> : error ? null : users.length ? users.map((user)=>(
        <Paper key={user._id} elevation={1} sx={{p:2}}>
          <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" alignItems={{xs:'stretch',sm:'center'}} spacing={1}>
            <Stack>
              <Typography fontWeight={600}>{user.name}</Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Stack>
            <Button
              variant={user.isSalesperson?'outlined':'contained'}
              color={user.isSalesperson?'error':'primary'}
              disabled={updatingId===user._id}
              onClick={()=>toggleAccess(user)}
            >
              {user.isSalesperson?'Remove access':'Make salesperson'}
            </Button>
          </Stack>
        </Paper>
      )):<Typography color="text.secondary">{'No verified users to manage.'}</Typography>}
    </Stack>
  )
}
