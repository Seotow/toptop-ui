import axios from 'axios'
import { getCookie, removeCookie } from './storage'

const httpRequest = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL || 'https://tiktok.fullstack.edu.vn/api',
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

// Add a request interceptor to include the latest token
httpRequest.interceptors.request.use(
    (config) => {
        const accessToken = getCookie('token')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add a response interceptor to handle token expiration and errors
httpRequest.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        
        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message)
            return Promise.reject(new Error('Network error. Please check your connection.'))
        }
        
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            // Clear invalid token without making logout API call
            removeCookie('token')
            
            // Trigger silent logout event to update UI state
            window.dispatchEvent(new CustomEvent('auth:logout'))
            
            return Promise.reject(new Error('Session expired. Please log in again.'))
        }
        
        // Handle CORS errors
        if (error.message.includes('CORS')) {
            console.error('CORS error:', error.message)
            return Promise.reject(new Error('API access denied. Please check server configuration.'))
        }
        
        // Handle other HTTP errors
        const message = error.response?.data?.message || error.message || 'An error occurred'
        return Promise.reject(new Error(message))
    }
)

export const get = async (path, options = {}) => {
    try {
        const response = await httpRequest.get(path, options)
        return response.data
    } catch (error) {
        throw error
    }
}

export const post = async (path, payload, options = {}) => {
    try {
        const response = await httpRequest.post(path, payload, options)
        return response.data
    } catch (error) {
        throw error
    }
}

export const put = async (path, payload, options = {}) => {
    try {
        const response = await httpRequest.put(path, payload, options)
        return response.data
    } catch (error) {
        throw error
    }
}

export const patch = async (path, payload, options = {}) => {
    try {
        const response = await httpRequest.patch(path, payload, options)
        return response.data
    } catch (error) {
        throw error
    }
}

export const del = async (path, options = {}) => {
    try {
        const response = await httpRequest.delete(path, options)
        return response.data
    } catch (error) {
        throw error
    }
}

export default httpRequest
