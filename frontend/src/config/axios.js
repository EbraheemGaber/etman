import axios from 'axios'
import { clearApiQueries, invalidateApiQueries } from './queryClient'

const baseURL='/api'

export const axiosi=axios.create({withCredentials:true,baseURL})

const isAuthSessionResetRequest=(url='')=>(/(^|\/)auth\/(logout|reset-password)(?:\/|$)/i).test(url)

axiosi.interceptors.response.use((response)=>{
    const method=response.config.method?.toLowerCase()
    const url=response.config.url || ''

    if(isAuthSessionResetRequest(url)){
        clearApiQueries()
    } else if(method!=='get'){
        const resource=url.split('?')[0].replace(/^\/+/, '').split('/')[0]
        invalidateApiQueries(resource)
    }
    return response
})