import PropTypes from 'prop-types'
import classNames from 'classnames/bind'
import styles from './Modal.module.scss'

const cx = classNames.bind(styles)

function ChannelItem({ title, icon, disabled, children, onClick }) {
    return (
        <div className={cx('channel-item', { disabled })} onClick={children && !disabled && onClick}>
            <span className={cx('icon')}>{icon}</span>
            <div className={cx('channel-title')}>{title}</div>
        </div>
    )
}

ChannelItem.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    disabled: PropTypes.bool.isRequired,
    // children: PropTypes.node,
    onClick: PropTypes.func
}

export default ChannelItem
