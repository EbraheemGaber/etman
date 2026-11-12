import { Box, FormHelperText, Stack, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearResetPasswordError,
  clearResetPasswordSuccessMessage,
  resetPasswordAsync,
  resetResetPasswordStatus,
  selectResetPasswordError,
  selectResetPasswordStatus
} from '../AuthSlice'
import { LoadingButton } from '@mui/lab'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FormCard } from '../../../components/FormCard'
import { PasswordField } from '../../../components/PasswordField'

export const ResetPassword = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const status = useSelector(selectResetPasswordStatus)
  const error = useSelector(selectResetPasswordError)
  const { userId, passwordResetToken } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) toast.error(error.message)
    return () => dispatch(clearResetPasswordError())
  }, [error])

  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success('تم تحديث كلمة المرور بنجاح.')
      navigate('/login')
    }
    return () => dispatch(clearResetPasswordSuccessMessage())
  }, [status])

  useEffect(() => () => dispatch(resetResetPasswordStatus()), [])

  const handleResetPassword = async (data) => {
    const cred = { ...data, userId, token: passwordResetToken }
    delete cred.confirmPassword
    dispatch(resetPasswordAsync(cred))
    reset()
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
      <Stack width="100%" maxWidth="22rem">
        <FormCard dir="rtl" lang="ar" width="100%" noValidate onSubmit={handleSubmit(handleResetPassword)} sx={{ borderRadius: 2, p: 2 }}>
          <Stack rowGap={0.4}>
            <Typography variant="h5" fontWeight={700}>{'إعادة تعيين كلمة المرور'}</Typography>
            <Typography color="text.secondary">{'أدخل كلمة المرور الجديدة وأكدها.'}</Typography>
          </Stack>

          <motion.div whileHover={{ y: -2 }}>
            <PasswordField
              fullWidth
              showPasswordLabel="إظهار كلمة المرور"
              hidePasswordLabel="إخفاء كلمة المرور"
              {...register('password', {
                required: 'يرجى إدخال كلمة المرور',
                pattern: {
                  value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                  message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وأن تحتوي على حرف كبير وحرف صغير ورقم.'
                }
              })}
              placeholder="كلمة المرور الجديدة"
            />
            {errors.password && <FormHelperText sx={{ mt: 1 }} error>{errors.password.message}</FormHelperText>}
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
              placeholder="تأكيد كلمة المرور الجديدة"
            />
            {errors.confirmPassword && <FormHelperText sx={{ mt: 1 }} error>{errors.confirmPassword.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton sx={{ height: '2.5rem', borderRadius: 999, fontWeight: 700 }} fullWidth loading={status === 'pending'} type="submit" variant="contained">
              {'إعادة تعيين كلمة المرور'}
            </LoadingButton>
          </motion.div>
        </FormCard>
        <Typography sx={{ mt: 2, textAlign: 'right' }} color="text.secondary">
          {'هل تتذكر كلمة المرور؟'}{' '}
          <Box component={Link} to="/login" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}>
            {'تسجيل الدخول'}
          </Box>
        </Typography>
      </Stack>
    </Stack>
  )
}
