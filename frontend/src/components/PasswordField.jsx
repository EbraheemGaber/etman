import React, { forwardRef, useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export const PasswordField = forwardRef((props, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      inputRef={ref}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((show) => !show)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
})
