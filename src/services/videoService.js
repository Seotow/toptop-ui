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
        console.log('🎬 Fetching video with ID:', videoId)
        const res = await request.get(`/videos/${videoId}`)
        console.log('🎬 Get video response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Get video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: null,
            error: err.message
        }
    }
}

export const likeVideo = async (videoId) => {
    try {
        console.log('👍 Liking video with ID:', videoId)
        const res = await request.post(`/videos/${videoId}/like`)
        console.log('👍 Like video response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Like video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message
        }
    }
}

export const unlikeVideo = async (videoId) => {
    try {
        console.log('👎 Unliking video with ID:', videoId)
        const res = await request.post(`/videos/${videoId}/unlike`)
        console.log('👎 Unlike video response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Unlike video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message
        }
    }
}

export const getComments = async (videoId) => {
    try {
        console.log('💬 Fetching comments for video ID:', videoId)
        const res = await request.get(`/videos/${videoId}/comments`)
        console.log('💬 Get comments response:', res.data)
        return {
            success: true,
            data: res.data || []
        }
    } catch (err) {
        console.error('❌ Get comments error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: [],
            error: err.message
        }
    }
}

export const createComment = async (videoId, comment) => {
    try {
        console.log('💬 Creating comment for video ID:', videoId, 'Comment:', comment)
        const res = await request.post(`/videos/${videoId}/comments`, {
            comment
        })
        console.log('💬 Create comment response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Create comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message
        }
    }
}

// Comment like/unlike functions
export const likeComment = async (videoId, commentId) => {
    try {
        console.log('👍 Liking comment with ID:', commentId, 'for video:', videoId)
        const res = await request.post(`/comments/${commentId}/like`)
        console.log('👍 Like comment response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Like comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message
        }
    }
}

export const unlikeComment = async (videoId, commentId) => {
    try {
        console.log('👎 Unliking comment with ID:', commentId, 'for video:', videoId)
        const res = await request.post(`/comments/${commentId}/unlike`)
        console.log('👎 Unlike comment response:', res.data)
        return {
            success: true,
            data: res.data
        }
    } catch (err) {
        console.error('❌ Unlike comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message
        }
    }
}