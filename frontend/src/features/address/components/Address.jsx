import { LoadingButton } from '@mui/lab'
import { Button, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { deleteAddressByIdAsync, selectAddressErrors, selectAddressStatus, updateAddressByIdAsync } from '../AddressSlice'
import { FormCard } from '../../../components/FormCard'

export const Address = ({id,type,street,postalCode,country,phoneNumber,state,city,isArabic=false}) => {

    const theme=useTheme()
    const dispatch=useDispatch()
    const {register,handleSubmit,watch,reset,formState: { errors }} = useForm()
    const [edit,setEdit]=useState(false)
    const [open, setOpen] = useState(false);
    const status=useSelector(selectAddressStatus)
    const error=useSelector(selectAddressErrors)
    
    const is480=useMediaQuery(theme.breakpoints.down(480))

    const handleRemoveAddress=()=>{
        dispatch(deleteAddressByIdAsync(id))
    }

    const handleUpdateAddress=(data)=>{
        const update={...data,_id:id}
        setEdit(false)
        dispatch(updateAddressByIdAsync(update))
    }


  return (
    <Stack dir={isArabic?'rtl':'ltr'} lang={isArabic?'ar':undefined} width={'100%'} p={is480?0:1}>
                                        
        {/* address type */}
        <Stack color={'whitesmoke'} p={'.5rem'} borderRadius={'.2rem'} bgcolor={theme.palette.primary.main}>
            <Typography>{type?.toUpperCase()}</Typography>
        </Stack>

        {/* address details */}
        <FormCard p={2} position={'relative'} rowGap={1} noValidate onSubmit={handleSubmit(handleUpdateAddress)}>

            {/* if the edit is true then this update from shows*/}
            {
                edit?
                (   
                    // update address form
                    <Stack rowGap={2}>
                        
                        <Stack>
                            <Typography gutterBottom>{isArabic?'النوع':'Type'}</Typography>
                            <TextField {...register("type",{required:true,value:type})}/>
                        </Stack>


                        <Stack>
                            <Typography gutterBottom>{isArabic?'الشارع':'Street'}</Typography>
                            <TextField {...register("street",{required:true,value:street})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>{isArabic?'الرمز البريدي':'Postal Code'}</Typography>
                            <TextField type='number' {...register("postalCode",{required:true,value:postalCode})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>{isArabic?'الدولة':'Country'}</Typography>
                            <TextField {...register("country",{required:true,value:country})}/>
                        </Stack>

                        <Stack>
                            <Typography  gutterBottom>{isArabic?'رقم الهاتف':'Phone Number'}</Typography>
                            <TextField type='number' {...register("phoneNumber",{required:true,value:phoneNumber})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>{isArabic?'المنطقة':'State'}</Typography>
                            <TextField {...register("state",{required:true,value:state})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>{isArabic?'المدينة':'City'}</Typography>
                            <TextField {...register("city",{required:true,value:city})}/>
                        </Stack>
                    </Stack>
                ):(
                <>
                <Typography>{isArabic?'الشارع':'Street'}: {street}</Typography>
                <Typography>{isArabic?'الرمز البريدي':'Postal Code'}: {postalCode}</Typography>
                <Typography>{isArabic?'الدولة':'Country'}: {country}</Typography>
                <Typography>{isArabic?'رقم الهاتف':'Phone Number'}: {phoneNumber}</Typography>
                <Typography>{isArabic?'المنطقة':'State'}: {state}</Typography>
                <Typography>{isArabic?'المدينة':'City'}: {city}</Typography>
                </>
                )
            }

            {/* action buttons */}
            <Stack position={is480?"static":edit?"static":'absolute'} bottom={4} right={4} mt={is480?2:4} flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>

                {/* if edit is true, then save changes button is shown instead of edit*/}
                {
                    edit?(                    <LoadingButton loading={status==='pending'} size='small' type='submit' variant='contained'>{isArabic?'حفظ التغييرات':'Save Changes'}</LoadingButton>
                    ):(<Button size='small' onClick={()=>setEdit(true)} variant='contained'>{isArabic?'تعديل':'Edit'}</Button>)
                }

                {/* if edit is true then cancel button is shown instead of remove */}
                {
                    edit?(
                        <Button size='small' onClick={()=>{setEdit(false);reset()}} variant='outlined' color='error'>{isArabic?'إلغاء':'Cancel'}</Button>
                    ):(
                        <LoadingButton loading={status==='pending'} size='small' onClick={handleRemoveAddress} variant='outlined' color='error' >{isArabic?'حذف':'Remove'}</LoadingButton>
                    )
                }
            </Stack>
        </FormCard>

    </Stack>
  )
}
