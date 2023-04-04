import * as request from '~/utils/httpRequest'

export const getVideos = async ({ type = 'for-you', page = 1, except = null }) => {
    try {
        const params = {
            type,
            page
        }
        
        if (except) {
            params.except = except
        }

        console.log('🔍 Fetching videos with params:', params)
        const res = await request.get('/videos', { params })
        
        // Log the actual response structure
        console.log('📦 API Response:', res)
        console.log('📦 Response data:', res.data)
        
        // Handle different response structures
        let videoData = []
        if (res.data?.data) {
            videoData = res.data.data
        } else if (Array.isArray(res.data)) {
            videoData = res.data
        } else if (res.data) {
            videoData = [res.data]
        }
        
        console.log('🎬 Processed video data:', videoData)
        
        return {
            success: true,
            data: {
                data: videoData,
                meta: res.data?.meta || {}
            }
        }
    } catch (err) {
        console.error('❌ Get videos error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: [],
            error: err.message
        }
    }
}

export const getVideo = async (videoId) => {
    try {
        const res = await request.get(`/posts/${videoId}`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Get video error:', err)
        return {
            success: false,
            data: null,
            error: err.message
        }
    }
}

export const likeVideo = async (videoId) => {
    try {
        const res = await request.post(`/posts/${videoId}/like`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Like video error:', err)
        return {
            success: false,
            error: err.message
        }
    }
}

export const unlikeVideo = async (videoId) => {
    try {
        const res = await request.post(`/posts/${videoId}/unlike`)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Unlike video error:', err)
        return {
            success: false,
            error: err.message
        }
    }
}

export const getComments = async (videoId) => {
    try {
        const res = await request.get(`/posts/${videoId}/comments`)
        return {
            success: true,
            data: res.data || []
        }
    } catch (err) {
        console.error('Get comments error:', err)
        return {
            success: false,
            data: [],
            error: err.message
        }
    }
}

export const createComment = async (videoId, comment) => {
    try {
        const res = await request.post(`/posts/${videoId}/comments`, {
            comment
        })
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('Create comment error:', err)
        return {
            success: false,
            error: err.message
        }
    }
}