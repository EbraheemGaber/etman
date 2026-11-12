import {axiosi} from '../../config/axios'
import {fetchCachedGet} from '../../config/apiQuery'

export const createReview=async(review)=>{
    try {
        const res=await axiosi.post('/reviews',review)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const fetchReviewsByProductId=async(id)=>{
    try {
        const result = await fetchCachedGet(`/reviews/product/${id}`)
        return Array.isArray(result) ? result : []
    } catch (error) {
        console.warn(`Failed to fetch reviews for product ${id}:`, error)
        return []
    }
}

export const updateReviewById=async(update)=>{
    try {
        const res=await axiosi.patch(`/reviews/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const deleteReviewById=async(id)=>{
    try {
        const res=await axiosi.delete(`/reviews/${id}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}