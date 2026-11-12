import { fetchCachedGet } from "../../config/apiQuery"

export const fetchAllCategories=async()=>{
    try {
        return await fetchCachedGet("/categories")
    } catch (error) {
        throw error?.response?.data || error
    }
}