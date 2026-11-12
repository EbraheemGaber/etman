import { Avatar, Button, Paper, Stack, Typography, useTheme ,TextField, useMediaQuery} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUserInfo } from '../UserSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { addAddressAsync, resetAddressAddStatus, resetAddressDeleteStatus, resetAddressUpdateStatus, selectAddressAddStatus, selectAddressDeleteStatus, selectAddressErrors, selectAddressStatus, selectAddressUpdateStatus, selectAddresses } from '../../address/AddressSlice'
import { Address } from '../../address/components/Address'
import { useForm } from 'react-hook-form'
import { LoadingButton } from '@mui/lab'
import {toast} from 'react-toastify'
import { FormCard } from '../../../components/FormCard'

export const UserProfile = () => {

    const dispatch=useDispatch()
    const {register,handleSubmit,watch,reset,formState: { errors }} = useForm()
    const status=useSelector(selectAddressStatus)
    const userInfo=useSelector(selectUserInfo)
    const isSalesperson=Boolean(useSelector(selectLoggedInUser)?.isSalesperson)
    const addresses=useSelector(selectAddresses)
    const theme=useTheme()
    const [addAddress,setAddAddress]=useState(false)

    
    const addressAddStatus=useSelector(selectAddressAddStatus)
    const addressUpdateStatus=useSelector(selectAddressUpdateStatus)
    const addressDeleteStatus=useSelector(selectAddressDeleteStatus)

    const is900=useMediaQuery(theme.breakpoints.down(900))
    const is480=useMediaQuery(theme.breakpoints.down(480))

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])


    useEffect(()=>{
        if(addressAddStatus==='fulfilled'){
            toast.success(isSalesperson?"تمت إضافة العنوان":"Address added")
        }
        else if(addressAddStatus==='rejected'){
            toast.error(isSalesperson?"تعذرت إضافة العنوان. يرجى المحاولة لاحقًا.":"Error adding address, please try again later")
        }
    },[addressAddStatus,isSalesperson])

    useEffect(()=>{

        if(addressUpdateStatus==='fulfilled'){
            toast.success(isSalesperson?"تم تحديث العنوان":"Address updated")
        }
        else if(addressUpdateStatus==='rejected'){
            toast.error(isSalesperson?"تعذر تحديث العنوان. يرجى المحاولة لاحقًا.":"Error updating address, please try again later")
        }
    },[addressUpdateStatus,isSalesperson])

    useEffect(()=>{

        if(addressDeleteStatus==='fulfilled'){
            toast.success(isSalesperson?"تم حذف العنوان":"Address deleted")
        }
        else if(addressDeleteStatus==='rejected'){
            toast.error(isSalesperson?"تعذر حذف العنوان. يرجى المحاولة لاحقًا.":"Error deleting address, please try again later")
        }
    },[addressDeleteStatus,isSalesperson])

    useEffect(()=>{
        return ()=>{
            dispatch(resetAddressAddStatus())
            dispatch(resetAddressUpdateStatus())
            dispatch(resetAddressDeleteStatus())
        }
    },[])

    const handleAddAddress=(data)=>{
        const address={...data,user:userInfo._id}
        dispatch(addAddressAsync(address))
        setAddAddress(false)
        reset()
    }

  return (
    <Stack
      dir={isSalesperson?'rtl':'ltr'}
      lang={isSalesperson?'ar':undefined}
      height={'calc(100vh - 4rem)'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      sx={isSalesperson?{fontFamily:'Cairo, Tahoma, sans-serif','& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}}:{}}
    >

            <Stack component={is480?'':Paper} elevation={1} width={is900?'100%':"50rem"} p={2} mt={is480?0:5} rowGap={2}>

                    {/* user details - [name ,email ] */}
                    <Stack bgcolor={theme.palette.primary.light} color={theme.palette.primary.main} p={2} rowGap={1} borderRadius={'.6rem'} justifyContent={'center'} alignItems={'center'}>
                        <Avatar src='none' alt={userInfo?.name} sx={{width:70,height:70}}></Avatar>
                        <Typography>{userInfo?.name}</Typography>
                        <Typography>{userInfo?.email}</Typography>
                    </Stack>


                    {/* address section */}
                    <Stack justifyContent={'center'} alignItems={'center'} rowGap={3}>


                        {/* heading and add button */}
                        <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={1}>
                            <Typography variant='h6' fontWeight={400}>{isSalesperson?'إدارة العناوين':'Manage addresses'}</Typography>
                            <Button onClick={()=>setAddAddress(true)} size={is480?'small':""} variant='contained'>{isSalesperson?'إضافة':'Add'}</Button>
                        </Stack>
                        
                        {/* add address form - state dependent*/}
                        {
                            addAddress?(
                                <FormCard width={'100%'} noValidate onSubmit={handleSubmit(handleAddAddress)} rowGap={2}>
                    
                                        <Stack>
                                            <Typography  gutterBottom>{isSalesperson?'النوع':'Type'}</Typography>
                                            <TextField placeholder={isSalesperson?'مثال: المنزل، العمل':'Eg. Home, Buisness'} {...register("type",{required:true})}/>
                                        </Stack>
                    
                    
                                        <Stack>
                                            <Typography gutterBottom>{isSalesperson?'الشارع':'Street'}</Typography>
                                            <TextField {...register("street",{required:true})}/>
                                        </Stack>
                    
                                        <Stack>
                                            <Typography gutterBottom>{isSalesperson?'الرمز البريدي':'Postal Code'}</Typography>
                                            <TextField type='number' {...register("postalCode",{required:true})}/>
                                        </Stack>
                    
                                        <Stack>
                                            <Typography gutterBottom>{isSalesperson?'الدولة':'Country'}</Typography>
                                            <TextField {...register("country",{required:true})}/>
                                        </Stack>
                    
                                        <Stack>
                                            <Typography  gutterBottom>{isSalesperson?'رقم الهاتف':'Phone Number'}</Typography>
                                            <TextField type='number' {...register("phoneNumber",{required:true})}/>
                                        </Stack>
                    
                                        <Stack>
                                            <Typography gutterBottom>{isSalesperson?'المنطقة':'State'}</Typography>
                                            <TextField {...register("state",{required:true})}/>
                                        </Stack>
                    
                                        <Stack>
                                            <Typography gutterBottom>{isSalesperson?'المدينة':'City'}</Typography>
                                            <TextField {...register("city",{required:true})}/>
                                        </Stack>

                                        <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480?1:2}>
                                            <LoadingButton loading={status==='pending'} type='submit' size={is480?"small":""} variant='contained'>{isSalesperson?'إضافة':'add'}</LoadingButton>
                                            <Button color='error' onClick={()=>setAddAddress(false)} variant={is480?"outlined":"text"} size={is480?"small":""} >{isSalesperson?'إلغاء':'cancel'}</Button>
                                        </Stack>
                                </FormCard>
                            ):('')
                        }

                        {/* mapping on addresses here  */}
                        <Stack width={'100%'} rowGap={2}>
                            {
                                addresses.length>0?(
                                    addresses.map((address)=>(
                                        <Address key={address._id} id={address._id} city={address.city} country={address.country} phoneNumber={address.phoneNumber} postalCode={address.postalCode} state={address.state} street={address.street} type={address.type} isArabic={isSalesperson}/>
                                    ))
                                ):(
                                    <Typography textAlign={'center'} mt={2} variant='body2'>{isSalesperson?'لم تقم بإضافة عناوين بعد':'You have no added addresses'}</Typography>
                                )
                            }      
                        </Stack>

                    </Stack>


            </Stack>



    </Stack>
  )
}
