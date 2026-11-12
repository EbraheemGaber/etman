import { Stack } from '@mui/material'

export const FormCard=({children,sx,...props})=>(
  <Stack
    component="form"
    spacing={0}
    {...props}
    sx={[
      {
        boxSizing:'border-box',
        minWidth:0,
        p:{xs:2,sm:2.5},
        gap:2,
        borderRadius:2.5,
        backgroundColor:'#fff',
        boxShadow:'0 0 0 10px #fff4ef, 0 8px 24px rgba(41,35,43,.08)',
        '& .MuiOutlinedInput-root':{
          borderRadius:999
        },
        '& .MuiOutlinedInput-root.MuiInputBase-multiline':{
          borderRadius:2
        },
        '& button[type="submit"].MuiButton-contained':{
          borderRadius:999
        }
      },
      ...(Array.isArray(sx)?sx:sx?[sx]:[])
    ]}
  >
    {children}
  </Stack>
)
