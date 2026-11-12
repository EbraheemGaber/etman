import {axiosi} from '../../config/axios'
import {fetchCachedGet} from '../../config/apiQuery'

export const addToCart=async(item)=>{
    try {
        const res=await axiosi.post('/cart',item)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const fetchCartByUserId=async(id)=>{
    try {
        return await fetchCachedGet(`/cart/user/${id}`)
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const updateCartItemById=async(update)=>{
    try {
        const res=await axiosi.patch(`/cart/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const deleteCartItemById=async(id)=>{
    try {
        const res=await axiosi.delete(`/cart/${id}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}

export const resetCartByUserId=async(userId)=>{
    try {
        const res=await axiosi.delete(`/cart/user/${userId}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
