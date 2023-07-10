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
    const { nickname } = useParams();    const { currentUser, updateUser } = useAppContext();
    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);    const [userVideos, setUserVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [videosError, setVideosError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    // Form state for editing
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        bio: '',
        avatar: null
    })
    const [formErrors, setFormErrors] = useState({})
    const [avatarPreview, setAvatarPreview] = useState(null)

    // Check if this is the current user's profile
    const isOwnProfile = currentUser && currentUser.nickname === nickname

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true)
            setError(null)

            try {                if (isOwnProfile) {
                    // If it's the current user's profile, use current user data
                    setProfileUser(currentUser);
                    setFormData({
                        first_name: currentUser.first_name || '',
                        last_name: currentUser.last_name || '',
                        bio: currentUser.bio || '',
                        avatar: null
                    });
                    
                    // Extract videos from current user data if available
                    if (currentUser.videos && Array.isArray(currentUser.videos)) {
                        console.log('📹 Found videos in current user data:', currentUser.videos.length);
                        setUserVideos(currentUser.videos);
                        setVideosLoading(false);
                    } else {
                        console.log('📹 No videos in current user data, will fetch separately');
                        setVideosLoading(true);
                    }
                }else {
                    // Fetch other user's profile
                    const result = await userService.getUser(nickname);
                    if (result.success) {
                        setProfileUser(result.data);
                        
                        // Extract videos from user data if available
                        if (result.data.videos && Array.isArray(result.data.videos)) {
                            console.log('📹 Found videos in user data:', result.data.videos.length);
                            setUserVideos(result.data.videos);
                            setVideosLoading(false);
                        } else {
                            console.log('📹 No videos found in user data, will fetch separately');
                            // Set loading state for separate video fetch
                            setVideosLoading(true);
                        }
                    } else {
                        setError(result.error || 'Failed to load profile');
                    }
                }} catch (err) {
                setError('An unexpected error occurred')
                console.error('Profile fetch error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (nickname) {
            fetchProfile()
        }
    }, [nickname, currentUser, isOwnProfile])    // Fetch user videos (only if not already loaded from user data)
    useEffect(() => {
        const fetchUserVideos = async () => {
            if (!profileUser?.id) return;
            
            // Skip if videos are already loaded from user data
            if (userVideos.length > 0 && !videosLoading) {
                console.log('📹 Videos already loaded from user data, skipping separate fetch');
                return;
            }
            
            // Only fetch if we're in loading state (videos weren't in user data)
            if (!videosLoading) {
                console.log('📹 Videos already available, skipping fetch');
                return;
            }

            console.log('📹 Fetching videos separately for user:', profileUser.id);
            setVideosError(null);

            try {
                const result = await videoService.getUserVideos(profileUser.id);
                if (result.success) {
                    setUserVideos(result.data?.data || []);
                } else {
                    setVideosError(result.error || 'Failed to load videos');
                }
            } catch (err) {
                setVideosError('An unexpected error occurred while loading videos');
                console.error('Videos fetch error:', err);
            } finally {
                setVideosLoading(false);
            }
        };

        fetchUserVideos();
    }, [profileUser?.id, videosLoading, userVideos.length]);

    const handleEditClick = () => {
        setIsEditing(true)
        setFormErrors({})
        // Reset form data
        setFormData({
            first_name: profileUser.first_name || '',
            last_name: profileUser.last_name || '',
            bio: profileUser.bio || '',
            avatar: null
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
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setFormErrors(prev => ({
                    ...prev,
                    avatar: 'Avatar file size must be less than 5MB'
                }))
                return
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setFormErrors(prev => ({
                    ...prev,
                    avatar: 'Please select a valid image file'
                }))
                return
            }

            setFormData(prev => ({
                ...prev,
                avatar: file
            }))

            // Create preview URL
            const previewUrl = URL.createObjectURL(file)
            setAvatarPreview(previewUrl)

            // Clear any previous error
            setFormErrors(prev => ({
                ...prev,
                avatar: ''
            }))
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
            updateData.append('first_name', formData.first_name.trim())
            updateData.append('last_name', formData.last_name.trim())
            updateData.append('bio', formData.bio.trim())
            
            if (formData.avatar) {
                updateData.append('avatar', formData.avatar)
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
            } else {
                setFormErrors({ submit: result.error || 'Failed to update profile' })
            }
        } catch (err) {
            setFormErrors({ submit: 'An unexpected error occurred' })
            console.error('Profile update error:', err)        } finally {
            setIsUpdating(false)
        }
    };    const triggerFileInput = () => {
        fileInputRef.current?.click()
    };    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsVideoModalOpen(true);
    };

    const handleCloseVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
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
                <div className={cx('error')}>
                    {error}
                </div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('error')}>
                    Profile not found
                </div>
            </div>
        )
    }

    return (
        <div className={cx('wrapper')}>
            {/* Profile Header */}
            <div className={cx('header')}>
                <div className={cx('avatarSection')}>
                    <Image
                        src={avatarPreview || profileUser.avatar}
                        alt={`${profileUser.first_name} ${profileUser.last_name}`}
                        className={cx('avatar')}
                        fallback="https://via.placeholder.com/116x116/f0f0f0/cccccc?text=User"
                    />
                    {isEditing && (
                        <>
                            <div className={cx('avatarOverlay')} onClick={triggerFileInput}>
                                Change Avatar
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
                        <button
                            className={cx('editButton')}
                            onClick={isEditing ? handleCancelEdit : handleEditClick}
                        >
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

                    {profileUser.bio && (
                        <p className={cx('bio')}>{profileUser.bio}</p>
                    )}
                </div>
            </div>            {/* Edit Form */}
            {isEditing && (
                <div 
                    className={cx('editForm')}
                    onWheel={(e) => e.stopPropagation()} // Prevent wheel events from bubbling up
                >
                    <h3 className={cx('editTitle')}>Edit Profile</h3>

                    {formErrors.submit && (
                        <div className={cx('errorMessage')} style={{ marginBottom: '16px' }}>
                            {formErrors.submit}
                        </div>
                    )}

                    <div className={cx('formGroup')}>
                        <label className={cx('label')}>First Name *</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={handleInputChange('first_name')}
                            className={cx('input', { error: formErrors.first_name })}
                            placeholder="Enter your first name"
                        />
                        {formErrors.first_name && (
                            <div className={cx('errorMessage')}>{formErrors.first_name}</div>
                        )}
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
                        {formErrors.last_name && (
                            <div className={cx('errorMessage')}>{formErrors.last_name}</div>
                        )}
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
                        {formErrors.bio && (
                            <div className={cx('errorMessage')}>{formErrors.bio}</div>
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
            )}            {/* Videos Section */}
            <div className={cx('videosSection')}>
                <h3 className={cx('sectionTitle')}>Videos</h3>
                {videosLoading ? (
                    <div className={cx('videosLoading')}>Loading videos...</div>
                ) : videosError ? (
                    <div className={cx('videosError')}>
                        <p>Error loading videos: {videosError}</p>
                    </div>                ) : userVideos.length > 0 ? (
                    <div className={cx('videosGrid')}>
                        {userVideos.map((video, index) => (
                            <div 
                                key={video.id || video.uuid || index} 
                                className={cx('videoItem')}
                            >
                                <Video 
                                    data={video} 
                                    onVideoClick={handleVideoClick}
                                />
                            </div>
                        ))}
                    </div>) : (
                    <div className={cx('noVideos')}>
                        No videos uploaded yet
                    </div>
                )}
            </div>            {/* Video Modal */}
            <VideoModal
                video={selectedVideo}
                isOpen={isVideoModalOpen}
                onClose={handleCloseVideoModal}
            />
        </div>
    )
}

export default Profile