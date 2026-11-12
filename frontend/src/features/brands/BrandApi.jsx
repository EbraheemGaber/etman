import { fetchCachedGet } from "../../config/apiQuery";

export const fetchAllBrands=async()=>{
    try {
        return await fetchCachedGet("/brands")
    } catch (error) {
        throw error?.response?.data || error
    }
}