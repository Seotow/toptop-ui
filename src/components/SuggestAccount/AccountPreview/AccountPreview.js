import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import styles from './AccountPreview.module.scss'
import Image from '~/components/Image'
import Button from '~/components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import * as userService from '~/services/userService'

const cx = classNames.bind(styles)

function AccountPreview({ data }) {
    const [isFollowing, setIsFollowing] = useState(data?.is_followed || false)
    const [followLoading, setFollowLoading] = useState(false)

    const handleNumber = (number) => {
        let result
        
        if (number >= 1000000000){
            result = parseFloat((number/1000000000).toFixed(1))
            return `${result}B`
        } else if (number >= 1000000) {
            result = parseFloat((number/1000000).toFixed(1))
            return `${result}M`
        } else if (number >= 1000){
            result = parseFloat((number/1000).toFixed(1))
            return `${result}K`
        } else {
            return number
        }
    }

    const handleFollow = async () => {
        if (followLoading || !data?.id) return
        
        setFollowLoading(true)
        try {
            if (isFollowing) {
                const result = await userService.unfollowUser(data.id)
                if (result.success) {
                    setIsFollowing(false)
                }
            } else {
                const result = await userService.followUser(data.id)
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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <Image 
                    className={cx('avatar')}
                    src={data.avatar}
                    alt={data.nickname}
                />
                <Button 
                    className={cx('follow-btn')} 
                    primary={!isFollowing}
                    outline={isFollowing}
                    onClick={handleFollow}
                    disabled={followLoading}
                >
                    {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
                </Button>
            </div>
            <div className={cx('body')}>
                <p className={cx('nickname')}>
                    <strong>{data.nickname}</strong>
                    {data.tick && <FontAwesomeIcon className={cx('icon')} icon={faCircleCheck} />}
                </p>
                <p className={cx('name')}>{`${data.first_name} ${data.last_name}`}</p>
                <p className={cx('analytics')}>
                    <strong className={cx('value')}>{handleNumber(data.followers_count)} </strong>
                    <span className={cx('label')}>Followers</span>
                    <strong className={cx('value')}>{handleNumber(data.likes_count)} </strong>
                    <span className={cx('label')}>Likes</span>
                </p>
            </div>
        </div>
    )
}

AccountPreview.propTypes = {
    data: PropTypes.object.isRequired,
}

export default AccountPreview
