import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'

export const HomeBanner=()=>(
  <Box
    component="section"
    aria-label="عتمان جروب"
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
        display:'grid',
        gridTemplateColumns:{xs:'1fr',md:'1.2fr .8fr'},
        alignItems:'center',
        gap:{xs:2,md:4},
        maxWidth:1600,
        minHeight:{xs:470,sm:490,md:530},
        mx:'auto',
        px:{xs:2.5,sm:4,md:6},
        py:{xs:5,md:6},
        overflow:'hidden',
        border:'1px solid #f0d7d9',
        borderRadius:{xs:3,md:4},
        color:'#512b2d',
        background:'linear-gradient(125deg,#fff7f7 0%,#fdecee 55%,#f6d2d5 100%)',
        boxShadow:'0 18px 42px rgba(151,35,43,.12)'
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position:'absolute',
          width:{xs:250,md:420},
          height:{xs:250,md:420},
          left:{xs:-145,md:-120},
          bottom:{xs:-180,md:-220},
          border:'1px solid rgba(198,40,40,.12)',
          borderRadius:'50%',
          boxShadow:'0 0 0 30px rgba(198,40,40,.035),0 0 0 68px rgba(198,40,40,.025)',
          pointerEvents:'none'
        }}
      />

      <Stack
        spacing={{xs:1.5,md:2}}
        sx={{
          position:'relative',
          zIndex:1,
          alignItems:'flex-start',
          textAlign:'right'
        }}
      >
        <Typography
          sx={{
            px:1.5,
            py:.55,
            border:'1px solid #efd6d7',
            borderRadius:99,
            bgcolor:'rgba(255,255,255,.82)',
            color:'#a5272d',
            fontSize:12,
            fontWeight:800,
            letterSpacing:.5
          }}
        >
          {'ETMAN GROUP'}
        </Typography>
        <Typography
          component="h1"
          sx={{
            maxWidth:680,
            color:'#702b30',
            fontSize:{xs:'2.25rem',sm:'3rem',md:'clamp(3rem,4vw,4.4rem)'},
            fontWeight:800,
            lineHeight:1.25,
            textWrap:'balance'
          }}
        >
          {'مجموعة عتمان'}
          <Box component="span" sx={{display:'block',color:'#c62828'}}>
            {'هوية تثق بها'}
          </Box>
        </Typography>
        <Typography sx={{maxWidth:540,color:'#756568',fontSize:{xs:14,sm:16},lineHeight:1.9}}>
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
            bgcolor:'#c62828',
            color:'#fff',
            fontWeight:800,
            boxShadow:'0 7px 16px rgba(198,40,40,.2)',
            '&:hover':{bgcolor:'#a3151b',transform:'translateY(-2px)'},
            transition:'transform .2s ease,background-color .2s ease'
          }}
        >
          {'تسوق منتجاتنا'}
        </Button>
      </Stack>

      <Box
        aria-label="شعار عتمان جروب"
        sx={{
          display:{xs:'none',md:'grid'},
          position:'relative',
          zIndex:1,
          width:{md:310,lg:380},
          height:{md:310,lg:380},
          justifySelf:'center',
          placeItems:'center',
          border:'1px solid rgba(198,40,40,.18)',
          borderRadius:'50%',
          bgcolor:'rgba(198,40,40,.025)',
          boxShadow:'0 0 0 15px rgba(198,40,40,.035),inset 0 0 55px rgba(198,40,40,.045)'
        }}
      >
        <Box
          sx={{
            width:'72%',
            height:'72%',
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            justifyContent:'center',
            gap:.5,
            border:'1px solid #f0d9da',
            borderRadius:'50%',
            bgcolor:'rgba(255,255,255,.9)',
            color:'#b71c1c',
            boxShadow:'0 18px 40px rgba(70,0,0,.08)'
          }}
        >
          <Typography aria-hidden="true" sx={{fontFamily:'Georgia,serif !important',fontSize:{md:82,lg:104},fontWeight:700,lineHeight:.9}}>
            {'E'}
          </Typography>
          <Typography sx={{fontFamily:'Arial,sans-serif !important',fontSize:{md:12,lg:14},fontWeight:800,letterSpacing:{md:2,lg:3}}}>
            {'ETMAN'}
          </Typography>
          <Typography sx={{fontSize:{md:10,lg:12},fontWeight:700}}>
            {'مجموعة عتمان'}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)
