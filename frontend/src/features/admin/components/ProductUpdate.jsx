import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync,resetProductUpdateStatus, selectProductUpdateStatus, selectSelectedProduct, updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme, Box } from '@mui/material'
import { uploadProductImage } from '../../products/ProductApi'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'
import { FormCard } from '../../../components/FormCard'

export const ProductUpdate = () => {

    const {register,handleSubmit,watch,setValue} = useForm()

    const {id}=useParams()
    const dispatch=useDispatch()
    const selectedProduct=useSelector(selectSelectedProduct)
    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const productUpdateStatus=useSelector(selectProductUpdateStatus)
    const navigate=useNavigate()
    const theme=useTheme()
    const is1100=useMediaQuery(theme.breakpoints.down(1100))
    const is480=useMediaQuery(theme.breakpoints.down(480))
    const [uploadingImages,setUploadingImages]=useState({})
    const imageCount=Math.max(selectedProduct?.images?.length || 0,4)


    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
        }
    },[id])

    useEffect(()=>{
        if(productUpdateStatus==='fullfilled'){
            toast.success("Product Updated")
            navigate("/admin/dashboard")
        }
        else if(productUpdateStatus==='rejected'){
            toast.error("Error updating product, please try again later")
        }
    },[productUpdateStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductUpdateStatus())
        }
    },[])

    const handleProductUpdate=(data)=>{
        const images=Array.from({length:imageCount},(_,index)=>data[`image${index}`]).filter(Boolean)
        const productUpdate={...data,_id:selectedProduct._id,images}
        for(let index=0;index<imageCount;index++){
            delete productUpdate[`image${index}`]
        }

        dispatch(updateProductByIdAsync(productUpdate))
    }

    const handleImageUpload=async(event,fieldName)=>{
        const file=event.target.files?.[0]
        event.target.value=''
        if(!file) return
        setUploadingImages((current)=>({...current,[fieldName]:true}))
        try{
            const uploaded=await uploadProductImage(file)
            setValue(fieldName,uploaded.url,{shouldDirty:true,shouldValidate:true})
        }catch(error){
            toast.error(typeof error==='string'?error:error?.message || 'Image upload failed. Please try again.')
        }finally{
            setUploadingImages((current)=>({...current,[fieldName]:false}))
        }
    }

    const renderImageField=(label,fieldName,validationRules)=>{
        const imageUrl=watch(fieldName)
        return (
            <Stack key={fieldName} spacing={1}>
                <Stack direction={{xs:'column',sm:'row'}} spacing={1} alignItems={{sm:'flex-start'}}>
                    <TextField fullWidth label={label} {...register(fieldName,validationRules)}/>
                    <Button component="label" type="button" variant="outlined" disabled={uploadingImages[fieldName]} sx={{minWidth:150}}>
                        {uploadingImages[fieldName]?'Uploading…':'Upload image'}
                        <input
                            hidden
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(event)=>handleImageUpload(event,fieldName)}
                        />
                    </Button>
                </Stack>
                {imageUrl && (
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={`${label} ${'preview'}`}
                        sx={{width:120,height:120,objectFit:'contain',border:1,borderColor:'divider',borderRadius:1}}
                    />
                )}
            </Stack>
        )
    }


  return (
    <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >
        
        {
            selectedProduct &&
        
        <FormCard width={is1100?"100%":"60rem"} rowGap={4} mt={is480?4:6} mb={6} noValidate onSubmit={handleSubmit(handleProductUpdate)}> 
            
            {/* feild area */}
            <Stack rowGap={3}>
                <Stack>
                    <Typography variant='h6' fontWeight={400} gutterBottom>{'Title'}</Typography>
                    <TextField {...register("title",{required:'Title is required',value:selectedProduct.title})}/>
                </Stack>

                <Stack flexDirection={'row'} >

                    <FormControl fullWidth>
                        <InputLabel id="brand-selection">{'Brand'}</InputLabel>
                        <Select defaultValue={selectedProduct.brand._id} {...register("brand",{required:"Brand is required"})} labelId="brand-selection" label={'Brand'}>
                            
                            {
                                brands.map((brand)=>(
                                    <MenuItem value={brand._id}>{brand.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>


                    <FormControl fullWidth>
                        <InputLabel id="category-selection">{'Category'}</InputLabel>
                        <Select defaultValue={selectedProduct.category._id} {...register("category",{required:"Category is required"})} labelId="category-selection" label={'Category'}>
                            
                            {
                                categories.map((category)=>(
                                    <MenuItem value={category._id}>{category.name}</MenuItem>
                                ))
                            }

                        </Select>
                    </FormControl>

                </Stack>


                <Stack>
                    <Typography variant='h6' fontWeight={400}  gutterBottom>{'Description'}</Typography>
                    <TextField multiline rows={4} {...register("description",{required:"Description is required",value:selectedProduct.description})}/>
                </Stack>

                <Stack flexDirection={'row'}>
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>{'Price'}</Typography>
                        <TextField type='number' {...register("price",{required:"Price is required",value:selectedProduct.price})}/>
                    </Stack>
                    <FormControlLabel
                        control={<Checkbox {...register("priceIsEstimate")} defaultChecked={Boolean(selectedProduct.priceIsEstimate)} />}
                        label={"This price is an estimate (uncheck after confirming it)"}
                    />
                    <Stack flex={1}>
                        <Typography variant='h6' fontWeight={400}  gutterBottom>{'Discount'} {is480?"%":"Percentage"}</Typography>
                        <TextField type='number' {...register("discountPercentage",{required:"Discount Percentage is required",value:selectedProduct.discountPercentage})}/>
                    </Stack>
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>{'Stock Quantity'}</Typography>
                    <TextField type='number' {...register("stockQuantity",{required:"Stock Quantity is required",value:selectedProduct.stockQuantity})}/>
                </Stack>
                <FormControlLabel
                    control={<Checkbox {...register("isUnlimitedStock")} defaultChecked={Boolean(selectedProduct.isUnlimitedStock)} />}
                    label={"Unlimited stock"}
                />
                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>{'Thumbnail'}</Typography>
                    {renderImageField('Thumbnail URL',"thumbnail",{required:"Thumbnail is required",value:selectedProduct.thumbnail})}
                </Stack>

                <Stack>
                    <Typography variant='h6'  fontWeight={400} gutterBottom>{'Product Images'}</Typography>

                    <Stack rowGap={2}>
                        {Array.from({length:imageCount},(_,index)=>renderImageField(
                            `${'Product image'} ${index+1}`,
                            `image${index}`,
                            {required:"Image is required",value:selectedProduct.images?.[index] || ''}
                        ))}
                    </Stack>

                </Stack>

            </Stack>


            {/* action area */}
            <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480?1:2}>
                <Button size={is480?'medium':'large'} variant='contained' type='submit' disabled={Object.values(uploadingImages).some(Boolean)}>{'Update'}</Button>
                <Button size={is480?'medium':'large'} variant='outlined' color='error' component={Link} to={'/admin/dashboard'}>{'Cancel'}</Button>
            </Stack>


        </FormCard>
        }

    </Stack>
  )
}
