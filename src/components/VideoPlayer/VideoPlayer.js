import { useState, useRef, useEffect } from 'react'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faCommentDots, faShare, faMusic, faPlay, faPause, faVolumeUp, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

import styles from './VideoPlayer.module.scss'
import * as videoService from '~/services/videoService'

const cx = classNames.bind(styles)

function VideoPlayer({ video, isActive, onVideoEnd }) {
    const videoRef = useRef()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isLiked, setIsLiked] = useState(video?.is_liked || false)
    const [likeCount, setLikeCount] = useState(video?.likes_count || 0)
    const [showControls, setShowControls] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isFollowing, setIsFollowing] = useState(video?.user?.is_followed || false)
    const [videoError, setVideoError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

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

        const updateProgress = () => {
            if (video.duration) {
                const progressPercent = (video.currentTime / video.duration) * 100
                setProgress(progressPercent)
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
    }, [])

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

    const handleMuteToggle = (e) => {
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const handleLike = async () => {
        try {
            if (isLiked) {
                const result = await videoService.unlikeVideo(video.id)
                if (result.success) {
                    setIsLiked(false)
                    setLikeCount(prev => prev - 1)
                }
            } else {
                const result = await videoService.likeVideo(video.id)
                if (result.success) {
                    setIsLiked(true)
                    setLikeCount(prev => prev + 1)
                }
            }
        } catch (error) {
            console.error('Like/Unlike error:', error)
        }
    }

    const handleFollow = async () => {
        // This would typically call a follow/unfollow API
        setIsFollowing(!isFollowing)
    }

    const handleVideoEnd = () => {
        setProgress(0)
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
                    muted={isMuted}
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
                        <button className={cx('mute-btn')} onClick={handleMuteToggle}>
                            <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeUp} />
                        </button>
                    </div>
                )}

                <div className={cx('progress-bar')}>
                    <div 
                        className={cx('progress')} 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className={cx('video-info')}>
                <div className={cx('author-info')}>
                    <img 
                        className={cx('avatar')} 
                        src={video?.user?.avatar} 
                        alt={video?.user?.nickname}
                    />
                    <div className={cx('author-details')}>
                        <h3 className={cx('nickname')}>{video?.user?.nickname}</h3>
                        <p className={cx('name')}>{video?.user?.first_name} {video?.user?.last_name}</p>
                    </div>
                    <button 
                        className={cx('follow-btn', { following: isFollowing })}
                        onClick={handleFollow}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
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
                    className={cx('action-btn', { liked: isLiked })} 
                    onClick={handleLike}
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