import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames/bind'
import styles from './SuggestAccounts.module.scss'
import Tippy from '@tippyjs/react/headless'
import { Wrapper as PopperWrapper } from '~/components/Popper'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import Image from '~/components/Image'
import AccountPreview from './AccountPreview'

const cx = classNames.bind(styles)

function AccountItem({ data }) {
    const renderPreview = (props) => {
        return (
            <div tabIndex='-1' {...props} >
                <PopperWrapper>
                    <div className={cx('preview')}>
                        <AccountPreview data={data}/>
                    </div>
                </PopperWrapper>
            </div>
        )
    }
    
    return (
        // Using a wrapper <div> or <span> tag around the reference element solves this by creating a new parentNode context
        <div>
            <Tippy
                interactive
                delay={[500, 0]}
                offset={[-20, 0]}
                render={renderPreview}
                placement="bottom"
            >
                <div className={cx('account-items')}>
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

AccountItem.propTypes = {
    data: PropTypes.object.isRequired
}

export default AccountItem
