import { axiosi } from '../../config/axios'
import { fetchCachedGet } from '../../config/apiQuery'

export const createSalesRequest=async(data)=>{
  try{
    const response=await axiosi.post('/sales-requests',data)
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}

export const getMySalesRequests=async()=>{
  try{
    return await fetchCachedGet('/sales-requests/mine')
  }catch(error){
    throw error.response?.data || error
  }
}

export const getSalesStatistics=async()=>{
  try{
    return await fetchCachedGet('/sales-requests/statistics')
  }catch(error){
    throw error.response?.data || error
  }
}

export const updateMonthlySalesTarget=async(monthlySalesTarget)=>{
  try{
    const response=await axiosi.patch('/sales-requests/target',{monthlySalesTarget})
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}

export const logCustomerVisit=async(customer)=>{
  try{
    const response=await axiosi.post('/sales-requests/visits',customer)
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}

export const getCustomers=async()=>{
  try{
    return await fetchCachedGet('/users/customers')
  }catch(error){
    throw error.response?.data || error
  }
}

export const createCustomer=async(customer)=>{
  try{
    const response=await axiosi.post('/users/customers',customer)
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}

export const getAllSalesRequests=async()=>{
  try{
    return await fetchCachedGet('/sales-requests')
  }catch(error){
    throw error.response?.data || error
  }
}

export const updateSalesRequestStatus=async(id,status)=>{
  try{
    const response=await axiosi.patch(`/sales-requests/${id}/status`,{status})
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}

export const getSalespeople=async()=>{
  try{
    return await fetchCachedGet('/users/admin/salespeople')
  }catch(error){
    throw error.response?.data || error
  }
}

export const setSalespersonAccess=async(id,isSalesperson)=>{
  try{
    const response=await axiosi.patch(`/users/admin/salespeople/${id}`,{isSalesperson})
    return response.data
  }catch(error){
    throw error.response?.data || error
  }
}
