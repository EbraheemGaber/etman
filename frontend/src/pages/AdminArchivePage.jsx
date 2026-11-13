import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminOrders } from '../features/admin/components/AdminOrders'
import { AdminSalesRequests } from '../features/admin/components/AdminSalesRequests'

export const AdminArchivePage=()=>{
  return (
    <>
      <Navbar/>
      <AdminOrders archiveMode/>
      <AdminSalesRequests archiveMode/>
    </>
  )
}
