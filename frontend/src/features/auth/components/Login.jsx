import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab'
import {
  selectLoggedInUser,
  loginAsync,
  selectLoginStatus,
  selectLoginError,
  selectLogoutStatus,
  clearLoginError,
  resetLoginStatus
} from '../AuthSlice'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FormCard } from '../../../components/FormCard'
import { PasswordField } from '../../../components/PasswordField'
import { AuthHomeLink } from './AuthHomeLink'

export const Login = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectLoginStatus)
  const logoutStatus = useSelector(selectLogoutStatus)
  const error = useSelector(selectLoginError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from
  const returnPath = returnTo?.pathname?.startsWith('/') && !returnTo.pathname.startsWith('//')
    ? `${returnTo.pathname}${returnTo.search || ''}${returnTo.hash || ''}`
    : '/'

  useEffect(() => {
    if (logoutStatus === 'pending') return

    if (loggedInUser && loggedInUser?.isVerified) {
      navigate(returnPath, { replace: true })
    } else if (loggedInUser && !loggedInUser?.isVerified) {
      navigate('/verify-otp', { state: { from: returnTo }, replace: true })
    }
  }, [loggedInUser, logoutStatus, navigate, returnPath, returnTo])

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser?.isVerified === true) {
      toast.success('تم تسجيل الدخول بنجاح')
      reset()
    }
    return () => {
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  }, [status])

  const handleLogin = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <Stack
      width="100%"
      minHeight="100vh"
      justifyContent="center"
      alignItems="center"
      dir="rtl"
      lang="ar"
      sx={{ px: 2, py: 4, backgroundColor: '#fff', fontFamily: 'Cairo, Tahoma, sans-serif', '& *:not(svg)': { fontFamily: 'Cairo, Tahoma, sans-serif' } }}
    >
      <Stack width="100%" maxWidth="22rem" alignItems="stretch">
        <Stack alignItems="flex-start" spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700} color="text.primary">{'أهلاً بك مجددًا في متجر عتمان جروب'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {'ليس لديك حساب؟'}{' '}
            <Box component={Link} to="/signup" state={{ from: returnTo }} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              {'أنشئ حسابًا'}
            </Box>
          </Typography>
        </Stack>

        <FormCard dir="rtl" lang="ar" width="100%" noValidate onSubmit={handleSubmit(handleLogin)} sx={{ borderRadius: 2, p: 2 }}>
          <motion.div whileHover={{ y: -2 }}>
            <TextField
              fullWidth
              {...register('email', {
                required: 'البريد الإلكتروني مطلوب',
                pattern: {
                  value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                  message: 'أدخل بريدًا إلكترونيًا صحيحًا'
                }
              })}
              placeholder="البريد الإلكتروني"
            />
            {errors.email && <FormHelperText sx={{ mt: 1 }} error>{errors.email.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <PasswordField
              fullWidth
              showPasswordLabel="إظهار كلمة المرور"
              hidePasswordLabel="إخفاء كلمة المرور"
              {...register('password', { required: 'كلمة المرور مطلوبة' })}
              placeholder="كلمة المرور"
            />
            {errors.password && <FormHelperText sx={{ mt: 1 }} error>{errors.password.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton fullWidth sx={{ height: '2.5rem', borderRadius: 999, fontWeight: 700 }} loading={status === 'pending'} type="submit" variant="contained">
              {'تسجيل الدخول'}
            </LoadingButton>
          </motion.div>

          <Typography sx={{ textDecoration: 'none', color: 'text.primary', fontSize: '.9rem' }} to="/forgot-password" component={Link}>
            {'نسيت كلمة المرور؟'}
          </Typography>
          <AuthHomeLink />
        </FormCard>
      </Stack>
    </Stack>
  )
}
