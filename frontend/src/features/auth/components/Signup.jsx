import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab'
import {
  selectLoggedInUser,
  signupAsync,
  selectSignupStatus,
  selectSignupError,
  clearSignupError,
  resetSignupStatus
} from '../AuthSlice'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FormCard } from '../../../components/FormCard'
import { PasswordField } from '../../../components/PasswordField'
import { AuthHomeLink } from './AuthHomeLink'

export const Signup = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectSignupStatus)
  const error = useSelector(selectSignupError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from
  const returnPath = returnTo?.pathname?.startsWith('/') && !returnTo.pathname.startsWith('//')
    ? `${returnTo.pathname}${returnTo.search || ''}${returnTo.hash || ''}`
    : '/'

  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate('/verify-otp', { state: { from: returnTo }, replace: true })
    } else if (loggedInUser) {
      navigate(returnPath, { replace: true })
    }
  }, [loggedInUser, navigate, returnPath, returnTo])

  useEffect(() => {
    if (error) toast.error(error.message)
  }, [error])

  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success('مرحبًا بك! تحقق من بريدك الإلكتروني لبدء التسوق.')
      reset()
    }
    return () => {
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  }, [status])

  const handleSignup = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(signupAsync(cred))
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
          <Typography variant="h5" fontWeight={700} color="text.primary">{'أنشئ حسابك في متجر عتمان جروب'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {'لديك حساب بالفعل؟'}{' '}
            <Box component={Link} to="/login" state={{ from: returnTo }} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
              {'تسجيل الدخول'}
            </Box>
          </Typography>
        </Stack>

        <FormCard dir="rtl" lang="ar" width="100%" noValidate onSubmit={handleSubmit(handleSignup)} sx={{ borderRadius: 2, p: 2 }}>
          <motion.div whileHover={{ y: -2 }}>
            <TextField fullWidth {...register('name', { required: 'الاسم مطلوب' })} placeholder="الاسم" />
            {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
          </motion.div>

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
            {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <PasswordField
              fullWidth
              showPasswordLabel="إظهار كلمة المرور"
              hidePasswordLabel="إخفاء كلمة المرور"
              {...register('password', {
                required: 'كلمة المرور مطلوبة',
                pattern: {
                  value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                  message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وأن تحتوي على حرف كبير وحرف صغير ورقم.'
                }
              })}
              placeholder="كلمة المرور"
            />
            {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <PasswordField
              fullWidth
              showPasswordLabel="إظهار كلمة المرور"
              hidePasswordLabel="إخفاء كلمة المرور"
              {...register('confirmPassword', {
                required: 'يرجى تأكيد كلمة المرور',
                validate: (value, values) => value === values.password || 'كلمتا المرور غير متطابقتين'
              })}
              placeholder="تأكيد كلمة المرور"
            />
            {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton fullWidth sx={{ height: '2.5rem', borderRadius: 999, fontWeight: 700 }} loading={status === 'pending'} type="submit" variant="contained">
              {'إنشاء حساب'}
            </LoadingButton>
          </motion.div>
          <AuthHomeLink />
        </FormCard>
      </Stack>
    </Stack>
  )
}
