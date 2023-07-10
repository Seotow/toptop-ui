import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { getCookie, getLocalStorage, removeCookie, removeLocalStorage, setLocalStorage } from '~/utils/storage'
import * as authService from '~/services/authService'
import * as userService from '~/services/userService'

// Create the main app context
const AppContext = createContext()

// Action types
const actionTypes = {
    // Auth actions
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    
    // User actions
    UPDATE_USER: 'UPDATE_USER',
    SET_CURRENT_USER: 'SET_CURRENT_USER',
    
    // App state actions
    SET_THEME: 'SET_THEME',
    SET_LANGUAGE: 'SET_LANGUAGE',
    TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
    SET_MODAL_STATE: 'SET_MODAL_STATE'
}

// Reducer function
const appReducer = (state, action) => {
    switch (action.type) {
        // Auth cases
        case actionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload }
            
        case actionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                currentUser: action.payload,
                isLoading: false,
                error: null
            }
            
        case actionTypes.LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                currentUser: null,
                isLoading: false,
                error: null
            }
            
        case actionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            }
            
        case actionTypes.CLEAR_ERROR:
            return { ...state, error: null }
            
        // User cases
        case actionTypes.UPDATE_USER:
            return {
                ...state,
                currentUser: { ...state.currentUser, ...action.payload }
            }
            
        case actionTypes.SET_CURRENT_USER:
            return { ...state, currentUser: action.payload }
            
        // App state cases
        case actionTypes.SET_THEME:
            return { ...state, theme: action.payload }
            
        case actionTypes.SET_LANGUAGE:
            return { ...state, language: action.payload }
            
        case actionTypes.TOGGLE_SIDEBAR:
            return { ...state, sidebarOpen: !state.sidebarOpen }
            
        case actionTypes.SET_MODAL_STATE:
            return { ...state, modalState: action.payload }
            
        default:
            return state
    }
}

// Initial state
const initialState = {
    // Auth state
    isAuthenticated: false,
    currentUser: null,
    isLoading: true,
    error: null,
    
    // App state
    theme: 'light',
    language: 'en',
    sidebarOpen: true,
    modalState: {
        isOpen: false,
        type: null,
        data: null
    }
}

// Context Provider Component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState)

    // Check for existing authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getCookie('token')
            const user = getLocalStorage('user')

            if (token && user) {
                // Only verify token if we have both token and user data
                // Skip API call if user data exists in localStorage (assume valid session)
                try {
                    // Use the cached user data instead of making API call
                    dispatch({ 
                        type: actionTypes.LOGIN_SUCCESS, 
                        payload: user 
                    })
                } catch (error) {
                    console.error('Auth check error:', error)
                    // Silently clear invalid data without API call
                    removeCookie('token')
                    removeLocalStorage('user')
                    dispatch({ type: actionTypes.LOGOUT })
                }
            } else {
                // No token or user data, set as not authenticated
                dispatch({ type: actionTypes.SET_LOADING, payload: false })
            }
        }

        checkAuth()
    }, []) // Empty dependency array to run only once on mount

    // Listen for auth events from other components
    useEffect(() => {
        const handleLoginEvent = (event) => {
            dispatch({ 
                type: actionTypes.LOGIN_SUCCESS, 
                payload: event.detail 
            })
        }

        const handleLogoutEvent = () => {
            // Simple logout without API call to prevent infinite loops
            removeCookie('token')
            removeLocalStorage('user')
            dispatch({ type: actionTypes.LOGOUT })
        }

        window.addEventListener('auth:login', handleLoginEvent)
        window.addEventListener('auth:logout', handleLogoutEvent)

        return () => {
            window.removeEventListener('auth:login', handleLoginEvent)
            window.removeEventListener('auth:logout', handleLogoutEvent)
        }
    }, [])

    // Auth actions
    const handleLogout = async (silent = false) => {
        if (!silent) {
            dispatch({ type: actionTypes.SET_LOADING, payload: true })
        }
        
        try {
            // Only call logout API if user explicitly logs out
            if (!silent) {
                await authService.logout()
            }
        } catch (error) {
            console.error('Logout error:', error)
            // Don't throw error, just log it
        } finally {
            // Clear stored data regardless of API call result
            removeCookie('token')
            removeLocalStorage('user')
            dispatch({ type: actionTypes.LOGOUT })
        }
    }

    const login = async (credentials) => {
        dispatch({ type: actionTypes.SET_LOADING, payload: true })
        dispatch({ type: actionTypes.CLEAR_ERROR })

        try {
            const result = await authService.login(credentials)
            
            if (result.success) {
                dispatch({ 
                    type: actionTypes.LOGIN_SUCCESS, 
                    payload: result.data 
                })
                return { success: true }
            } else {
                dispatch({ 
                    type: actionTypes.SET_ERROR, 
                    payload: result.message 
                })
                return { success: false, message: result.message }
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: errorMessage 
            })
            return { success: false, message: errorMessage }
        }
    }

    const register = async (credentials) => {
        dispatch({ type: actionTypes.SET_LOADING, payload: true })
        dispatch({ type: actionTypes.CLEAR_ERROR })

        try {
            const result = await authService.register(credentials)
            
            if (result.success) {
                dispatch({ 
                    type: actionTypes.LOGIN_SUCCESS, 
                    payload: result.data 
                })
                return { success: true }
            } else {
                dispatch({ 
                    type: actionTypes.SET_ERROR, 
                    payload: result.message 
                })
                return { success: false, message: result.message }
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: errorMessage 
            })
            return { success: false, message: errorMessage }
        }
    }

    // User actions
    const updateUser = (userData) => {
        dispatch({ 
            type: actionTypes.UPDATE_USER, 
            payload: userData 
        })
        // Also update localStorage to keep data in sync
        if (userData) {
            setLocalStorage('user', { ...state.currentUser, ...userData })
        }
    }

    const updateProfile = async (formData) => {
        dispatch({ type: actionTypes.SET_LOADING, payload: true })
        dispatch({ type: actionTypes.CLEAR_ERROR })

        try {
            const result = await userService.updateProfile(formData)
            
            if (result.success) {
                // Update user in context and localStorage
                updateUser(result.data)
                return { success: true, data: result.data }
            } else {
                dispatch({ 
                    type: actionTypes.SET_ERROR, 
                    payload: result.error 
                })
                return { success: false, message: result.error }
            }
        } catch (error) {
            const errorMessage = 'Failed to update profile. Please try again.'
            dispatch({ 
                type: actionTypes.SET_ERROR, 
                payload: errorMessage 
            })
            return { success: false, message: errorMessage }
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false })
        }
    }

    // App state actions
    const setTheme = (theme) => {
        dispatch({ 
            type: actionTypes.SET_THEME, 
            payload: theme 
        })
        localStorage.setItem('theme', theme)
    }

    const setLanguage = (language) => {
        dispatch({ 
            type: actionTypes.SET_LANGUAGE, 
            payload: language 
        })
        localStorage.setItem('language', language)
    }

    const toggleSidebar = () => {
        dispatch({ type: actionTypes.TOGGLE_SIDEBAR })
    }

    const setModalState = (modalState) => {
        dispatch({ 
            type: actionTypes.SET_MODAL_STATE, 
            payload: modalState 
        })    }

    const clearError = () => {
        dispatch({ type: actionTypes.CLEAR_ERROR })
    }

    // Context value
    const contextValue = {
        // State
        ...state,
        
        // Auth actions
        login,
        register,
        logout: handleLogout,
        clearError,
        
        // User actions
        updateUser,
        updateProfile,
        
        // App actions
        setTheme,
        setLanguage,
        toggleSidebar,
        setModalState
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}

// Export action types for external use
export { actionTypes }

export default AppContext