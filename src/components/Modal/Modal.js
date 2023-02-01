import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames/bind'
import styles from './Modal.module.scss'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Login from './ModalType/Login'
import ChannelItem from './ChannelItem'
import { FacebookIcon, GoogleIcon, LineIcon, QRIcon, TwitterIcon, UserIcon } from '~/components/Icons'
import { useEffect } from 'react'

const cx = classNames.bind(styles)

const Modal = ({ isModalShowing, toggleShowModal, onLoginSuccess }) => {
    const [isLoginModal, setIsLoginModal] = useState(true)
    const [history, setHistory] = useState([])

    const loginModal = {
        title: 'Log in to TopTop',
        channelList: [
            {
                title: 'Use email or username',
                icon: <UserIcon />,
                isDisabled: false,
                children: {
                    title: 'Log in',
                    body: <Login onSuccess={onLoginSuccess} onClose={toggleShowModal} />,
                },
            },
            {
                title: 'Use QR Code',
                icon: <QRIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with facebook',
                icon: <FacebookIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with google',
                icon: <GoogleIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Twitter',
                icon: <TwitterIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Line',
                icon: <LineIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Twitter',
                icon: <TwitterIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Line',
                icon: <LineIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Twitter',
                icon: <TwitterIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with Line',
                icon: <LineIcon />,
                isDisabled: true,
            },
        ],
        footer: {},
    }

    const signupModal = {
        title: 'Sign up for TopTop',
        channelList: [
            {
                title: 'Use email or username',
                icon: <UserIcon />,
                isDisabled: false,
                children: {
                    title: 'Sign up',
                    body: <Login onSuccess={onLoginSuccess} onClose={toggleShowModal} />,
                },
            },
            {
                title: 'Use QR Code',
                icon: <QRIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with facebook',
                icon: <FacebookIcon />,
                isDisabled: true,
            },
            {
                title: 'Continue with google',
                icon: <GoogleIcon />,
                isDisabled: true,
            },
        ],
    }

    // Initialize history with the current modal
    useEffect(() => {
        const modal = isLoginModal ? loginModal : signupModal
        setHistory([modal])
    }, [isLoginModal, onLoginSuccess])

    const current = history[history.length - 1] || (isLoginModal ? loginModal : signupModal)

    const renderItems = () => {
        if (current.channelList) {
            return current.channelList.map((channel, index) => (
                <ChannelItem
                    key={index}
                    title={channel.title}
                    icon={channel.icon}
                    disabled={channel.isDisabled}
                    children={channel.children}
                    onClick={() => {
                        if (!channel.isDisabled && channel.children) {
                            setHistory((prev) => [...prev, channel.children])
                        }
                    }}
                />
            ))
        } else {
            return current.body
        }
    }

    // Reset modal state when modal closes
    useEffect(() => {
        if (!isModalShowing) {
            setHistory([])
            setIsLoginModal(true)
        }
    }, [isModalShowing])

    // Prevent body scroll on modal open
    useEffect(() => {
        if (isModalShowing) document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'overlay'
        }
    }, [isModalShowing])

    if (!isModalShowing) return null

    return createPortal(
        <>
            <div className={cx('overlay')} onClick={toggleShowModal} />
            <div className={cx('wrapper')} tabIndex={-1} role="dialog">
                <div className={cx('close-btn')} onClick={toggleShowModal}>
                    <FontAwesomeIcon className={cx('icon')} icon={faXmark} />
                </div>
                <div className={cx('modal')}>
                    <div className={cx('body')}>
                        <div className={cx('title')}>{current.title}</div>
                        <div className={cx('channel-list')}>{renderItems()}</div>
                    </div>
                    {isLoginModal || (
                        <div className={cx('terms')}>
                            <p className={cx('terms-text')}>
                                By continuing, you agree to TopTop's <a href="/legal/terms-of-use">Terms of Service</a>{' '}
                                and confirm that you have read TopTop's{' '}
                                <a href="/legal/privacy-policy">Privacy Policy</a>.
                            </p>
                        </div>
                    )}
                    <div className={cx('footer')}>
                        {isLoginModal ? (
                            <p>
                                Don't have an account?
                                <strong className={cx('change')} onClick={() => setIsLoginModal(!isLoginModal)}>
                                    Sign up
                                </strong>
                            </p>
                        ) : (
                            <p>
                                Already have an account?
                                <strong className={cx('change')} onClick={() => setIsLoginModal(!isLoginModal)}>
                                    Log in
                                </strong>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body,
    )
}

Modal.propTypes = {
    isModalShowing: PropTypes.bool.isRequired,
    toggleShowModal: PropTypes.func.isRequired,
    onLoginSuccess: PropTypes.func,
}

export default Modal
