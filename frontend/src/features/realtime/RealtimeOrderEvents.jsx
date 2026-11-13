import React, { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import { selectLoggedInUser } from '../auth/AuthSlice'
import { orderReceived } from '../order/OrderSlice'
import { invalidateApiQueries } from '../../config/queryClient'
import { axiosi } from '../../config/axios'
import { useDispatch, useSelector } from 'react-redux'

const playNotificationTone=(audioContext)=>{
  const oscillator=audioContext.createOscillator()
  const gain=audioContext.createGain()
  const startTime=audioContext.currentTime

  oscillator.type='triangle'
  oscillator.frequency.setValueAtTime(880,startTime)
  oscillator.frequency.setValueAtTime(1174,startTime+.18)
  gain.gain.setValueAtTime(.0001,startTime)
  gain.gain.exponentialRampToValueAtTime(.42,startTime+.025)
  gain.gain.setValueAtTime(.42,startTime+.2)
  gain.gain.exponentialRampToValueAtTime(.0001,startTime+.48)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime+.5)
}

const getAudioContext=(audioContextRef)=>{
  const AudioContextConstructor=window.AudioContext || window.webkitAudioContext
  if(!AudioContextConstructor) return null
  if(!audioContextRef.current || audioContextRef.current.state==='closed'){
    audioContextRef.current=new AudioContextConstructor()
  }
  return audioContextRef.current
}

const getSocketOrigin=()=>{
  const fallback=`${window.location.protocol}//${window.location.hostname}:8000`
  return new URL(axiosi.defaults.baseURL || fallback,window.location.origin).origin
}

export const RealtimeOrderEvents=()=>{
  const dispatch=useDispatch()
  const loggedInUser=useSelector(selectLoggedInUser)
  const audioContextRef=useRef(null)
  const userId=loggedInUser?._id
  const isAdmin=Boolean(loggedInUser?.isAdmin)

  useEffect(()=>{
    if(!isAdmin) return undefined

    const resumeAudio=()=>{
      const audioContext=getAudioContext(audioContextRef)
      if(!audioContext){
        console.warn('Order alert sound is unavailable in this browser')
        return
      }

      if(audioContext.state==='suspended'){
        audioContext.resume().catch((error)=>{
          console.info('Order alert sound will be available after browser interaction:',error.message)
        })
      }
    }

    resumeAudio()
    const unlockAudio=()=>resumeAudio()
    window.addEventListener('pointerdown',unlockAudio,{once:true})
    window.addEventListener('keydown',unlockAudio,{once:true})
    return ()=>{
      window.removeEventListener('pointerdown',unlockAudio)
      window.removeEventListener('keydown',unlockAudio)
    }
  },[isAdmin])

  useEffect(()=>{
    if(!userId) return undefined

    const socket=io(getSocketOrigin(),{withCredentials:true})
    const playSound=()=>{
      const audioContext=getAudioContext(audioContextRef)
      if(!audioContext){
        console.warn('Order alert sound is unavailable in this browser')
        return
      }

      const play=()=>{
        playNotificationTone(audioContext)
      }

      if(audioContext.state==='suspended'){
        audioContext.resume().then(play).catch((error)=>{
          console.warn('Order alert sound could not be played:',error.message)
        })
      }else{
        play()
      }
    }

    const handleOrderCreated=({order}={})=>{
      if(!order?._id){
        console.error('Received an invalid real-time order event')
        return
      }

      invalidateApiQueries('orders')
      dispatch(orderReceived(order))
      if(isAdmin){
        toast.info(`New customer order #${String(order._id).slice(-6).toUpperCase()}`)
        playSound()
      }
    }

    const handleSalesRequestCreated=({request}={})=>{
      if(!request?._id){
        console.error('Received an invalid real-time sales request event')
        return
      }

      invalidateApiQueries('sales-requests')
      window.dispatchEvent(new CustomEvent('sales-request-created',{detail:request}))
      if(isAdmin){
        toast.info(`New sales request from ${request.customer?.name || 'a customer'}`)
        playSound()
      }
    }

    socket.on('order:created',handleOrderCreated)
    socket.on('sales-request:created',handleSalesRequestCreated)
    socket.on('connect_error',(error)=>{
      console.error('Could not connect to real-time order updates:',error.message)
    })

    return ()=>{
      socket.disconnect()
    }
  },[dispatch,isAdmin,userId])

  useEffect(()=>()=> {
    const audioContext=audioContextRef.current
    audioContextRef.current=null
    if(audioContext && audioContext.state!=='closed'){
      audioContext.close().catch((error)=>{
        console.warn('Could not close the order alert audio context:',error.message)
      })
    }
  },[])

  return null
}
