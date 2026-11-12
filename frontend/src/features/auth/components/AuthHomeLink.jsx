import { Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export const AuthHomeLink = () => (
  <Typography
    component={Link}
    to="/"
    variant="body2"
    sx={{
      mt: 1,
      alignSelf: 'stretch',
      color: 'primary.main',
      fontWeight: 600,
      textAlign: 'left',
      textDecoration: 'none',
      direction: 'rtl',
      '&:hover': { textDecoration: 'underline' },
    }}
  >
    {'لتصفح المنتجات'}
  </Typography>
)
