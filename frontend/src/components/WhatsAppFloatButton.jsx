import { useEffect, useRef, useState } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { motion, useReducedMotion } from 'framer-motion'

const whatsappNumber='0201006180117'.replace(/\D/g,'').replace(/^0/,'')
const whatsappUrl=`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحبًا، أود الاستفسار عن منتجاتكم.')}`

export const WhatsAppFloatButton=()=>{
  const theme=useTheme()
  const isSmallScreen=useMediaQuery(theme.breakpoints.down('sm'))
  const prefersReducedMotion=useReducedMotion()
  const buttonRef=useRef(null)
  const dragState=useRef({ dragging:false, moved:false, offsetX:0, offsetY:0 })
  const [position,setPosition]=useState({ x:0, y:0 })

  useEffect(()=>{
    const width=buttonRef.current?.offsetWidth || (isSmallScreen?120:164)
    const height=buttonRef.current?.offsetHeight || 54
    const nextX=Math.max(12, window.innerWidth - width - (isSmallScreen?20:28))
    const nextY=Math.max(80, window.innerHeight - height - (isSmallScreen?110:110))
    setPosition({ x: nextX, y: nextY })
  },[isSmallScreen])

  useEffect(()=>{
    const handlePointerMove=(event)=>{
      if(!dragState.current.dragging || !buttonRef.current) return

      const nextX=Math.min(
        Math.max(8, event.clientX - dragState.current.offsetX),
        window.innerWidth - buttonRef.current.offsetWidth - 8
      )
      const nextY=Math.min(
        Math.max(12, event.clientY - dragState.current.offsetY),
        window.innerHeight - buttonRef.current.offsetHeight - 8
      )

      dragState.current.moved = true
      setPosition({ x: nextX, y: nextY })
    }

    const stopDragging=()=>{
      dragState.current.dragging=false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return ()=>{
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  },[])

  const handlePointerDown=(event)=>{
    if(!buttonRef.current) return

    const rect=buttonRef.current.getBoundingClientRect()
    dragState.current.dragging=true
    dragState.current.moved=false
    dragState.current.offsetX=event.clientX - rect.left
    dragState.current.offsetY=event.clientY - rect.top
    event.preventDefault()
  }

  const handleClick=(event)=>{
    if(dragState.current.moved){
      event.preventDefault()
      dragState.current.moved=false
      return
    }
  }

  return (
    <Box
      ref={buttonRef}
      component={motion.a}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      title="تواصل معنا عبر واتساب"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      whileHover={prefersReducedMotion?undefined:{scale:1.04}}
      whileTap={prefersReducedMotion?undefined:{scale:.96}}
      animate={prefersReducedMotion?undefined:{y:[0,-4,0]}}
      transition={prefersReducedMotion?undefined:{y:{duration:2.8,repeat:Infinity,ease:'easeInOut'}}}
      sx={{
        position:'fixed',
        left:position.x,
        top:position.y,
        zIndex:theme.zIndex.tooltip,
        display:'flex',
        alignItems:'center',
        gap:1,
        p:.5,
        pl:1.5,
        border:'2px solid rgba(255,255,255,.92)',
        borderRadius:999,
        bgcolor:'#fff',
        color:'#075e54',
        textDecoration:'none',
        boxShadow:'0 5px 20px rgba(0,0,0,.2)',
        WebkitTapHighlightColor:'transparent',
        userSelect:'none',
        touchAction:'none',
        cursor:'grab',
        '&:active':{cursor:'grabbing'},
        '&:focus-visible':{
          outline:'3px solid #128c7e',
          outlineOffset:3
        }
      }}
    >
      {!isSmallScreen && (
        <Box component="span" sx={{fontSize:14,fontWeight:700,lineHeight:1,whiteSpace:'nowrap'}}>
          {'واتساب'}
        </Box>
      )}
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          width:46,
          height:46,
          display:'grid',
          placeItems:'center',
          borderRadius:'50%',
          bgcolor:'#25d366',
          boxShadow:'0 2px 8px rgba(37,211,102,.4)'
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 11.6a8 8 0 0 1-11.8 7l-4 1 1.1-3.9A8 8 0 1 1 20 11.6Z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .6.6 1 1.4 1.8 2.4 2.3.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.1-.6 1.4-.4.4-1 .6-1.6.5-1-.2-2.1-.7-3.4-1.8-1.5-1.3-2.5-2.9-2.8-3.9-.3-.9 0-1.8.4-2.4Z"
            fill="white"
          />
        </svg>
      </Box>
    </Box>
  )
}
