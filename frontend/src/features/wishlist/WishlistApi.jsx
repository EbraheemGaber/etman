import {axiosi} from '../../config/axios'
import {fetchCachedGetResponse} from '../../config/apiQuery'

export const createWishlistItem=async(data)=>{
    try {
        const res=await axiosi.post("/wishlist",data)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}

export const fetchWishlistByUserId=async(id)=>{
    try {
        const response=await fetchCachedGetResponse(`/wishlist/user/${id}`)
        return {data:response.data,totalResults:response.totalResults}
    } catch (error) {
        throw error?.response?.data || error
    }
}

export const updateWishlistItemById=async(update)=>{
    try {
        const res=await axiosi.patch(`/wishlist/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}

export const deleteWishlistItemById=async(id)=>{
    try {
        const res=await axiosi.delete(`/wishlist/${id}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}