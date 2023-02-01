import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import styles from './AccountPreview.module.scss'
import Image from '~/components/Image'
import Button from '~/components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

const cx = classNames.bind(styles)

function AccountPreview({ data }) {
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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <Image 
                    className={cx('avatar')}
                    src={data.avatar}
                    alt={data.nickname}
                />
                <Button className={cx('follow-btn')} primary>Follow</Button>
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
