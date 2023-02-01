import * as request from '~/utils/httpRequest'

export const login = async (payload) => {
    try {
        const res = await request.post('/auth/login', payload)
        return {
            success: true,
            data: res.data,
            token: res.meta?.token,
            message: 'Login successful'
        }
    } catch (err) {
        console.error('Login error:', err)
        return {
            success: false,
            message: err.response?.data?.message || 'Login failed. Please try again.',
            error: err.response?.data || err.message
        }
    }
}

export const logout = async () => {
    try {
        await request.post('/auth/logout')
        return { success: true }
    } catch (err) {
        console.error('Logout error:', err)
        // Even if the API call fails, we should still clear local data
        return { success: true }
    }
}

export const getCurrentUser = async () => {
    try {
        const res = await request.get('/auth/me')
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Get current user error:', err)
        return {
            success: false,
            message: 'Failed to fetch user data',
            error: err.response?.data || err.message
        }
    }
}

export const refreshToken = async () => {
    try {
        const res = await request.post('/auth/refresh')
        return {
            success: true,
            token: res.meta?.token
        }
    } catch (err) {
        console.error('Refresh token error:', err)
        return {
            success: false,
            error: err.response?.data || err.message
        }
    }
}
