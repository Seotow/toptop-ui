import classNames from 'classnames/bind'
import * as authService from '~/services/authService'
import Button from '~/components/Button'
import styles from './Login.module.scss'
import { useState } from 'react'
import { setCookie, setLocalStorage } from '~/utils/storage'
import { useAppContext } from '~/store'

const cx = classNames.bind(styles)

function Login({ onSuccess, onClose }) {
    const { login: contextLogin } = useAppContext()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email or username is required'
        } else if (formData.email.includes('@')) {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address'
            }
        } else if (formData.email.length < 3) {
            // Username validation
            newErrors.email = 'Username must be at least 3 characters'
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field) => (e) => {
        const value = e.target.value
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
        
        // Clear API error when user makes changes
        if (apiError) {
            setApiError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        setApiError('')
        
        try {
            const result = await authService.login({
                email: formData.email,
                password: formData.password
            })
            
            if (result.success) {
                // Store token with 7 days expiration
                setCookie('token', result.token, { expires: 7 })
                
                // Store user data in localStorage
                if (result.data) {
                    setLocalStorage('user', result.data)
                }
                
                // Use context login to update global state
                await contextLogin({
                    email: formData.email,
                    password: formData.password
                })
                
                // Trigger success callback
                if (onSuccess) {
                    onSuccess(result.data)
                }
                
                // Close modal
                if (onClose) {
                    onClose()
                }
                
                // Dispatch login event for other components
                window.dispatchEvent(new CustomEvent('auth:login', { 
                    detail: result.data 
                }))
                
            } else {
                setApiError(result.message || 'Login failed. Please try again.')
            }
        } catch (error) {
            console.error('Login error:', error)
            setApiError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label className={cx('label')} htmlFor="email-username">
                Email or username
            </label>
            <input
                className={cx('input', { error: errors.email })}
                value={formData.email}
                type="text"
                name="email-username"
                id="email-username"
                placeholder="Email or username"
                onChange={handleInputChange('email')}
                disabled={isLoading}
            />
            {errors.email && (
                <span className={cx('error-message')}>{errors.email}</span>
            )}
            
            <label className={cx('label')} htmlFor="password">
                Password
            </label>
            <input
                className={cx('input', { error: errors.password })}
                value={formData.password}
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                onChange={handleInputChange('password')}
                disabled={isLoading}
            />
            {errors.password && (
                <span className={cx('error-message')}>{errors.password}</span>
            )}
            
            {apiError && (
                <div className={cx('api-error')}>{apiError}</div>
            )}
            
            <div className={cx('description')}></div>
            <Button 
                className={cx('submit-btn')} 
                primary 
                large
                disabled={isLoading}
                type="submit"
            >
                {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
        </form>
    )
}

export default Login
