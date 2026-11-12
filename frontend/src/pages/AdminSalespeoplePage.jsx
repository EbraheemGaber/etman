import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminSalespeople } from '../features/admin/components/AdminSalespeople'

export const AdminSalespeoplePage=()=>{
  return (
    <>
      <Navbar/>
      <AdminSalespeople/>
    </>
  )
}
