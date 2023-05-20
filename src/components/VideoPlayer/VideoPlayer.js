import { useState, useRef, useEffect, useCallback } from 'react'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faCommentDots, faShare, faMusic, faPlay, faPause, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

import styles from './VideoPlayer.module.scss'
import Image from '~/components/Image'
import Button from '~/components/Button'
import * as videoService from '~/services/videoService'
import * as userService from '~/services/userService'

const cx = classNames.bind(styles)

function VideoPlayer({ video, isActive, onVideoEnd }) {
    const videoRef = useRef()
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [isLiked, setIsLiked] = useState(video?.is_liked || false)
    const [likeCount, setLikeCount] = useState(video?.likes_count || 0)
    const [showControls, setShowControls] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFollowing, setIsFollowing] = useState(video?.user?.is_followed || false)
    const [videoError, setVideoError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const [likeLoading, setLikeLoading] = useState(false)
    const [isMuted, setIsMuted] = useState(true) // Add muted state
    const [isDragging, setIsDragging] = useState(false) // Add drag state
    const progressBarRef = useRef() // Add ref for progress bar

    // Helper function to get video URL from different possible properties
    const getVideoUrl = (videoData) => {
        if (!videoData) return null
        
        // Try different possible property names for video URL
        const possibleUrls = [
            videoData.file_url,
            videoData.video_url,
            videoData.url,
            videoData.src,
            videoData.video?.file_url,
            videoData.video?.url
        ]
        
        const validUrl = possibleUrls.find(url => url && typeof url === 'string')
        return validUrl
    }

    // Helper function to get thumbnail URL
    const getThumbnailUrl = (videoData) => {
        if (!videoData) return null
        
        const possibleThumbnails = [
            videoData.thumb_url,
            videoData.thumbnail_url,
            videoData.thumbnail,
            videoData.poster,
            videoData.video?.thumb_url,
            videoData.video?.thumbnail
        ]
        
        return possibleThumbnails.find(url => url && typeof url === 'string')
    }

    const videoUrl = getVideoUrl(video)
    const thumbnailUrl = getThumbnailUrl(video)

    useEffect(() => {
        console.log('VideoPlayer received video data:', video)
        console.log('Extracted video URL:', videoUrl)
        console.log('Extracted thumbnail URL:', thumbnailUrl)
    }, [video, videoUrl, thumbnailUrl])

    useEffect(() => {
        if (isActive && videoRef.current && videoUrl) {
            setIsLoading(true)
            videoRef.current.play()
                .then(() => {
                    setIsPlaying(true)
                    setIsLoading(false)
                    setVideoError(null)
                })
                .catch(error => {
                    console.error('Video play error:', error)
                    setVideoError(`Failed to play video: ${error.message}`)
                    setIsLoading(false)
                })
        } else if (videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }, [isActive, videoUrl])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Set initial volume
        video.volume = volume

        const updateProgress = () => {
            if (video.duration) {
                setCurrentTime(video.currentTime)
                setDuration(video.duration)
            }
        }

        const handleLoadStart = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)
        const handleError = (e) => {
            console.error('Video error:', e)
            setVideoError(`Video failed to load: ${e.target.error?.message || 'Unknown error'}`)
            setIsLoading(false)
        }

        video.addEventListener('timeupdate', updateProgress)
        video.addEventListener('loadstart', handleLoadStart)
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('error', handleError)
        
        return () => {
            video.removeEventListener('timeupdate', updateProgress)
            video.removeEventListener('loadstart', handleLoadStart)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
        }
    }, [volume])

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
                setIsPlaying(false)
            } else {
                videoRef.current.play().catch(console.error)
                setIsPlaying(true)
            }
        }
    }

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
    }

    // Handle progress bar click for seeking
    const handleProgressClick = (e) => {
        if (!videoRef.current || !videoRef.current.duration || isDragging) return
        
        const progressBar = e.currentTarget
        const rect = progressBar.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const progressWidth = rect.width
        const clickPercent = clickX / progressWidth
        const newTime = clickPercent * videoRef.current.duration
        
        videoRef.current.currentTime = newTime
    }

    // Handle drag start
    const handleMouseDown = (e) => {
        if (!videoRef.current || !videoRef.current.duration) return
        
        setIsDragging(true)
        handleProgressUpdate(e)
        
        // Add event listeners for drag
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    // Handle drag move
    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !progressBarRef.current || !videoRef.current) return
        
        handleProgressUpdate(e)
    }, [isDragging])

    // Handle drag end
    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseMove])

    // Update progress based on mouse position
    const handleProgressUpdate = (e) => {
        if (!progressBarRef.current || !videoRef.current || !videoRef.current.duration) return
        
        const rect = progressBarRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const progressWidth = rect.width
        const clickPercent = Math.max(0, Math.min(1, mouseX / progressWidth))
        const newTime = clickPercent * videoRef.current.duration
        
        videoRef.current.currentTime = newTime
    }

    // Clean up event listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    const handleMuteToggle = useCallback(() => {
        if (videoRef.current) {
            const newMutedState = !isMuted
            setIsMuted(newMutedState)
            videoRef.current.muted = newMutedState
            
            // If unmuting and volume is 0, set to a reasonable level
            if (!newMutedState && volume === 0) {
                setVolume(0.5)
                videoRef.current.volume = 0.5
            }
        }
    }, [isMuted, volume])

    const handleLike = async () => {
        if (likeLoading) return
        
        setLikeLoading(true)
        try {
            if (isLiked) {
                const result = await videoService.unlikeVideo(video.id || video.uuid)
                if (result.success) {
                    setIsLiked(false)
                    setLikeCount(prev => Math.max(0, prev - 1))
                }
            } else {
                const result = await videoService.likeVideo(video.id || video.uuid)
                if (result.success) {
                    setIsLiked(true)
                    setLikeCount(prev => prev + 1)
                }
            }
        } catch (error) {
            console.error('Like/Unlike error:', error)
        } finally {
            setLikeLoading(false)
        }
    }

    const handleFollow = async () => {
        if (followLoading || !video?.user?.id) return
        
        setFollowLoading(true)
        try {
            if (isFollowing) {
                const result = await userService.unfollowUser(video.user.id)
                if (result.success) {
                    setIsFollowing(false)
                }
            } else {
                const result = await userService.followUser(video.user.id)
                if (result.success) {
                    setIsFollowing(true)
                }
            }
        } catch (error) {
            console.error('Follow/Unfollow error:', error)
        } finally {
            setFollowLoading(false)
        }
    }

    const handleVideoEnd = () => {
        setCurrentTime(0)
        onVideoEnd && onVideoEnd()
    }

    const handleVideoClick = (e) => {
        e.preventDefault()
        if (!videoError && videoUrl) {
            handlePlayPause()
        }
    }

    if (!video) {
        return (
            <div className={cx('video-player')}>
                <div className={cx('video-container', 'no-video')}>
                    <p>No video data available</p>
                </div>
            </div>
        )
    }

    if (!videoUrl) {
        return (
            <div className={cx('video-player')}>
                <div className={cx('video-container', 'no-video')}>
                    <div className={cx('error-message')}>
                        <p>Video URL not found</p>
                        <small>Available properties: {Object.keys(video).join(', ')}</small>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cx('video-player')}>
            <div className={cx('video-container')}>
                {isLoading && (
                    <div className={cx('loading-overlay')}>
                        <div className={cx('spinner')}></div>
                    </div>
                )}
                
                {videoError && (
                    <div className={cx('error-overlay')}>
                        <div className={cx('error-message')}>
                            <p>Video Error</p>
                            <small>{videoError}</small>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className={cx('video')}
                    loop
                    muted={isMuted} // Use isMuted state
                    playsInline
                    src={videoUrl}
                    poster={thumbnailUrl}
                    onEnded={handleVideoEnd}
                    onClick={handleVideoClick}
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(false)}
                />
                
                {!videoError && (
                    <div className={cx('controls', { show: showControls })}>
                        <button className={cx('play-btn')} onClick={handlePlayPause}>
                            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                        </button>
                    </div>
                )}

                {/* Progress bar */}
                <div 
                    className={cx('progress-bar')} 
                    onClick={handleProgressClick}
                    onMouseDown={handleMouseDown}
                    title="Click or drag to seek"
                    ref={progressBarRef}
                >
                    <div 
                        className={cx('progress')} 
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                {/* Volume control */}
                <div className={cx('volume-control')}>
                    <button 
                        className={cx('mute-btn')} 
                        onClick={handleMuteToggle}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted || volume === 0 ? (
                            <FontAwesomeIcon icon={faVolumeMute} />
                        ) : volume < 0.5 ? (
                            <FontAwesomeIcon icon={faVolumeUp} />
                        ) : (
                            <FontAwesomeIcon icon={faVolumeUp} />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className={cx('volume-slider')}
                        disabled={isMuted}
                        title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                    />
                    <span className={cx('volume-label')}>
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                </div>
            </div>

            <div className={cx('video-info')}>
                <div className={cx('author-info')}>
                    <Image 
                        className={cx('avatar')} 
                        src={video?.user?.avatar} 
                        alt={video?.user?.nickname || 'User avatar'}
                    />
                    <div className={cx('author-details')}>
                        <h3 className={cx('nickname')}>{video?.user?.nickname || 'Unknown User'}</h3>
                        <p className={cx('name')}>
                            {video?.user?.first_name && video?.user?.last_name 
                                ? `${video.user.first_name} ${video.user.last_name}`
                                : video?.user?.full_name || video?.user?.nickname
                            }
                        </p>
                    </div>
                    {!isFollowing && (
                        <Button
                            className={cx('follow-btn')}
                            outline
                            small
                            onClick={handleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? 'Following...' : 'Follow'}
                        </Button>
                    )}
                </div>

                <div className={cx('video-description')}>
                    <p>{video?.description}</p>
                    {video?.music && (
                        <div className={cx('music-info')}>
                            <FontAwesomeIcon icon={faMusic} />
                            <span>{video.music}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={cx('action-buttons')}>
                <button 
                    className={cx('action-btn', { liked: isLiked, loading: likeLoading })} 
                    onClick={handleLike}
                    disabled={likeLoading}
                >
                    <FontAwesomeIcon icon={isLiked ? faHeart : faHeartRegular} />
                    <span>{likeCount}</span>
                </button>

                <button className={cx('action-btn')}>
                    <FontAwesomeIcon icon={faCommentDots} />
                    <span>{video?.comments_count || 0}</span>
                </button>

                <button className={cx('action-btn')}>
                    <FontAwesomeIcon icon={faShare} />
                    <span>Share</span>
                </button>
            </div>
        </div>
    )
}

export default VideoPlayer