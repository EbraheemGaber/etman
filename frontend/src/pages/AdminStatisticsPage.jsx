import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminStatistics } from '../features/admin/components/AdminStatistics'

export const AdminStatisticsPage=()=>{
  return (
    <>
      <Navbar />
      <AdminStatistics />
    </>
  )
}
