import axios from 'axios'
import { getCookie, removeCookie } from './storage'

const getBaseURL = () => {
    if (process.env.NODE_ENV === 'development') {
        return '/api'
    }
    
    const isHostedPlatform = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1' &&
                            !window.location.hostname.includes('localhost');
    
    if (isHostedPlatform) {
        return '/api'
    }
    
    return process.env.REACT_APP_BASE_URL || 'https://tiktok.fullstack.edu.vn/api'
}

const httpRequest = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: false,
})

if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
    console.log('HTTP Request Base URL:', getBaseURL())
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Window location:', window.location.href)
}

// Add a request interceptor to include the latest token
httpRequest.interceptors.request.use(
    (config) => {
        const accessToken = getCookie('token')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        // For FormData, let the browser set the Content-Type header with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Add a response interceptor to handle token expiration and errors
httpRequest.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config        // Handle network errors and CORS
        if (!error.response) {
            if (error.message.includes('CORS') || 
                error.message.includes('Network Error') ||
                error.code === 'ERR_NETWORK') {
                console.error('CORS/Network error:', error.message)
                
                if (process.env.NODE_ENV === 'development') {
                    return Promise.reject(new Error('Network error. Make sure the development server is running with proxy configuration.'))
                }
                
                return Promise.reject(new Error('API access denied. Please check your internet connection or contact support.'))
            }
            
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
        const message = error.response?.data?.message || error.message || 'An error occurred'
        return Promise.reject(new Error(message))
    },
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
