import * as request from '~/utils/httpRequest'

export const getSuggested = async ({ page = 1, perPage = 5 }) => {
    try {
        const res = await request.get('/users/suggested', {
            params: {
                page,
                per_page: perPage,
            },
        })
        return {
            success: true,
            data: res.data || [],
        }
    } catch (err) {
        console.error('Get suggested users error:', err)
        return {
            success: false,
            data: [],
            error: err.message,
        }
    }
}

export const getUserInfo = async () => {
    try {
        const res = await request.get('/auth/me')
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('Get user info error:', err)
        return {
            success: false,
            data: null,
            error: err.message,
        }
    }
}

export const searchUsers = async (q, type = 'less') => {
    try {
        const res = await request.get('/users/search', {
            params: {
                q,
                type,
            },
        })
        return {
            success: true,
            data: res.data || [],
        }
    } catch (err) {
        console.error('Search users error:', err)
        return {
            success: false,
            data: [],
            error: err.message,
        }
    }
}

export const getUser = async (nickname) => {
    try {
        console.log('🔍 Fetching user profile for:', nickname)
        const res = await request.get(`/users/@${nickname}`)

        console.log('👤 User profile response:', res.data)
        console.log('👤 User profile structure:', Object.keys(res.data || {}))

        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Get user error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: null,
            error: err.message,
        }
    }
}

export const followUser = async (userId) => {
    try {
        const res = await request.post(`/users/${userId}/follow`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('Follow user error:', err)
        return {
            success: false,
            error: err.message,
        }
    }
}

export const unfollowUser = async (userId) => {
    try {
        const res = await request.post(`/users/${userId}/unfollow`)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('Unfollow user error:', err)
        return {
            success: false,
            error: err.message,
        }
    }
}

export const getFollowings = async (page = 1) => {
    try {
        const res = await request.get('/me/followings', {
            params: {
                page,
            },
        })
        return {
            success: true,
            data: res.data || [],
        }
    } catch (err) {
        console.error('Get followings error:', err)
        return {
            success: false,
            data: [],
            error: err.message,
        }
    }
}

export const updateProfile = async (formData) => {
    try {
        // Check authentication first
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1]
        console.log('🔐 Auth token present:', !!token)
        if (token) {
            console.log('🔐 Token length:', token.length)
        }

        console.log('📤 Sending profile update request...')

        // Enhanced debugging for FormData
        console.log('📋 FormData entries:')
        for (let [key, value] of formData.entries()) {
            if (key === 'avatar') {
                console.log(
                    `  ${key}:`,
                    value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value,
                )
            } else {
                console.log(`  ${key}:`, value)
            }
        }

        const res = await request.post('/auth/me?_method=PATCH', formData)

        console.log('✅ Profile update successful:', res)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Update profile error:', err)
        console.error('❌ Full error object:', JSON.stringify(err, null, 2))
        console.error('❌ Error response:', err.response)
        console.error('❌ Error response data:', err.response?.data)
        console.error('❌ Error status:', err.response?.status)
        console.error('❌ Error headers:', err.response?.headers)
        console.error('❌ Error config:', err.config)

        // Try to get more error details
        let errorMessage = 'Failed to update profile'
        let errorDetails = null

        if (err.response) {
            console.error('❌ Response status:', err.response.status)
            console.error('❌ Response statusText:', err.response.statusText)

            if (err.response.data) {
                console.error('❌ Response data type:', typeof err.response.data)
                console.error('❌ Response data:', err.response.data)

                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error
                } else if (err.response.data.errors) {
                    errorMessage = 'Validation errors occurred'
                    errorDetails = err.response.data.errors
                }
            }
        } else if (err.request) {
            console.error('❌ Request made but no response:', err.request)
            errorMessage = 'No response from server'
        } else {
            console.error('❌ Error setting up request:', err.message)
            errorMessage = err.message
        }

        return {
            success: false,
            error: errorMessage,
            details: errorDetails || err.response?.data,
            status: err.response?.status,
        }
    }
}
