import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import styles from './SuggestAccounts.module.scss'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import Image from '~/components/Image'

const cx = classNames.bind(styles)

function AccountItem({ data }) {
    const navigate = useNavigate()
      const handleAccountClick = () => {
        navigate(`/@${data.nickname}`)
    }
    
    return (
        // Using a wrapper <div> or <span> tag around the reference element solves this by creating a new parentNode context
        <div>
            <div className={cx('account-items')} onClick={handleAccountClick}>
                <Image
                    className={cx('avatar')}
                    src={data.avatar}
                    alt={data.nickname}
                />
                <div className={cx('item-info')}>
                    <p className={cx('nickname')}>
                        <strong>{data.nickname}</strong>
                        {data.tick && <FontAwesomeIcon className={cx('icon')} icon={faCheckCircle} />}
                    </p>
                    <p className={cx('name')}>{`${data.first_name} ${data.last_name}`}</p>
                </div>
            </div>
        </div>
    )
}

AccountItem.propTypes = {
    data: PropTypes.object.isRequired
}

export default AccountItem
