import { Box, FormHelperText, Stack, Typography } from '@mui/material'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
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
import { AuthHomeLink } from './AuthHomeLink'

export const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const dispatch = useDispatch()
  const status = useSelector(selectResetPasswordStatus)
  const error = useSelector(selectResetPasswordError)
  const { userId, passwordResetToken } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) toast.error(error.message)
    return () => dispatch(clearResetPasswordError())
  }, [dispatch, error])

  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success('تم تحديث كلمة المرور بنجاح.')
      navigate('/login')
    }
    return () => dispatch(clearResetPasswordSuccessMessage())
  }, [dispatch, navigate, status])

  useEffect(() => () => dispatch(resetResetPasswordStatus()), [dispatch])

  const handleResetPassword = (data) => {
    const cred = { ...data, userId, token: passwordResetToken }
    delete cred.confirmPassword
    dispatch(resetPasswordAsync(cred))
  }

  const passwordInputSx = {
    '& .MuiInputBase-input': { direction: 'rtl', textAlign: 'right' },
    '& .MuiInputBase-input::placeholder': { textAlign: 'right', opacity: 1 }
  }

  return (
    <Stack
      width="100%"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      dir="rtl"
      lang="ar"
      sx={{ px: 2, py: 4, backgroundColor: '#faf7f6', fontFamily: 'Cairo, Tahoma, sans-serif', '& *:not(svg)': { fontFamily: 'Cairo, Tahoma, sans-serif' } }}
    >
      <Stack width="100%" maxWidth="27rem" spacing={2.5}>
        <Stack alignItems="center" spacing={1}>
          <Box sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: '#fff0f0', color: '#c62828' }}>
            <LockResetOutlinedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography dir="ltr" sx={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.5, color: '#c62828' }}>
            {'ETMAN GROUP'}
          </Typography>
        </Stack>

        <FormCard
          dir="rtl"
          lang="ar"
          width="100%"
          noValidate
          onSubmit={handleSubmit(handleResetPassword)}
          sx={{
            border: '1px solid #f0dedd',
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 14px 36px rgba(117,29,36,.1)'
          }}
        >
          <Stack spacing={0.75} sx={{ mb: 0.5 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#302526' }}>
              {'إعادة تعيين كلمة المرور'}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {'أنشئ كلمة مرور جديدة وآمنة لحسابك.'}
            </Typography>
          </Stack>

          <motion.div whileHover={{ y: -2 }}>
            <PasswordField
              fullWidth
              showPasswordLabel="إظهار كلمة المرور"
              hidePasswordLabel="إخفاء كلمة المرور"
              {...register('password', {
                required: 'يرجى إدخال كلمة المرور',
                pattern: {
                  value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                  message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل، وأن تحتوي على حرف كبير وحرف صغير ورقم.'
                }
              })}
              placeholder="كلمة المرور الجديدة"
              sx={passwordInputSx}
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
              sx={passwordInputSx}
            />
            {errors.confirmPassword && <FormHelperText sx={{ mt: 1 }} error>{errors.confirmPassword.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              sx={{ height: '2.8rem', borderRadius: 999, fontWeight: 800, bgcolor: '#c62828', '&:hover': { bgcolor: '#a3151b' } }}
              fullWidth
              loading={status === 'pending'}
              type="submit"
              variant="contained"
            >
              {'إعادة تعيين كلمة المرور'}
            </LoadingButton>
          </motion.div>
        </FormCard>

        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ color: '#756b6c' }}>
          <Typography variant="body2">{'هل تتذكر كلمة المرور؟'}</Typography>
          <Box component={Link} to="/login" sx={{ color: '#c62828', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            {'تسجيل الدخول'}
          </Box>
        </Stack>
        <AuthHomeLink />
      </Stack>
    </Stack>
  )
}
