import {axiosi} from '../../config/axios'
import {fetchCachedGet} from '../../config/apiQuery'
import {invalidateApiQueries} from '../../config/queryClient'


export const createOrder=async(order)=>{
    try {
        const res=await axiosi.post("/orders",order)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const getOrderByUserId=async(id)=>{
    try {
        return await fetchCachedGet(`/orders/user/${id}`)
    } catch (error) {
        throw error.response.data
    }
}

export const getAllOrders=async()=>{
    try {
        return await fetchCachedGet(`/orders`)
    } catch (error) {
        throw error.response.data
    }
}

export const getOrderStatistics=async()=>{
    return await fetchCachedGet("/orders/statistics")
}

export const updateOrderById=async(update)=>{
    try {
        const res=await axiosi.patch(`/orders/${update._id}`,update)
        await invalidateApiQueries('orders')
        return res.data
    } catch (error) {
        throw error.response.data
    }
}