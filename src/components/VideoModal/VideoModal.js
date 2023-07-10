import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames/bind'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import styles from './VideoModal.module.scss'
import VideoPlayer from '~/components/VideoPlayer'
import Comments from '~/components/Comments'

const cx = classNames.bind(styles)

function VideoModal({ video, isOpen, onClose }) {
    // Handle escape key press
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Handle click outside to close
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }    }

    if (!isOpen || !video) return null

    return createPortal(
        <div className={cx('overlay')} onClick={handleOverlayClick}>
            <div className={cx('modal')}>
                {/* Close button */}
                <button className={cx('closeButton')} onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className={cx('content')}>
                    {/* Video Player Section */}
                    <div className={cx('videoSection')}>
                        <VideoPlayer 
                            video={video} 
                            isActive={true}
                            onCommentsToggle={() => {}} 
                        />
                    </div>                    {/* Comments Section */}
                    <div className={cx('commentsSection')}>
                        <div className={cx('commentsWrapper')}>
                            <Comments 
                                video={video}
                                isVisible={true}
                                onClose={() => {}} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default VideoModal
