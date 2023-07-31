import * as request from '~/utils/httpRequest'

export const getVideos = async ({ type = 'for-you', page = 1, except = null }) => {
    try {
        const params = {
            type,
            page,
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
                meta: res.data?.meta || {},
            },
        }
    } catch (err) {
        console.error('❌ Get videos error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: [],
            error: err.message,
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
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Get video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: null,
            error: err.message,
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
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Like video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message,
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
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Unlike video error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message,
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
            data: res.data || [],
        }
    } catch (err) {
        console.error('❌ Get comments error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: [],
            error: err.message,
        }
    }
}

export const createComment = async (videoId, comment) => {
    try {
        console.log('💬 Creating comment for video ID:', videoId, 'Comment:', comment)
        const res = await request.post(`/videos/${videoId}/comments`, {
            comment,
        })
        console.log('💬 Create comment response:', res.data)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Create comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message,
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
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Like comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message,
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
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Unlike comment error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            error: err.message,
        }
    }
}

export const getUserVideos = async (nickname) => {
    try {
        console.log('🔍 Fetching videos for user nickname:', nickname)
        const res = await request.get(`/users/@${nickname}`)

        console.log('📦 User videos response:', res.data)

        // Extract videos from user response
        let videoData = []
        if (res.data?.videos && Array.isArray(res.data.videos)) {
            videoData = res.data.videos
        } else if (res.data?.data?.videos && Array.isArray(res.data.data.videos)) {
            videoData = res.data.data.videos
        } else if (res.data?.data) {
            videoData = res.data.data
        } else if (Array.isArray(res.data)) {
            videoData = res.data
        }

        return {
            success: true,
            data: {
                data: videoData,
                meta: res.data?.meta || {},
            },
        }
    } catch (err) {
        console.error('❌ Get user videos error:', err)
        console.error('❌ Error response:', err.response?.data)
        return {
            success: false,
            data: [],
            error: err.message,
        }
    }
}

export const uploadVideo = async (formData) => {
    try {
        console.log('📤 Uploading video...')
        
        // Enhanced debugging for FormData
        console.log('📋 FormData entries:')
        for (let [key, value] of formData.entries()) {
            if (key === 'upload_file') {
                console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value)
            } else {
                console.log(`  ${key}:`, value)
            }
        }
        
        const res = await request.post('/videos', formData)
        console.log('✅ Video upload successful:', res)
        return {
            success: true,
            data: res.data,
        }
    } catch (err) {
        console.error('❌ Upload video error:', err)
        console.error('❌ Full error object:', JSON.stringify(err, null, 2))
        console.error('❌ Error response:', err.response)
        console.error('❌ Error response data:', err.response?.data)
        console.error('❌ Error status:', err.response?.status)
        
        // Try to get more error details
        let errorMessage = 'Failed to upload video'
        let errorDetails = null
        
        if (err.response) {
            console.error('❌ Response status:', err.response.status)
            console.error('❌ Response statusText:', err.response.statusText)
            
            if (err.response.data) {
                console.error('❌ Response data type:', typeof err.response.data)
                console.error('❌ Response data:', err.response.data)
                
                // Handle different error response formats
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message
                    errorDetails = err.response.data
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error
                } else if (err.response.data.errors) {
                    // Handle validation errors
                    const validationErrors = err.response.data.errors
                    if (typeof validationErrors === 'object') {
                        const errorArray = Object.entries(validationErrors)
                            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        errorMessage = errorArray.join('\n')
                    }
                    errorDetails = { errors: validationErrors }
                }
            }
        }
        
        return {
            success: false,
            error: errorMessage,
            details: errorDetails
        }
    }
}
