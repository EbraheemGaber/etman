import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { motion, useReducedMotion } from 'framer-motion'

export const HomeBanner=()=>{
  const prefersReducedMotion=useReducedMotion()

  const brandMotion=prefersReducedMotion
    ?{}
    :{initial:{opacity:0,scale:.94},animate:{opacity:1,scale:1},transition:{duration:.7,ease:'easeOut'}}

  return (
    <Box
      component="section"
      aria-label="مجموعة عثمان"
      dir="rtl"
      lang="ar"
      sx={{
        px:{xs:1.5,sm:2,md:4},
        pt:{xs:2,md:3},
        fontFamily:'Cairo, Tahoma, sans-serif',
        '& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}
      }}
    >
      <Box
        sx={{
          position:'relative',
          display:'flex',
          alignItems:'center',
          minHeight:{xs:440,sm:390,md:390},
          maxWidth:1600,
          mx:'auto',
          overflow:'hidden',
          borderRadius:{xs:3,md:4},
          color:'#fff',
          background:'radial-gradient(circle at 18% 18%,rgba(255,255,255,.2),transparent 30%),linear-gradient(125deg,#790000 0%,#a3151b 48%,#c62828 100%)',
          boxShadow:'0 18px 42px rgba(142,0,0,.2)'
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position:'absolute',
            width:{xs:280,sm:390},
            height:{xs:280,sm:390},
            left:{xs:'-22%',sm:'-5%',md:'8%'},
            bottom:{xs:'-25%',sm:'-34%',md:'-25%'},
            border:'1px solid rgba(255,255,255,.18)',
            borderRadius:'50%',
            boxShadow:'0 0 0 28px rgba(255,255,255,.035),0 0 0 62px rgba(255,255,255,.025),0 0 0 100px rgba(255,255,255,.018)'
          }}
        />
        <Stack
          spacing={{xs:1.5,sm:2}}
          sx={{
            position:'relative',
            zIndex:1,
            width:{xs:'100%',md:'56%'},
            alignItems:'flex-start',
            textAlign:'right',
            px:{xs:2.5,sm:4,md:6},
            py:{xs:4,md:5}
          }}
        >
          <Typography
            sx={{
              px:1.5,
              py:.5,
              borderRadius:99,
              bgcolor:'rgba(255,255,255,.14)',
              border:'1px solid rgba(255,255,255,.22)',
              fontSize:12,
              fontWeight:700,
              letterSpacing:.3
            }}
          >
            {'ETMAN GROUP'}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontSize:{xs:'2.25rem',sm:'3rem',md:'clamp(2.8rem,4.5vw,4.3rem)'},
              fontWeight:800,
              lineHeight:1.25,
              textWrap:'balance'
            }}
          >
            {'مجموعة عثمان'}
            <Box component="span" sx={{display:'block',color:'#ffe2e2'}}>
              {'هوية تثق بها'}
            </Box>
          </Typography>
          <Typography sx={{maxWidth:440,color:'rgba(255,255,255,.86)',fontSize:{xs:14,sm:16},lineHeight:1.9}}>
            {'اسم يجمع بين الثقة والجودة، ورؤية تضع رضاكم في المقدمة.'}
          </Typography>
          <Button
            component="a"
            href="#products"
            variant="contained"
            endIcon={<ArrowBackRoundedIcon/>}
            sx={{
              mt:.5,
              px:3,
              py:1.1,
              borderRadius:99,
              bgcolor:'#fff',
              color:'#a3151b',
              fontWeight:800,
              '&:hover':{bgcolor:'#fff1f1',transform:'translateY(-2px)'},
              transition:'transform .2s ease,background-color .2s ease'
            }}
          >
            {'تسوق منتجاتنا'}
          </Button>
        </Stack>

        <Box
          aria-label="هوية مجموعة عثمان"
          sx={{
            position:'absolute',
            left:{xs:'50%',sm:'56%',md:'8%'},
            top:{xs:'55%',sm:'53%',md:'50%'},
            transform:{xs:'translate(-50%,-20%)',sm:'translate(-50%,-15%)',md:'translateY(-50%)'},
            width:{xs:220,sm:280,md:360},
            height:{xs:220,sm:280,md:360},
            display:'grid',
            placeItems:'center',
            borderRadius:'50%',
            border:'1px solid rgba(255,255,255,.32)',
            bgcolor:'rgba(255,255,255,.06)',
            boxShadow:'0 0 0 14px rgba(255,255,255,.035),inset 0 0 60px rgba(255,255,255,.08)',
            pointerEvents:'none'
          }}
        >
          <Box
            component={motion.div}
            {...brandMotion}
            sx={{
              width:'72%',
              height:'72%',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:.25,
              borderRadius:'50%',
              border:'1px solid rgba(255,255,255,.42)',
              bgcolor:'rgba(255,255,255,.95)',
              color:'#a3151b',
              boxShadow:'0 24px 48px rgba(70,0,0,.28)'
            }}
          >
            <Typography aria-hidden="true" sx={{fontFamily:'Georgia,serif !important',fontSize:{xs:64,sm:82,md:104},fontWeight:700,lineHeight:.9}}>
              {'E'}
            </Typography>
            <Typography sx={{fontFamily:'Arial,sans-serif !important',fontSize:{xs:12,sm:14},fontWeight:800,letterSpacing:{xs:2,sm:3}}}>
              {'ETMAN'}
            </Typography>
            <Typography sx={{fontSize:{xs:10,sm:12},fontWeight:700}}>
              {'مجموعة عثمان'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
