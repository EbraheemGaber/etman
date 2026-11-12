import React, { useEffect } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import {Footer} from '../features/footer/Footer'
import { CategoryHome } from '../features/products/components/CategoryHome'
import { HomeBanner } from '../features/products/components/HomeBanner'

export const HomePage = () => {

  const dispatch=useDispatch()
  const addressStatus=useSelector(selectAddressStatus)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){

      dispatch(resetAddressStatus())
    }
  },[addressStatus])

  return (
    <>
    <Navbar/>
    <HomeBanner/>
    <CategoryHome/>
    <Footer/>
    </>
  )
}
