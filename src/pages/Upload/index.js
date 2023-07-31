
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUpload, faTimes } from '@fortawesome/free-solid-svg-icons'

import styles from './Upload.module.scss'
import { useAppContext } from '~/store'
import * as videoService from '~/services/videoService'

const cx = classNames.bind(styles)

function Upload() {
    const navigate = useNavigate()
    const { currentUser } = useAppContext()
    const videoInputRef = useRef(null)
    
    // State management
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    
    // Form data
    const [formData, setFormData] = useState({
        description: '',
        music: '',
        thumbnail_time: 5,
        viewable: 'public',
        allows: ['comment']
    })
    
    // Form errors
    const [formErrors, setFormErrors] = useState({})
    
    // Redirect if not authenticated
    if (!currentUser) {
        navigate('/')
        return null
    }

    // Helper functions
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Video handling
    const handleVideoSelect = (file) => {
        if (!file) return

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm']
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            setFormErrors({ video: 'Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)' })
            return
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            setFormErrors({ video: 'Video file size must be less than 100MB' })
            return
        }

        setSelectedVideo(file)
        setFormErrors({ ...formErrors, video: '' })

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        setVideoPreview(previewUrl)
    }

    const handleVideoChange = (e) => {
        const file = e.target.files[0]
        handleVideoSelect(file)
    }

    const handleRemoveVideo = () => {
        setSelectedVideo(null)
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview)
            setVideoPreview(null)
        }
        if (videoInputRef.current) {
            videoInputRef.current.value = ''
        }
    }

    // Drag and drop handlers
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
            handleVideoSelect(files[0])
        }
    }

    // Form handling
    const handleInputChange = (field) => (e) => {
        const value = e.target.value
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleCheckboxChange = (value) => {
        setFormData(prev => ({
            ...prev,
            allows: prev.allows.includes(value)
                ? prev.allows.filter(item => item !== value)
                : [...prev.allows, value]
        }))
    }

    const validateForm = () => {
        const errors = {}

        if (!selectedVideo) {
            errors.video = 'Please select a video to upload'
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required'
        } else if (formData.description.length > 300) {
            errors.description = 'Description must be less than 300 characters'
        }

        if (formData.thumbnail_time < 0) {
            errors.thumbnail_time = 'Thumbnail time must be a positive number'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsUploading(true)

        try {
            // Create FormData for file upload
            const uploadData = new FormData()
            
            // Required fields
            uploadData.append('description', formData.description.trim())
            uploadData.append('upload_file', selectedVideo)
            uploadData.append('thumbnail_time', formData.thumbnail_time.toString())
            uploadData.append('viewable', formData.viewable)
            
            // Optional fields
            if (formData.music && formData.music.trim()) {
                uploadData.append('music', formData.music.trim())
            }
            
            // Permissions
            formData.allows.forEach(permission => {
                uploadData.append('allows[]', permission)
            })

            const result = await videoService.uploadVideo(uploadData)

            if (result.success) {
                console.log('✅ Video uploaded successfully!')
                // Navigate to profile page to see the uploaded video
                navigate(`/@${currentUser.nickname}`)
            } else {
                console.error('❌ Video upload failed:', result.error)
                setFormErrors({ submit: result.error || 'Failed to upload video' })
            }
        } catch (err) {
            console.error('❌ Video upload exception:', err)
            setFormErrors({ submit: 'An unexpected error occurred' })
        } finally {
            setIsUploading(false)
        }
    }

    const handleDiscard = () => {
        if (selectedVideo) {
            handleRemoveVideo()
        }
        setFormData({
            description: '',
            music: '',
            thumbnail_time: 5,
            viewable: 'public',
            allows: ['comment']
        })
        setFormErrors({})
    }

    const triggerFileInput = () => {
        videoInputRef.current?.click()
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                {/* Left Panel - Video Upload/Preview */}
                <div className={cx('leftPanel')}>
                    <h2 className={cx('subtitle')}>Upload video</h2>
                    
                    {!selectedVideo ? (
                        <div 
                            className={cx('uploadArea', { dragOver: isDragOver })}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                        >
                            <FontAwesomeIcon icon={faCloudUpload} className={cx('uploadIcon')} />
                            <div className={cx('uploadText')}>
                                <h3>Select video to upload</h3>
                                <p>Or drag and drop a file</p>
                            </div>
                            <button type="button" className={cx('selectButton')}>
                                Select file
                            </button>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className={cx('videoInput')}
                            />
                        </div>
                    ) : (
                        <>
                            <div className={cx('videoPreview')}>
                                <video
                                    src={videoPreview}
                                    className={cx('previewVideo')}
                                    controls
                                    muted
                                />
                                <button 
                                    className={cx('removeVideo')}
                                    onClick={handleRemoveVideo}
                                    type="button"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            
                            <div className={cx('videoInfo')}>
                                <h4>Video Details</h4>
                                <p>Size: {formatFileSize(selectedVideo.size)}</p>
                                <p>Type: {selectedVideo.type}</p>
                                <p>Name: {selectedVideo.name}</p>
                            </div>
                        </>
                    )}
                    
                    {formErrors.video && (
                        <div className={cx('errorMessage')}>{formErrors.video}</div>
                    )}
                </div>

                {/* Right Panel - Form */}
                <div className={cx('rightPanel')}>
                    <h1 className={cx('title')}>Upload</h1>
                    <h3 className={cx('subtitle')}>Post your video to TikTok</h3>
                    
                    <form onSubmit={handleSubmit} className={cx('form')}>
                        {formErrors.submit && (
                            <div className={cx('errorMessage')} style={{ marginBottom: '16px' }}>
                                {formErrors.submit}
                            </div>
                        )}

                        {/* Description */}
                        <div className={cx('formGroup')}>
                            <label className={cx('label')}>Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={handleInputChange('description')}
                                className={cx('textarea', { error: formErrors.description })}
                                placeholder="Describe your video..."
                                maxLength={300}
                            />
                            <div className={cx('charCount')}>
                                {formData.description.length}/300
                            </div>
                            {formErrors.description && (
                                <div className={cx('errorMessage')}>{formErrors.description}</div>
                            )}
                        </div>

                        {/* Music */}
                        <div className={cx('formGroup')}>
                            <label className={cx('label')}>Music (Optional)</label>
                            <input
                                type="text"
                                value={formData.music}
                                onChange={handleInputChange('music')}
                                className={cx('input')}
                                placeholder="Add music name..."
                            />
                        </div>

                        {/* Thumbnail Time */}
                        <div className={cx('formGroup')}>
                            <label className={cx('label')}>Thumbnail Time (seconds)</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={formData.thumbnail_time}
                                onChange={handleInputChange('thumbnail_time')}
                                className={cx('input', { error: formErrors.thumbnail_time })}
                                placeholder="5"
                            />
                            {formErrors.thumbnail_time && (
                                <div className={cx('errorMessage')}>{formErrors.thumbnail_time}</div>
                            )}
                        </div>

                        {/* Privacy Settings */}
                        <div className={cx('privacySection')}>
                            <h4 className={cx('sectionTitle')}>Who can view this video</h4>
                            <div className={cx('radioGroup')}>
                                <div className={cx('radioOption')}>
                                    <input
                                        type="radio"
                                        id="public"
                                        name="viewable"
                                        value="public"
                                        checked={formData.viewable === 'public'}
                                        onChange={handleInputChange('viewable')}
                                    />
                                    <label htmlFor="public">Public</label>
                                </div>
                                <div className={cx('radioOption')}>
                                    <input
                                        type="radio"
                                        id="friends"
                                        name="viewable"
                                        value="friends"
                                        checked={formData.viewable === 'friends'}
                                        onChange={handleInputChange('viewable')}
                                    />
                                    <label htmlFor="friends">Friends</label>
                                </div>
                                <div className={cx('radioOption')}>
                                    <input
                                        type="radio"
                                        id="private"
                                        name="viewable"
                                        value="private"
                                        checked={formData.viewable === 'private'}
                                        onChange={handleInputChange('viewable')}
                                    />
                                    <label htmlFor="private">Private</label>
                                </div>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className={cx('privacySection')}>
                            <h4 className={cx('sectionTitle')}>Allow users to:</h4>
                            <div className={cx('checkboxGroup')}>
                                <div className={cx('checkboxOption')}>
                                    <input
                                        type="checkbox"
                                        id="comment"
                                        checked={formData.allows.includes('comment')}
                                        onChange={() => handleCheckboxChange('comment')}
                                    />
                                    <label htmlFor="comment">Comment</label>
                                </div>
                                <div className={cx('checkboxOption')}>
                                    <input
                                        type="checkbox"
                                        id="duet"
                                        checked={formData.allows.includes('duet')}
                                        onChange={() => handleCheckboxChange('duet')}
                                    />
                                    <label htmlFor="duet">Duet</label>
                                </div>
                                <div className={cx('checkboxOption')}>
                                    <input
                                        type="checkbox"
                                        id="stitch"
                                        checked={formData.allows.includes('stitch')}
                                        onChange={() => handleCheckboxChange('stitch')}
                                    />
                                    <label htmlFor="stitch">Stitch</label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={cx('actions')}>
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className={cx('discardButton')}
                                disabled={isUploading}
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className={cx('postButton')}
                                disabled={isUploading || !selectedVideo}
                            >
                                {isUploading ? (
                                    <>
                                        <span className={cx('spinner')}></span>
                                        Uploading...
                                    </>
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Upload