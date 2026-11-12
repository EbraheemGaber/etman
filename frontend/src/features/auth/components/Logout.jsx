import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { logoutAsync } from '../AuthSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const Logout = () => {
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const logoutStarted=useRef(false)

    useEffect(()=>{
        if(logoutStarted.current) return
        logoutStarted.current=true

        const logoutRequest=dispatch(logoutAsync())
        navigate("/login",{replace:true})
        logoutRequest
            .unwrap()
            .catch((error)=>toast.error(error?.message || "Unable to log out. Please try again."))
    },[dispatch,navigate])

    return null
}
