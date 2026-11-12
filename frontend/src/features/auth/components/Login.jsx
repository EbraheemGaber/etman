import { Box, FormHelperText, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import {useDispatch,useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser,loginAsync,selectLoginStatus,selectLoginError,selectLogoutStatus,clearLoginError,resetLoginStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import {MotionConfig, motion} from 'framer-motion'
import { FormCard } from '../../../components/FormCard'
import { PasswordField } from '../../../components/PasswordField'

export const Login = () => {
  const dispatch=useDispatch()
  const status=useSelector(selectLoginStatus)
  const logoutStatus=useSelector(selectLogoutStatus)
  const error=useSelector(selectLoginError)
  const loggedInUser=useSelector(selectLoggedInUser)
  const {register,handleSubmit,reset,formState: { errors }} = useForm()
  const navigate=useNavigate()
  const theme=useTheme()
  const is480=useMediaQuery(theme.breakpoints.down(480))
  
  // handles user redirection
  useEffect(()=>{
    if(logoutStatus==='pending'){
      return
    }

    if(loggedInUser && loggedInUser?.isVerified){
      navigate("/")
    }
    else if(loggedInUser && !loggedInUser?.isVerified){
      navigate("/verify-otp")
    }
  },[loggedInUser,logoutStatus,navigate])

  // handles login error and toast them
  useEffect(()=>{
    if(error){
      toast.error(error.message)
    }
  },[error])

  // handles login status and dispatches reset actions to relevant states in cleanup
  useEffect(()=>{
    if(status==='fullfilled' && loggedInUser?.isVerified===true){
      toast.success('Login successful')
      reset()
    }
    return ()=>{
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  },[status])

  const handleLogin=(data)=>{
    const cred={...data}
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <Stack width={'100vw'} height={'100vh'} flexDirection={'row'} sx={{overflowY:"hidden"}}>
        
        <Stack flex={1} justifyContent={'center'} alignItems={'center'} sx={{width:'100%'}}>

              <motion.div
                initial={{opacity:0,y:14}}
                animate={{opacity:1,y:0}}
                transition={{duration:.55,ease:'easeOut'}}
              >
                <Stack alignItems="center" spacing={0.5}>
                  <Typography
                    variant="h3"
                    align="center"
                    sx={{
                      color:'text.primary',
                      fontWeight:800,
                      letterSpacing:{xs:'.06em',sm:'.1em'},
                      lineHeight:1.15,
                      fontSize:{xs:'1.85rem',sm:'2.5rem'}
                    }}
                  >
                    {'ETMAN GROUP'}
                    <Box component="span" sx={{color:'primary.main',ml:1}}>{'STORE'}</Box>
                  </Typography>
                  <motion.div
                    initial={{scaleX:0}}
                    animate={{scaleX:1}}
                    transition={{duration:.45,delay:.25,ease:'easeOut'}}
                    style={{height:3,width:76,backgroundColor:theme.palette.primary.main,borderRadius:999,transformOrigin:'center'}}
                  />
                  <Typography color="text.secondary" variant="body2" align="center">
                    {'Your everyday shopping destination'}
                  </Typography>
                </Stack>
              </motion.div>

                <FormCard mt={4} width={is480?"95vw":'28rem'} noValidate onSubmit={handleSubmit(handleLogin)}>

                    <motion.div whileHover={{y:-5}}>
                      <TextField fullWidth {...register("email",{required:"Email is required",pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,message:"Enter a valid email"}})} placeholder={'Email'}/>
                      {errors.email && <FormHelperText sx={{mt:1}} error>{errors.email.message}</FormHelperText>}
                    </motion.div>

                    
                    <motion.div whileHover={{y:-5}}>
                      <PasswordField fullWidth {...register("password",{required:"Password is required"})} placeholder={'Password'}/>
                      {errors.password && <FormHelperText sx={{mt:1}} error>{errors.password.message}</FormHelperText>}
                    </motion.div>
                    
                    <motion.div whileHover={{scale:1.020}} whileTap={{scale:1}}>
                      <LoadingButton fullWidth  sx={{height:'2.5rem'}} loading={status==='pending'} type='submit' variant='contained'>{'Login'}</LoadingButton>
                    </motion.div>

                    <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'} >

                      <MotionConfig whileHover={{x:2}} whileTap={{scale:1.050}}>
                          <motion.div>
                              <Typography mr={'1.5rem'} sx={{textDecoration:"none",color:"text.primary"}} to={'/forgot-password'} component={Link}>{'Forgot password'}</Typography>
                          </motion.div>

                          <motion.div>
                            <Typography sx={{textDecoration:"none",color:"text.primary"}} to={'/signup'} component={Link}>{"Don't have an account? "}<span style={{color:theme.palette.primary.dark}}>{'Register'}</span></Typography>
                          </motion.div>
                      </MotionConfig>

                    </Stack>
                    </FormCard>

                    </Stack>
        </Stack>
  )
}
