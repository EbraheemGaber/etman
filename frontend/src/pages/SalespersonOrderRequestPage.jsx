import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { SalespersonOrderRequest } from '../features/sales/components/SalespersonOrderRequest'

export const SalespersonOrderRequestPage=()=>{
  return (
    <>
      <Navbar/>
      <SalespersonOrderRequest/>
    </>
  )
}
