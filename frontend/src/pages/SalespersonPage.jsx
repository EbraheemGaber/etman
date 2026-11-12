import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { SalespersonDashboard } from '../features/sales/components/SalespersonDashboard'

export const SalespersonPage=()=>{
  return (
    <>
      <Navbar/>
      <SalespersonDashboard/>
    </>
  )
}
