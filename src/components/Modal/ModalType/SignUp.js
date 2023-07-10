import classNames from 'classnames/bind'
import * as authService from '~/services/authService'
import Button from '~/components/Button'
import styles from './Login.module.scss' // Reuse the same styles
import { useState } from 'react'
import { setCookie, setLocalStorage } from '~/utils/storage'
import { useAppContext } from '~/store'

const cx = classNames.bind(styles)

function SignUp({ onSuccess, onClose }) {
    const { register: contextRegister } = useAppContext()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address'
            }
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
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
            const result = await authService.register({
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
                  // Use context register to update global state
                await contextRegister({
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
                setApiError(result.message || 'Registration failed. Please try again.')
            }
        } catch (error) {
            console.error('Register error:', error)
            setApiError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label className={cx('label')} htmlFor="email">
                Email
            </label>
            <input
                className={cx('input', { error: errors.email })}
                value={formData.email}
                type="email"
                name="email"
                id="email"
                placeholder="Email"
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
            
            <label className={cx('label')} htmlFor="confirmPassword">
                Confirm Password
            </label>
            <input
                className={cx('input', { error: errors.confirmPassword })}
                value={formData.confirmPassword}
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleInputChange('confirmPassword')}
                disabled={isLoading}
            />
            {errors.confirmPassword && (
                <span className={cx('error-message')}>{errors.confirmPassword}</span>
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
                {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
        </form>
    )
}

export default SignUp
