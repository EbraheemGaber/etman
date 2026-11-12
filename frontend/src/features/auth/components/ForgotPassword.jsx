import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearForgotPasswordError,
  clearForgotPasswordSuccessMessage,
  forgotPasswordAsync,
  resetForgotPasswordStatus,
  selectForgotPasswordError,
  selectForgotPasswordStatus
} from '../AuthSlice'
import { LoadingButton } from '@mui/lab'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FormCard } from '../../../components/FormCard'
import { AuthHomeLink } from './AuthHomeLink'

export const ForgotPassword = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const status = useSelector(selectForgotPasswordStatus)
  const error = useSelector(selectForgotPasswordError)

  useEffect(() => {
    if (error) toast.error(error?.message)
    return () => dispatch(clearForgotPasswordError())
  }, [error])

  useEffect(() => {
    if (status === 'fullfilled') toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.')
    return () => dispatch(clearForgotPasswordSuccessMessage())
  }, [status])

  useEffect(() => () => dispatch(resetForgotPasswordStatus()), [])

  const handleForgotPassword = async (data) => {
    dispatch(forgotPasswordAsync(data))
    reset()
  }

  return (
    <Stack
      width="100%"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      dir="rtl"
      lang="ar"
      sx={{ px: 2, py: 4, backgroundColor: '#fff', fontFamily: 'Cairo, Tahoma, sans-serif', '& *:not(svg)': { fontFamily: 'Cairo, Tahoma, sans-serif' } }}
    >
      <Stack width="100%" maxWidth="22rem">
        <FormCard dir="rtl" lang="ar" width="100%" noValidate onSubmit={handleSubmit(handleForgotPassword)} sx={{ borderRadius: 2, p: 2 }}>
          <Stack rowGap={0.4}>
            <Typography variant="h5" fontWeight={700}>
              {status === 'fullfilled' ? 'تم إرسال البريد الإلكتروني' : 'هل نسيت كلمة المرور؟'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {status === 'fullfilled'
                ? 'يرجى التحقق من بريدك الإلكتروني واتباع رابط إعادة تعيين كلمة المرور.'
                : 'أدخل بريدك الإلكتروني المسجل وسنرسل إليك رابط إعادة تعيين كلمة المرور.'}
            </Typography>
          </Stack>

          {status !== 'fullfilled' && (
            <>
              <motion.div whileHover={{ y: -2 }}>
                <TextField
                  fullWidth
                  {...register('email', {
                    required: 'يرجى إدخال البريد الإلكتروني',
                    pattern: {
                      value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                      message: 'أدخل بريدًا إلكترونيًا صحيحًا'
                    }
                  })}
                  placeholder="البريد الإلكتروني"
                />
                {errors.email && <FormHelperText sx={{ mt: 1 }} error>{errors.email.message}</FormHelperText>}
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <LoadingButton sx={{ height: '2.5rem', borderRadius: 999, fontWeight: 700 }} fullWidth loading={status === 'pending'} type="submit" variant="contained">
                  {'إرسال رابط إعادة التعيين'}
                </LoadingButton>
              </motion.div>
            </>
          )}
          <AuthHomeLink />
        </FormCard>

        <Typography sx={{ textDecoration: 'none', color: 'text.primary', mt: 2, textAlign: 'right' }} to="/login" variant="body2" component={Link}>
          {'العودة إلى'}{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>{'تسجيل الدخول'}</Box>
        </Typography>
      </Stack>
    </Stack>
  )
}
