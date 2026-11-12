import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearOtpVerificationError,
  clearResendOtpError,
  clearResendOtpSuccessMessage,
  resendOtpAsync,
  resetOtpVerificationStatus,
  resetResendOtpStatus,
  selectLoggedInUser,
  selectOtpVerificationError,
  selectOtpVerificationStatus,
  selectResendOtpError,
  selectResendOtpStatus,
  verifyOtpAsync
} from '../AuthSlice'
import { LoadingButton } from '@mui/lab'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FormCard } from '../../../components/FormCard'
import { AuthHomeLink } from './AuthHomeLink'

export const OtpVerfication = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.from
  const returnPath = returnTo?.pathname?.startsWith('/') && !returnTo.pathname.startsWith('//')
    ? `${returnTo.pathname}${returnTo.search || ''}${returnTo.hash || ''}`
    : '/'
  const resendOtpStatus = useSelector(selectResendOtpStatus)
  const resendOtpError = useSelector(selectResendOtpError)
  const otpVerificationStatus = useSelector(selectOtpVerificationStatus)
  const otpVerificationError = useSelector(selectOtpVerificationError)

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login')
    } else if (loggedInUser && loggedInUser?.isVerified) {
      navigate(returnPath, { replace: true })
    }
  }, [loggedInUser, navigate, returnPath])

  const handleSendOtp = () => {
    dispatch(resendOtpAsync({ user: loggedInUser?._id }))
  }

  const handleVerifyOtp = (data) => {
    dispatch(verifyOtpAsync({ ...data, userId: loggedInUser?._id }))
  }

  useEffect(() => {
    if (resendOtpError) toast.error(resendOtpError.message)
    return () => dispatch(clearResendOtpError())
  }, [resendOtpError])

  useEffect(() => {
    if (resendOtpStatus === 'fullfilled') toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني.')
    return () => dispatch(clearResendOtpSuccessMessage())
  }, [resendOtpStatus])

  useEffect(() => {
    if (otpVerificationError) toast.error(otpVerificationError.message)
    return () => dispatch(clearOtpVerificationError())
  }, [otpVerificationError])

  useEffect(() => {
    if (otpVerificationStatus === 'fullfilled') {
      toast.success('تم التحقق من البريد الإلكتروني بنجاح.')
      dispatch(resetResendOtpStatus())
    }
    return () => dispatch(resetOtpVerificationStatus())
  }, [otpVerificationStatus])

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
      <Stack width="100%" maxWidth="22rem">
        <FormCard
          dir="rtl"
          lang="ar"
          width="100%"
          noValidate
          onSubmit={resendOtpStatus === 'fullfilled' ? handleSubmit(handleVerifyOtp) : undefined}
          sx={{ borderRadius: 2, p: 2 }}
        >
          <Typography variant="h5" fontWeight={700}>{'تأكيد البريد الإلكتروني'}</Typography>

          {resendOtpStatus === 'fullfilled' ? (
            <Stack spacing={2}>
              <Stack spacing={0.4}>
                <Typography color="text.secondary">{'أدخل رمز التحقق المكوّن من 4 أرقام والمرسل إلى'}</Typography>
                <Typography fontWeight={600} color="text.secondary" dir="ltr" textAlign="right">{loggedInUser?.email}</Typography>
              </Stack>
              <Stack>
                <TextField
                  {...register('otp', { required: 'رمز التحقق مطلوب', minLength: { value: 4, message: 'أدخل رمز التحقق المكوّن من 4 أرقام' } })}
                  fullWidth
                  type="number"
                  placeholder="رمز التحقق"
                  inputProps={{ inputMode: 'numeric' }}
                />
                {errors.otp && <FormHelperText error>{errors.otp.message}</FormHelperText>}
              </Stack>
              <LoadingButton loading={otpVerificationStatus === 'pending'} type="submit" fullWidth variant="contained" sx={{ borderRadius: 999, fontWeight: 700 }}>
                {'تحقق'}
              </LoadingButton>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack spacing={0.4}>
                <Typography color="text.secondary">{'سنرسل رمز تحقق إلى'}</Typography>
                <Typography fontWeight={600} color="text.secondary" dir="ltr" textAlign="right">{loggedInUser?.email}</Typography>
              </Stack>
              <LoadingButton type="button" onClick={handleSendOtp} loading={resendOtpStatus === 'pending'} fullWidth variant="contained" sx={{ borderRadius: 999, fontWeight: 700 }}>
                {'إرسال رمز التحقق'}
              </LoadingButton>
            </Stack>
          )}
          <AuthHomeLink />
        </FormCard>
        <Typography sx={{ mt: 2, textAlign: 'right' }} color="text.secondary">
          {'هل تريد استخدام حساب آخر؟'}{' '}
          <Box component={Link} to="/login" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}>
            {'تسجيل الدخول'}
          </Box>
        </Typography>
      </Stack>
    </Stack>
  )
}
