import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCommentDots, faBookmark, faShare, faVolumeUp, faVolumeMute, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import styles from './Video.module.scss';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

// Utility function to format large numbers
const formatCount = (count) => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count?.toString() || '0';
};

function Video({ data, autoPlay = false, muted = true, onVideoEnd }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigate = useNavigate();

    // Extract video URLs with more fallbacks and logging
    const videoUrl = data?.file_url || data?.video_url || data?.url || data?.video?.file_url || data?.video?.url || '';
    const thumbUrl = data?.thumb_url || data?.thumbnail_url || data?.poster || data?.video?.thumb_url || data?.video?.thumbnail || '';
    
    // Debug logging
    console.log('🎬 Video component data:', data);
    console.log('🎬 Video URL found:', videoUrl);
    console.log('🎬 Thumbnail URL found:', thumbUrl);
    
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Set initial mute state
        video.muted = isMuted;

        const handleLoadStart = () => {
            console.log('🎬 Video load started for:', videoUrl);
            setIsLoading(true);
            setHasError(false);
        };

        const handleCanPlay = () => {
            console.log('🎬 Video can play:', videoUrl);
            setIsLoading(false);
            if (autoPlay) {
                video.play().catch(err => {
                    console.error('🎬 Autoplay failed:', err);
                });
            }
        };

        const handleError = () => {
            console.error('🎬 Video error for:', videoUrl);
            setHasError(true);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                setProgress(progress);
            }
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            if (onVideoEnd) {
                onVideoEnd();
            }
        };

        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, [videoUrl, autoPlay, onVideoEnd, isMuted]);

    const togglePlay = (e) => {
        e?.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch(console.error);
        }
    };

    const toggleMute = (e) => {
        e?.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        video.muted = newMutedState;
    };

    const handleProgressClick = (e) => {
        e?.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    };

    const handleVideoClick = (e) => {
        // Only toggle play if clicking directly on video, not on controls
        if (e.target === videoRef.current) {
            togglePlay(e);
        }
    };

    const handleLikeClick = () => {
        setIsLiked(prev => !prev);
        // Add API call to like/unlike the video
    };

    const handleBookmarkClick = () => {
        setIsBookmarked(prev => !prev);
        // Add API call to bookmark/unbookmark the video
    };

    const handleFollowClick = () => {
        // Add API call to follow/unfollow the user
    };

    const handleCommentClick = () => {
        // Navigate to comments section or open comments modal
    };

    const handleShareClick = () => {
        // Implement share functionality
    };

    if (!videoUrl) {
        console.warn('🎬 No video URL found in data:', data);
        return (
            <div className={cx('video-container', 'no-video')}>
                <div className={cx('error-message')}>
                    <p>Video not available</p>
                    <small>No video URL found</small>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={cx('video-container')}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onClick={handleVideoClick}
        >
            <video
                ref={videoRef}
                className={cx('video')}
                src={videoUrl}
                poster={thumbUrl}
                muted={muted}
                playsInline
                preload="metadata"
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* Loading spinner */}
            {isLoading && (
                <div className={cx('loading-overlay')}>
                    <div className={cx('spinner')}></div>
                </div>
            )}

            {/* Error state */}
            {hasError && (
                <div className={cx('error-overlay')}>
                    <div className={cx('error-message')}>
                        <p>Failed to load video</p>
                        <small>{videoUrl}</small>
                    </div>
                </div>
            )}

            {/* Video controls */}
            {showControls && !isLoading && !hasError && (
                <div className={cx('controls')}>
                    <button
                        className={cx('play-button')}
                        onClick={togglePlay}
                    >
                        {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                    </button>
                    
                    <div className={cx('progress-bar')} onClick={handleProgressClick}>
                        <div 
                            className={cx('progress')}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <button
                        className={cx('mute-button')}
                        onClick={toggleMute}
                    >
                        {isMuted ? <FontAwesomeIcon icon={faVolumeMute} /> : <FontAwesomeIcon icon={faVolumeUp} />}
                    </button>
                </div>
            )}

            {/* Video info and actions */}
            <div className={cx('video-info')}>
                <div className={cx('user-info')}>
                    <div className={cx('author-details')} onClick={() => navigate(`/@${data.user?.nickname}`)}>
                        <h3 className={cx('nickname')}>
                            {data.user?.nickname || 'Unknown User'}
                        </h3>
                        <p className={cx('fullname')}>{data.user?.full_name || data.user?.nickname}</p>
                    </div>
                    
                    <Button
                        className={cx('follow-btn')}
                        outline
                        small
                        onClick={handleFollowClick}
                    >
                        Follow
                    </Button>
                </div>

                <div className={cx('description')}>
                    <p>{data.description}</p>
                    {data.music && (
                        <div className={cx('music-info')}>
                            <span>♪ {data.music}</span>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className={cx('actions')}>
                    <div className={cx('action-item')} onClick={handleLikeClick}>
                        <div className={cx('action-btn', { liked: isLiked })}>
                            <FontAwesomeIcon icon={faHeart} />
                        </div>
                        <span className={cx('action-count')}>{formatCount(data.likes_count)}</span>
                    </div>

                    <div className={cx('action-item')} onClick={handleCommentClick}>
                        <div className={cx('action-btn')}>
                            <FontAwesomeIcon icon={faCommentDots} />
                        </div>
                        <span className={cx('action-count')}>{formatCount(data.comments_count)}</span>
                    </div>

                    <div className={cx('action-item')} onClick={handleBookmarkClick}>
                        <div className={cx('action-btn', { bookmarked: isBookmarked })}>
                            <FontAwesomeIcon icon={faBookmark} />
                        </div>
                        <span className={cx('action-count')}>{formatCount(data.views_count)}</span>
                    </div>

                    <div className={cx('action-item')} onClick={handleShareClick}>
                        <div className={cx('action-btn')}>
                            <FontAwesomeIcon icon={faShare} />
                        </div>
                        <span className={cx('action-count')}>Share</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Video;