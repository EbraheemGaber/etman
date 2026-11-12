import axios from 'axios'
import { clearApiQueries, invalidateApiQueries } from './queryClient'

const configuredBaseURL=process.env.REACT_APP_BASE_URL
const configuredApiIsLoopback=/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBaseURL || '')
const currentHostIsLoopback=['localhost','127.0.0.1'].includes(window.location.hostname)
const baseURL=configuredApiIsLoopback && !currentHostIsLoopback
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : configuredBaseURL

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