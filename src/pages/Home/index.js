import { useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames/bind'

import VideoPlayer from '~/components/VideoPlayer'
import Comments from '~/components/Comments'
import { useInfiniteScroll } from '~/hooks'
import * as videoService from '~/services/videoService'
import styles from './Home.module.scss'

const cx = classNames.bind(styles)

function Home() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [commentsVisible, setCommentsVisible] = useState({}) // Track which videos have comments open
    const loadingRef = useRef(false)

    const { currentIndex, goToNext, setCurrentIndex } = useInfiniteScroll()

    const loadVideos = useCallback(async (pageNum, reset = false) => {
        if (loadingRef.current) return

        loadingRef.current = true
        setLoading(true)

        try {
            const result = await videoService.getVideos({
                type: 'for-you', // Default to for-you since tabs are removed
                page: pageNum,
            })

            if (result.success && result.data?.data) {
                const newVideos = result.data.data

                if (reset) {
                    setVideos(newVideos)
                    setPage(1)
                } else {
                    setVideos((prev) => [...prev, ...newVideos])
                    setPage(pageNum)
                }

                setHasMore(newVideos.length > 0)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error loading videos:', error)
            setHasMore(false)
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, []) // Remove videoType dependency

    // Load initial videos
    useEffect(() => {
        setCurrentIndex(0)
        setPage(1)
        setHasMore(true)
        loadVideos(1, true)
    }, [loadVideos, setCurrentIndex])

    // Load more videos when approaching the end
    useEffect(() => {
        if (currentIndex >= videos.length - 3 && hasMore && !loadingRef.current && videos.length > 0) {
            loadVideos(page + 1)
        }
    }, [currentIndex, videos.length, hasMore, page, loadVideos])

    const handleVideoEnd = useCallback(() => {
        goToNext()
    }, [goToNext])

    const handleCommentsToggle = useCallback((videoId, isVisible) => {
        setCommentsVisible((prev) => ({
            ...prev,
            [videoId]: isVisible,
        }))
    }, [])    // Helper function to get the correct transform based on screen size and comments state
    const getVideoTransform = useCallback(
        (index, isCommentsOpen) => {
            // Base transform for centering and vertical positioning
            const baseTransform = `translateX(-30%) translateY(${(index - currentIndex) * 100}%)`
            
            // Add horizontal offset when comments are open (only for desktop)
            if (isCommentsOpen && window.innerWidth > 768) {
                return `translateX(-50%) translateY(${(index - currentIndex) * 100}%)`
            }
            
            return baseTransform
        },
        [currentIndex],
    )

    return (
        <div className={cx('home')}>
            <div className={cx('video-feed')}>
                {videos.map((video, index) => {
                    const videoId = video.id || video.uuid || index
                    const isCommentsOpen = commentsVisible[videoId]

                    return (                        <div
                            key={videoId}
                            className={cx('video-item', {
                                active: index === currentIndex,
                            })}
                            style={{
                                // Use helper function to get correct transform
                                transform: getVideoTransform(index, isCommentsOpen),
                                zIndex: index === currentIndex ? 2 : 1,
                            }}
                        >
                            <VideoPlayer
                                video={video}
                                isActive={index === currentIndex}
                                onVideoEnd={handleVideoEnd}
                                onCommentsToggle={(isVisible) => handleCommentsToggle(videoId, isVisible)}
                            />
                            <Comments
                                video={video}
                                isVisible={isCommentsOpen}
                                onClose={() => handleCommentsToggle(videoId, false)}
                            />
                        </div>
                    )
                })}
            </div>

            {loading && videos.length === 0 && (
                <div className={cx('initial-loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Loading videos...</p>
                </div>
            )}

            {loading && videos.length > 0 && (
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                </div>
            )}

            <div className={cx('navigation-hint')}>
                <p>Scroll or use arrow keys to navigate</p>
            </div>
        </div>
    )
}

export default Home
