import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminSalesRequests } from '../features/admin/components/AdminSalesRequests'

export const AdminSalesRequestsPage=()=>{
  return (
    <>
      <Navbar/>
      <AdminSalesRequests/>
    </>
  )
}
