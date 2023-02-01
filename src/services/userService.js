import * as request from '~/utils/httpRequest'

export const getSuggested = async ({page = 1, perPage = 5}) => {
    try {
        const res = await request.get('/users/suggested', {
            params: {
                page,
                per_page: perPage
            },
        })
        return {
            success: true,
            data: res.data || []
        }
    } catch (err) {
        console.error('Get suggested users error:', err)
        return {
            success: false,
            data: [],
            error: err.message
        }
    }
}

export const getUserInfo = async () => {
    try {
        const res = await request.get('/auth/me')
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Get user info error:', err)
        return {
            success: false,
            data: null,
            error: err.message
        }
    }
}

export const searchUsers = async (q, type = 'less') => {
    try {
        const res = await request.get('/users/search', {
            params: {
                q,
                type
            },
        })
        return {
            success: true,
            data: res.data || []
        }
    } catch (err) {
        console.error('Search users error:', err)
        return {
            success: false,
            data: [],
            error: err.message
        }
    }
}

export const getUser = async (nickname) => {
    try {
        const res = await request.get(`/users/@${nickname}`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Get user error:', err)
        return {
            success: false,
            data: null,
            error: err.message
        }
    }
}

export const followUser = async (userId) => {
    try {
        const res = await request.post(`/users/${userId}/follow`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Follow user error:', err)
        return {
            success: false,
            error: err.message
        }
    }
}

export const unfollowUser = async (userId) => {
    try {
        const res = await request.post(`/users/${userId}/unfollow`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Unfollow user error:', err)
        return {
            success: false,
            error: err.message
        }
    }
}
