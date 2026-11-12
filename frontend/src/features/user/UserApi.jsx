import { axiosi } from "../../config/axios"
import { fetchCachedGet } from "../../config/apiQuery"

export const fetchLoggedInUserById=async(id)=>{
    try {
        return await fetchCachedGet(`/users/${id}`)
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const updateUserById=async(update)=>{
    try {
        const res=await axiosi.patch(`/users/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}