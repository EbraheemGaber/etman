import { axiosi } from "../../config/axios";
import { fetchCachedGet } from "../../config/apiQuery";
import { queryClient } from "../../config/queryClient";

const getReferenceId=(value)=>typeof value==='object'&&value!==null?value._id:value

export const addProduct=async(data)=>{
    try {
        const res=await axiosi.post('/products',data)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const uploadProductImage=async(file)=>{
    try {
        const res=await axiosi.post("/products/images/upload",file,{
            headers:{"Content-Type":file.type}
        })
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const fetchProducts=async(filters)=>{
    try {
        const catalog=await fetchCachedGet(`/products${filters?.user?'?user=true':''}`)
        let products=catalog

        if(filters?.brand?.length){
            products=products.filter((product)=>filters.brand.includes(getReferenceId(product.brand)))
        }
        if(filters?.category?.length){
            products=products.filter((product)=>filters.category.includes(getReferenceId(product.category)))
        }

        const totalResults=products.length
        if(filters?.sort?.sort){
            const direction=filters.sort.order==='desc'?-1:1
            products=[...products].sort((first,second)=>
                (Number(first[filters.sort.sort])-Number(second[filters.sort.sort]))*direction
            )
        }

        if(filters?.pagination){
            const page=Number(filters.pagination.page)||1
            const limit=Number(filters.pagination.limit)||products.length
            const start=(page-1)*limit
            products=products.slice(start,start+limit)
        }

        return {data:products,totalResults}
    } catch (error) {
        throw error.response?.data || error
    }
}
export const fetchProductById=async(id)=>{
    try {
        // 1. Check if the product is already available in the caching system (catalog cache)
        const queries = queryClient.getQueryCache().findAll({ queryKey: ['api', 'products'] })
        for (const query of queries) {
            const data = query.state.data?.data || query.state.data
            if (Array.isArray(data)) {
                const found = data.find((product) => product && (product._id === id || product.id === id))
                if (found) {
                    return found
                }
            }
        }

        // 2. Fetch directly from product endpoint
        try {
            const result = await fetchCachedGet(`/products/${id}`)
            if (result && (result._id || result.title)) {
                return result
            }
        } catch (directError) {
            console.warn(`Direct fetch for product ${id} failed, falling back to catalog query:`, directError)
        }

        // 3. Fallback: retrieve products through catalog cache and find matching item
        const catalog = await fetchCachedGet('/products?user=true')
        if (Array.isArray(catalog)) {
            const found = catalog.find((product) => product && (product._id === id || product.id === id))
            if (found) {
                return found
            }
        }

        throw new Error('Product not found')
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const updateProductById=async(update)=>{
    try {
        const res=await axiosi.patch(`/products/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const undeleteProductById=async(id)=>{
    try {
        const res=await axiosi.patch(`/products/undelete/${id}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
export const deleteProductById=async(id)=>{
    try {
        const res=await axiosi.delete(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error?.response?.data || error
    }
}
