import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import styles from './FollowingAccounts.module.scss'
import FollowingAccountItem from './FollowingAccountItem'
import * as userService from '~/services/userService'

const cx = classNames.bind(styles)

function FollowingAccounts({ label }) {
    const [followingUsers, setFollowingUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            setLoading(true)
            setError(null)
            
            try {
                const result = await userService.getFollowings(page)
                
                if (result.success && Array.isArray(result.data)) {
                    if (page === 1) {
                        setFollowingUsers(result.data)
                    } else {
                        setFollowingUsers(prev => {
                            const existingIds = new Set(prev.map(user => user.id))
                            const newUsers = result.data.filter(user => !existingIds.has(user.id))
                            return [...prev, ...newUsers]
                        })
                    }
                    
                    // Check if there are more users to load
                    setHasMore(result.data.length > 0)
                } else {
                    setError(result.error || 'Failed to load following users')
                    setHasMore(false)
                }
            } catch (error) {
                console.error('Error fetching following users:', error)
                setError('Network error occurred')
                setHasMore(false)
            } finally {
                setLoading(false)
            }
        }

        fetchFollowingUsers()
    }, [page])

    const handleSeeMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1)
        }
    }

    const handleScroll = (e) => {
        // Prevent event bubbling to avoid interfering with video scroll
        e.stopPropagation()
    }

    if (followingUsers.length === 0 && !loading && !error) {
        return (
            <div className={cx('wrapper')} onWheel={handleScroll}>
                <p className={cx('label')}>{label}</p>
                <div className={cx('empty-state')}>
                    <p>No following accounts yet</p>
                    <span>Start following creators to see them here</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cx('wrapper')} onWheel={handleScroll}>
            <p className={cx('label')}>{label}</p>

            {error && (
                <div className={cx('error-message')}>
                    <p>{error}</p>
                </div>
            )}

            <div className={cx('accounts-list')}>
                {followingUsers.map((account, index) => (
                    <FollowingAccountItem 
                        key={account.id ? `${account.id}-${index}` : `following-${index}`} 
                        data={account} 
                    />
                ))}
            </div>

            {(hasMore || loading) && (
                <div className={cx('more-btn')}>
                    <p 
                        className={cx('btn-title', { disabled: loading })} 
                        onClick={handleSeeMore}
                    >
                        {loading ? 'Loading...' : 'See more'}
                    </p>
                </div>
            )}
        </div>
    )
}

FollowingAccounts.propTypes = {
    label: PropTypes.string.isRequired
}

export default FollowingAccounts