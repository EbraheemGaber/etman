import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminDashBoard } from '../features/admin/components/AdminDashBoard'

export const AdminStatisticsPage=()=>{
  return (
    <>
      <Navbar isProductList={true}/>
      <AdminDashBoard showStatisticsLink={false}/>
    </>
  )
}
