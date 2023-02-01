import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getCookie, getLocalStorage, removeCookie, removeLocalStorage } from '~/utils/storage'
import * as authService from '~/services/authService'

const AuthContext = createContext()

const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
                isLoading: false,
                error: null
            }
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null
            }
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false
            }
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

const initialState = {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Check for existing authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getCookie('token')
            const user = getLocalStorage('user')

            if (token && user) {
                // Verify token is still valid
                try {
                    const result = await authService.getCurrentUser()
                    if (result.success) {
                        dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
                    } else {
                        // Token is invalid, clear stored data
                        handleLogout()
                    }
                } catch (error) {
                    // Token is invalid, clear stored data
                    handleLogout()
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        }

        checkAuth()
    }, [])

    // Listen for auth events from other components
    useEffect(() => {
        const handleLoginEvent = (event) => {
            dispatch({ type: 'LOGIN_SUCCESS', payload: event.detail })
        }

        const handleLogoutEvent = () => {
            handleLogout()
        }

        window.addEventListener('auth:login', handleLoginEvent)
        window.addEventListener('auth:logout', handleLogoutEvent)

        return () => {
            window.removeEventListener('auth:login', handleLoginEvent)
            window.removeEventListener('auth:logout', handleLogoutEvent)
        }
    }, [])

    const handleLogout = async () => {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        try {
            await authService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear stored data regardless of API call result
            removeCookie('token')
            removeLocalStorage('user')
            dispatch({ type: 'LOGOUT' })
        }
    }

    const login = async (credentials) => {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'CLEAR_ERROR' })

        try {
            const result = await authService.login(credentials)
            
            if (result.success) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: result.data })
                return { success: true }
            } else {
                dispatch({ type: 'SET_ERROR', payload: result.message })
                return { success: false, message: result.message }
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            return { success: false, message: errorMessage }
        }
    }

    const value = {
        ...state,
        login,
        logout: handleLogout,
        clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext