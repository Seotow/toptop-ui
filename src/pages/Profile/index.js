import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import classNames from 'classnames/bind'
import { useAppContext } from '~/store'
import * as userService from '~/services/userService'
import * as videoService from '~/services/videoService'
import { setLocalStorage } from '~/utils/storage'
import Image from '~/components/Image'
import Video from '~/components/Video'
import VideoModal from '~/components/VideoModal'
import styles from './Profile.module.scss'

const cx = classNames.bind(styles)

function Profile() {
    const { nickname } = useParams()
    const { currentUser, updateUser } = useAppContext()
    const [profileUser, setProfileUser] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [userVideos, setUserVideos] = useState([])
    const [videosLoading, setVideosLoading] = useState(false)
    const [videosError, setVideosError] = useState(null)
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const fileInputRef = useRef(null) // Form state for editing
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        avatar: null,
        gender: '',
        date_of_birth: '',
        website_url: '',
        facebook_url: '',
        youtube_url: '',
        twitter_url: '',
        instagram_url: '',
    })
    const [formErrors, setFormErrors] = useState({})
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false) // Check if this is the current user's profile
    const isOwnProfile = currentUser && currentUser.nickname === nickname    // Reset edit mode when user logs out or navigates to different user
    useEffect(() => {
        if (isEditing && (!currentUser || (currentUser && currentUser.nickname !== nickname))) {
            setIsEditing(false)
            setFormErrors({})
            setAvatarPreview(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [currentUser, nickname]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)
            setError(null)

            try {
                if (isOwnProfile) {
                    // If it's the current user's profile, use current user data
                    setProfileUser(currentUser)
                    setFormData({
                        first_name: currentUser.first_name || '',
                        last_name: currentUser.last_name || '',
                        bio: currentUser.bio || '',
                        avatar: null,
                        gender: currentUser.gender || '',
                        date_of_birth: currentUser.date_of_birth || '',
                        website_url: currentUser.website_url || '',
                        facebook_url: currentUser.facebook_url || '',
                        youtube_url: currentUser.youtube_url || '',
                        twitter_url: currentUser.twitter_url || '',
                        instagram_url: currentUser.instagram_url || '',
                    }) // Extract videos from current user data if available
                    if (currentUser.videos && Array.isArray(currentUser.videos) && currentUser.videos.length > 0) {
                        console.log('📹 Found videos in current user data:', currentUser.videos.length)
                        setUserVideos(currentUser.videos)
                        setVideosLoading(false)
                        setVideosError(null)
                    } else {
                        console.log('📹 No videos in current user data, will fetch separately')
                        setUserVideos([])
                        setVideosLoading(true)
                        setVideosError(null)
                    }
                } else {
                    // Fetch other user's profile
                    const result = await userService.getUser(nickname)
                    if (result.success) {
                        setProfileUser(result.data) // Extract videos from user data if available
                        if (result.data.videos && Array.isArray(result.data.videos) && result.data.videos.length > 0) {
                            console.log('📹 Found videos in user data:', result.data.videos.length)
                            setUserVideos(result.data.videos)
                            setVideosLoading(false)
                            setVideosError(null)
                        } else {
                            console.log('📹 No videos found in user data, will fetch separately')
                            setUserVideos([])
                            setVideosLoading(true)
                            setVideosError(null)
                        }
                    } else {
                        setError(result.error || 'Failed to load profile')
                    }
                }
            } catch (err) {
                setError('An unexpected error occurred')
                console.error('Profile fetch error:', err)
            } finally {
                setIsLoading(false)
            }        }

        if (nickname) {
            fetchProfile()
        }
    }, [nickname, currentUser, isOwnProfile]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchUserVideos = async () => {
            if (!profileUser?.nickname) return

            // Skip if videos are already loaded from user data
            if (userVideos.length > 0 && !videosLoading) {
                console.log('📹 Videos already loaded from user data, skipping separate fetch')
                return
            }

            if (!videosLoading) {
                console.log('📹 Videos already available, skipping fetch')
                return
            }
            console.log('📹 Fetching videos separately for user:', profileUser.nickname)
            setVideosError(null)

            try {
                const result = await videoService.getUserVideos(profileUser.nickname)
                if (result.success) {
                    const videos = result.data?.data || []
                    console.log('📹 Fetched videos for user:', profileUser.nickname, 'count:', videos.length)
                    setUserVideos(videos)
                    setVideosError(null) // Clear any previous errors
                } else {
                    console.error('❌ Failed to fetch user videos:', result.error)
                    setVideosError(result.error || 'Failed to load videos')
                    setUserVideos([]) // Set empty array on error
                }
            } catch (err) {
                console.error('❌ Videos fetch error:', err)
                setVideosError('An unexpected error occurred while loading videos')
                setUserVideos([]) // Set empty array on error
            } finally {
                setVideosLoading(false)
            }
        }

        fetchUserVideos()
    }, [profileUser?.nickname, videosLoading, userVideos.length])

    const handleEditClick = () => {
        setIsEditing(true)
        setFormErrors({}) // Reset form data
        setFormData({
            first_name: profileUser.first_name || '',
            last_name: profileUser.last_name || '',
            bio: profileUser.bio || '',
            avatar: null,
            gender: profileUser.gender || '',
            date_of_birth: profileUser.date_of_birth || '',
            website_url: profileUser.website_url || '',
            facebook_url: profileUser.facebook_url || '',
            youtube_url: profileUser.youtube_url || '',
            twitter_url: profileUser.twitter_url || '',
            instagram_url: profileUser.instagram_url || '',
        })
        setAvatarPreview(null)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setFormErrors({})
        setAvatarPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleInputChange = (field) => (e) => {
        const value = e.target.value
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        })) // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors((prev) => ({
                ...prev,
                [field]: '',
            }))
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        console.log('📸 Avatar file selected:', file)

        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                console.warn('❌ File too large:', file.size, 'bytes')
                setFormErrors((prev) => ({
                    ...prev,
                    avatar: 'Avatar file size must be less than 5MB',
                }))
                return
            }

            // Validate file type with better checking
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            console.log('📸 File type:', file.type)
            if (!allowedTypes.includes(file.type.toLowerCase())) {
                console.warn('❌ Invalid file type:', file.type)
                setFormErrors((prev) => ({
                    ...prev,
                    avatar: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
                }))
                return
            }

            // Validate image dimensions (optional - prevent very large images)
            const imgElement = document.createElement('img')
            imgElement.onload = function () {
                console.log('📸 Image dimensions:', this.width, 'x', this.height)

                if (this.width > 4000 || this.height > 4000) {
                    console.warn('❌ Image too large:', this.width, 'x', this.height)
                    setFormErrors((prev) => ({
                        ...prev,
                        avatar: 'Image dimensions should not exceed 4000x4000 pixels',
                    }))
                    URL.revokeObjectURL(imgElement.src)
                    return
                }

                console.log('✅ Avatar validation passed, setting file')

                // If all validations pass, set the file
                setFormData((prev) => ({
                    ...prev,
                    avatar: file,
                }))

                // Create preview URL
                const previewUrl = URL.createObjectURL(file)
                setAvatarPreview(previewUrl)

                // Clear any previous error
                setFormErrors((prev) => ({
                    ...prev,
                    avatar: '',
                }))

                // Clean up the image element source
                URL.revokeObjectURL(imgElement.src)
            }

            imgElement.onerror = function () {
                console.error('❌ Failed to load image for validation')
                setFormErrors((prev) => ({
                    ...prev,
                    avatar: 'Invalid image file',
                }))
                URL.revokeObjectURL(imgElement.src)
            }
            imgElement.src = URL.createObjectURL(file)
        } else {
            console.log('📸 No file selected')
        }
    }

    // Drag and drop handlers for avatar upload
    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            const file = files[0]
            // Simulate file input change event
            const fakeEvent = {
                target: {
                    files: [file],
                },
            }
            handleAvatarChange(fakeEvent)
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.first_name.trim()) {
            errors.first_name = 'First name is required'
        } else if (formData.first_name.trim().length < 2) {
            errors.first_name = 'First name must be at least 2 characters'
        }

        if (!formData.last_name.trim()) {
            errors.last_name = 'Last name is required'
        } else if (formData.last_name.trim().length < 2) {
            errors.last_name = 'Last name must be at least 2 characters'
        }

        if (formData.bio && formData.bio.length > 200) {
            errors.bio = 'Bio must be less than 200 characters'
        }

        // Validate date of birth
        if (formData.date_of_birth) {
            const birthDate = new Date(formData.date_of_birth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            if (birthDate > today) {
                errors.date_of_birth = 'Date of birth cannot be in the future'
            } else if (age > 120) {
                errors.date_of_birth = 'Please enter a valid date of birth'
            }
        }

        // Validate URLs
        if (formData.website_url && formData.website_url.trim()) {
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(formData.website_url.trim())) {
                errors.website_url = 'Please enter a valid URL (starting with http:// or https://)'
            }
        }
        if (formData.facebook_url && formData.facebook_url.trim()) {
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(formData.facebook_url.trim())) {
                errors.facebook_url = 'Please enter a valid URL (starting with http:// or https://)'
            }
        }

        if (formData.youtube_url && formData.youtube_url.trim()) {
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(formData.youtube_url.trim())) {
                errors.youtube_url = 'Please enter a valid URL (starting with http:// or https://)'
            }
        }

        if (formData.twitter_url && formData.twitter_url.trim()) {
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(formData.twitter_url.trim())) {
                errors.twitter_url = 'Please enter a valid URL (starting with http:// or https://)'
            }
        }

        if (formData.instagram_url && formData.instagram_url.trim()) {
            const urlPattern = /^https?:\/\/.+/
            if (!urlPattern.test(formData.instagram_url.trim())) {
                errors.instagram_url = 'Please enter a valid URL (starting with http:// or https://)'
            }
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveProfile = async () => {
        if (!validateForm()) {
            return
        }

        setIsUpdating(true)

        try {
            // Create FormData for file upload
            const updateData = new FormData()

            // Required fields
            updateData.append('first_name', formData.first_name.trim())
            updateData.append('last_name', formData.last_name.trim())

            // Bio field - preserve newlines but trim whitespace
            updateData.append('bio', formData.bio.trim())

            // Optional fields - only include if they have values
            if (formData.gender && formData.gender.trim()) {
                updateData.append('gender', formData.gender.trim())
            }
            if (formData.date_of_birth && formData.date_of_birth.trim()) {
                updateData.append('date_of_birth', formData.date_of_birth.trim())
            }
            if (formData.website_url && formData.website_url.trim()) {
                updateData.append('website_url', formData.website_url.trim())
            }
            if (formData.facebook_url && formData.facebook_url.trim()) {
                updateData.append('facebook_url', formData.facebook_url.trim())
            }
            if (formData.youtube_url && formData.youtube_url.trim()) {
                updateData.append('youtube_url', formData.youtube_url.trim())
            }
            if (formData.twitter_url && formData.twitter_url.trim()) {
                updateData.append('twitter_url', formData.twitter_url.trim())
            }
            if (formData.instagram_url && formData.instagram_url.trim()) {
                updateData.append('instagram_url', formData.instagram_url.trim())
            }

            // Avatar file - only include if a new file is selected
            if (formData.avatar && formData.avatar instanceof File) {
                console.log(
                    '📸 Adding avatar to FormData:',
                    formData.avatar.name,
                    formData.avatar.type,
                    formData.avatar.size,
                )
                updateData.append('avatar', formData.avatar)
            }

            // Debug: Log FormData contents
            console.log('📝 FormData being sent to API:')
            for (let [key, value] of updateData.entries()) {
                if (key === 'avatar') {
                    console.log(
                        `  ${key}:`,
                        value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value,
                    )
                } else {
                    console.log(`  ${key}:`, value)
                }
            }

            const result = await userService.updateProfile(updateData)

            if (result.success) {
                // Update local state
                setProfileUser(result.data)

                // Update global user context
                updateUser(result.data)

                // Update localStorage
                setLocalStorage('user', result.data)

                // Exit edit mode
                setIsEditing(false)
                setAvatarPreview(null)

                // Clear file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }

                console.log('✅ Profile updated successfully!')
            } else {
                console.error('❌ Profile update failed:', result.error)
                console.error('❌ Error details:', result.details)

                // Show detailed error if available
                let errorMessage = result.error || 'Failed to update profile'
                if (result.details?.errors) {
                    const fieldErrors = Object.entries(result.details.errors)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('\n')
                    errorMessage += '\n\nField errors:\n' + fieldErrors
                }

                setFormErrors({ submit: errorMessage })
            }
        } catch (err) {
            console.error('❌ Profile update exception:', err)
            setFormErrors({ submit: 'An unexpected error occurred' })
        } finally {
            setIsUpdating(false)
        }
    }
    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }
    const handleVideoClick = (video) => {
        setSelectedVideo(video)
        setIsVideoModalOpen(true)
    }

    const handleCloseVideoModal = () => {
        setIsVideoModalOpen(false)
        setSelectedVideo(null)
    }

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Loading profile...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('error')}>{error}</div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('error')}>Profile not found</div>
            </div>
        )
    }

    return (
        <div className={cx('wrapper')}>
            {/* Profile Header */}{' '}
            <div className={cx('header')}>
                <div
                    className={cx('avatarSection', { dragOver: isDragOver })}
                    onDragOver={isEditing ? handleDragOver : undefined}
                    onDragLeave={isEditing ? handleDragLeave : undefined}
                    onDrop={isEditing ? handleDrop : undefined}
                >
                    <Image
                        src={avatarPreview || profileUser.avatar}
                        alt={`${profileUser.first_name} ${profileUser.last_name}`}
                        className={cx('avatar')}
                        fallback="https://via.placeholder.com/116x116/f0f0f0/cccccc?text=User"
                    />
                    {isEditing && (
                        <>
                            <div className={cx('avatarOverlay')} onClick={triggerFileInput}>
                                {isDragOver ? 'Drop image here' : 'Change Avatar'}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className={cx('avatarInput')}
                            />
                        </>
                    )}
                </div>

                <div className={cx('userInfo')}>
                    <h1 className={cx('username')}>
                        {profileUser.first_name} {profileUser.last_name}
                    </h1>
                    <h2 className={cx('nickname')}>@{profileUser.nickname}</h2>

                    {isOwnProfile && (
                        <button className={cx('editButton')} onClick={isEditing ? handleCancelEdit : handleEditClick}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    )}

                    <div className={cx('stats')}>
                        <div className={cx('statItem')}>
                            <span className={cx('statNumber')}>{profileUser.followings_count || 0}</span>
                            <span className={cx('statLabel')}>Following</span>
                        </div>
                        <div className={cx('statItem')}>
                            <span className={cx('statNumber')}>{profileUser.followers_count || 0}</span>
                            <span className={cx('statLabel')}>Followers</span>
                        </div>
                        <div className={cx('statItem')}>
                            <span className={cx('statNumber')}>{profileUser.likes_count || 0}</span>
                            <span className={cx('statLabel')}>Likes</span>
                        </div>
                    </div>

                    {profileUser.bio && <p className={cx('bio')}>{profileUser.bio}</p>}
                </div>
            </div>{' '}
            {/* Edit Form */}
            {isEditing && (
                <div
                    className={cx('editForm')}
                    onWheel={(e) => e.stopPropagation()} // Prevent wheel events from bubbling up
                >
                    {' '}
                    <h3 className={cx('editTitle')}>Edit Profile</h3>
                    {formErrors.submit && (
                        <div className={cx('errorMessage')} style={{ marginBottom: '16px' }}>
                            {formErrors.submit}
                        </div>
                    )}
                    {/* Avatar Upload Section */}
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Profile Picture</label>
                        <div
                            className={cx('avatarUploadArea', { dragOver: isDragOver })}
                            onClick={triggerFileInput}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className={cx('avatarPreviewContainer')}>
                                <Image
                                    src={avatarPreview || profileUser.avatar}
                                    alt="Avatar preview"
                                    className={cx('avatarPreview')}
                                    fallback="https://via.placeholder.com/80x80/f0f0f0/cccccc?text=User"
                                />
                                <div className={cx('avatarUploadOverlay')}>
                                    {isDragOver ? 'Drop image here' : 'Click or drag to upload'}
                                </div>
                            </div>
                            <div className={cx('avatarUploadText')}>
                                <p>Recommended: Square image, at least 98x98 pixels</p>
                                <p>Max file size: 5MB (JPEG, PNG, GIF, WebP)</p>
                            </div>
                        </div>
                        {formErrors.avatar && <div className={cx('errorMessage')}>{formErrors.avatar}</div>}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className={cx('avatarInput')}
                        />
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>First Name *</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={handleInputChange('first_name')}
                            className={cx('input', { error: formErrors.first_name })}
                            placeholder="Enter your first name"
                        />
                        {formErrors.first_name && <div className={cx('errorMessage')}>{formErrors.first_name}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Last Name *</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={handleInputChange('last_name')}
                            className={cx('input', { error: formErrors.last_name })}
                            placeholder="Enter your last name"
                        />
                        {formErrors.last_name && <div className={cx('errorMessage')}>{formErrors.last_name}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={handleInputChange('bio')}
                            className={cx('input', 'textarea', { error: formErrors.bio })}
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                        />
                        <div style={{ fontSize: '12px', color: 'rgba(22, 24, 35, 0.5)', marginTop: '4px' }}>
                            {formData.bio.length}/200 characters
                        </div>
                        {formErrors.bio && <div className={cx('errorMessage')}>{formErrors.bio}</div>}{' '}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Gender</label>
                        <select
                            value={formData.gender}
                            onChange={handleInputChange('gender')}
                            className={cx('input', { error: formErrors.gender })}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {formErrors.gender && <div className={cx('errorMessage')}>{formErrors.gender}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Date of Birth</label>
                        <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={handleInputChange('date_of_birth')}
                            className={cx('input', { error: formErrors.date_of_birth })}
                        />
                        {formErrors.date_of_birth && (
                            <div className={cx('errorMessage')}>{formErrors.date_of_birth}</div>
                        )}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Website URL</label>
                        <input
                            type="url"
                            value={formData.website_url}
                            onChange={handleInputChange('website_url')}
                            className={cx('input', { error: formErrors.website_url })}
                            placeholder="https://your-website.com"
                        />
                        {formErrors.website_url && <div className={cx('errorMessage')}>{formErrors.website_url}</div>}
                    </div>{' '}
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Facebook URL</label>
                        <input
                            type="url"
                            value={formData.facebook_url}
                            onChange={handleInputChange('facebook_url')}
                            className={cx('input', { error: formErrors.facebook_url })}
                            placeholder="https://facebook.com/your-profile"
                        />
                        {formErrors.facebook_url && <div className={cx('errorMessage')}>{formErrors.facebook_url}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>YouTube URL</label>
                        <input
                            type="url"
                            value={formData.youtube_url}
                            onChange={handleInputChange('youtube_url')}
                            className={cx('input', { error: formErrors.youtube_url })}
                            placeholder="https://youtube.com/channel/your-channel"
                        />
                        {formErrors.youtube_url && <div className={cx('errorMessage')}>{formErrors.youtube_url}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Twitter URL</label>
                        <input
                            type="url"
                            value={formData.twitter_url}
                            onChange={handleInputChange('twitter_url')}
                            className={cx('input', { error: formErrors.twitter_url })}
                            placeholder="https://twitter.com/your-username"
                        />
                        {formErrors.twitter_url && <div className={cx('errorMessage')}>{formErrors.twitter_url}</div>}
                    </div>
                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>Instagram URL</label>
                        <input
                            type="url"
                            value={formData.instagram_url}
                            onChange={handleInputChange('instagram_url')}
                            className={cx('input', { error: formErrors.instagram_url })}
                            placeholder="https://instagram.com/your-username"
                        />
                        {formErrors.instagram_url && (
                            <div className={cx('errorMessage')}>{formErrors.instagram_url}</div>
                        )}
                    </div>
                    {formErrors.avatar && (
                        <div className={cx('errorMessage')} style={{ marginBottom: '16px' }}>
                            {formErrors.avatar}
                        </div>
                    )}
                    <div className={cx('formActions')}>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className={cx('cancelButton')}
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveProfile}
                            className={cx('saveButton')}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}{' '}
            {/* Videos Section */}
            <div className={cx('videosSection')}>
                <h3 className={cx('sectionTitle')}>Videos</h3>
                {videosLoading ? (
                    <div className={cx('videosLoading')}>Loading videos...</div>
                ) : videosError ? (
                    <div className={cx('videosError')}>
                        <p>Error loading videos: {videosError}</p>
                        <button
                            onClick={() => {
                                setVideosLoading(true)
                                setVideosError(null)
                            }}
                            className={cx('retryButton')}
                        >
                            Try Again
                        </button>
                    </div>
                ) : userVideos && userVideos.length > 0 ? (
                    <div className={cx('videosGrid')}>
                        {userVideos.map((video, index) => (
                            <div key={video.id || video.uuid || index} className={cx('videoItem')}>
                                <Video data={video} onVideoClick={handleVideoClick} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cx('noVideos')}>
                        <p>
                            {isOwnProfile
                                ? "You haven't uploaded any videos yet"
                                : `@${profileUser?.nickname || 'This user'} hasn't uploaded any videos yet`}
                        </p>
                        {isOwnProfile && <p>Start creating and sharing your content!</p>}
                    </div>
                )}
            </div>{' '}
            {/* Video Modal */}
            <VideoModal video={selectedVideo} isOpen={isVideoModalOpen} onClose={handleCloseVideoModal} />
        </div>
    )
}

export default Profile
