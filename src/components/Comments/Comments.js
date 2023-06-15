import React, { useState, useEffect, useRef, useCallback } from 'react'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faTimes, 
    faHeart as faHeartSolid, 
    faPaperPlane,
    faSpinner 
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

import styles from './Comments.module.scss'
import Image from '~/components/Image'
import * as videoService from '~/services/videoService'

const cx = classNames.bind(styles)

function Comments({ video, isVisible, onClose }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const textareaRef = useRef(null)

    const loadComments = useCallback(async () => {
        if (!video?.id && !video?.uuid) return
        
        setLoading(true)
        try {
            const videoId = video.id || video.uuid
            const result = await videoService.getComments(videoId)
            if (result.success) {
                setComments(result.data || [])
            }
        } catch (error) {
            console.error('Error loading comments:', error)
        } finally {
            setLoading(false)
        }
    }, [video])

    useEffect(() => {
        if (isVisible && video) {
            loadComments()
        }
    }, [isVisible, video, loadComments])

    useEffect(() => {
        if (isVisible && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [isVisible])

    const handleSubmitComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim() || submitting) return

        const videoId = video?.id || video?.uuid
        if (!videoId) return

        setSubmitting(true)
        try {
            const result = await videoService.createComment(videoId, newComment.trim())
            if (result.success) {
                setComments(prev => [result.data, ...prev])
                setNewComment('')
            }
        } catch (error) {
            console.error('Error creating comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleLikeComment = async (commentId) => {
        const videoId = video?.id || video?.uuid
        if (!videoId) return

        try {
            const comment = comments.find(c => c.id === commentId)
            if (!comment) return

            if (comment.is_liked) {
                const result = await videoService.unlikeComment(videoId, commentId)
                if (result.success) {
                    setComments(prev => prev.map(c => 
                        c.id === commentId 
                            ? { ...c, is_liked: false, likes_count: Math.max(0, c.likes_count - 1) }
                            : c
                    ))
                }
            } else {
                const result = await videoService.likeComment(videoId, commentId)
                if (result.success) {
                    setComments(prev => prev.map(c => 
                        c.id === commentId 
                            ? { ...c, is_liked: true, likes_count: c.likes_count + 1 }
                            : c
                    ))
                }
            }        } catch (error) {
            console.error('Error toggling comment like:', error)
        }
    }

    const formatTimeAgo = (timestamp) => {
        const now = new Date()
        const commentTime = new Date(timestamp)
        const diffInSeconds = Math.floor((now - commentTime) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds}s`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
        return `${Math.floor(diffInSeconds / 86400)}d`    }

    // Prevent wheel events from bubbling up to prevent video scroll
    const handleCommentsScroll = (e) => {
        e.stopPropagation()
    }    
    return (
        <div className={cx('comments-overlay', { visible: isVisible })} onWheel={handleCommentsScroll}>
            <div className={cx('comments-panel')}>
                <div className={cx('comments-header')}>
                    <h3>Comments ({comments.length})</h3>
                    <button className={cx('close-btn')} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={cx('comments-list')}>
                    {loading ? (
                        <div className={cx('loading')}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Loading comments...</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className={cx('no-comments')}>
                            <p>No comments yet</p>
                            <span>Be the first to comment!</span>
                        </div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className={cx('comment-item')}>
                                <Image 
                                    className={cx('comment-avatar')} 
                                    src={comment.user?.avatar} 
                                    alt={comment.user?.nickname || 'User'}
                                />
                                <div className={cx('comment-content')}>
                                    <div className={cx('comment-header')}>
                                        <span className={cx('comment-username')}>
                                            {comment.user?.nickname || 'Unknown User'}
                                        </span>
                                        <span className={cx('comment-time')}>
                                            {formatTimeAgo(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className={cx('comment-text')}>{comment.comment}</p>
                                    <div className={cx('comment-actions')}>
                                        <button 
                                            className={cx('like-btn', { liked: comment.is_liked })}
                                            onClick={() => handleLikeComment(comment.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={comment.is_liked ? faHeartSolid : faHeartRegular} 
                                            />
                                            {comment.likes_count > 0 && (
                                                <span>{comment.likes_count}</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form className={cx('comment-form')} onSubmit={handleSubmitComment}>
                    <textarea
                        ref={textareaRef}
                        className={cx('comment-input')}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={1}
                        maxLength={500}
                    />
                    <button 
                        type="submit" 
                        className={cx('submit-btn', { disabled: !newComment.trim() || submitting })}
                        disabled={!newComment.trim() || submitting}
                    >
                        {submitting ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faPaperPlane} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Comments
