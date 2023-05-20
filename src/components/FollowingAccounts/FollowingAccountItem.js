import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames/bind'
import Tippy from '@tippyjs/react/headless'
import { Wrapper as PopperWrapper } from '~/components/Popper'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import Image from '~/components/Image'
import AccountPreview from '~/components/SuggestAccount/AccountPreview'
import styles from './FollowingAccountItem.module.scss'
import { useNavigate } from 'react-router-dom'

const cx = classNames.bind(styles)

function FollowingAccountItem({ data }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/@${data.nickname}`)
    }

    const renderPreview = (props) => {
        return (
            <div tabIndex='-1' {...props} >
                <PopperWrapper>
                    <div className={cx('preview')}>
                        <AccountPreview data={data} />
                    </div>
                </PopperWrapper>
            </div>
        )
    }

    return (
        <div>
            <Tippy
                interactive
                delay={[500, 0]}
                offset={[-20, 0]}
                render={renderPreview}
                placement="bottom"
            >
                <div className={cx('account-item')} onClick={handleClick}>
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
            </Tippy>
        </div>
    )
}

FollowingAccountItem.propTypes = {
    data: PropTypes.object.isRequired
}

export default FollowingAccountItem