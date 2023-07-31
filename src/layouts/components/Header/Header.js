import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '~/store'

import Tippy from '@tippyjs/react/'
import 'tippy.js/dist/tippy.css'

import classNames from 'classnames/bind'
import styles from './Header.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faPlus } from '@fortawesome/free-solid-svg-icons'

import images from '~/assets/images'
import config from '~/config'
import Button from '~/components/Button'
import Menu from '~/components/Popper/Menu'
import Image from '~/components/Image'
import Search from '../Search'
import {
    GetCoinsIcon,
    KeyboardIcon,
    LanguageIcon,
    SettingsIcon,
    UploadIcon,
    ViewProfileIcon,
    HelpIcon,
    LogoutIcon,
    MessageIcon,
    InboxIcon,
} from '~/components/Icons'
import Modal from '~/components/Modal'
import { useModal } from '~/hooks'

const cx = classNames.bind(styles)

const MENU_ITEMS = [
    {
        icon: <LanguageIcon />,
        title: 'English',
        children: {
            title: 'Language',
            data: [
                {
                    type: 'language',
                    code: 'en',
                    title: 'English',
                },
                {
                    type: 'language',
                    code: 'vi',
                    title: 'Tiếng Việt',
                },
            ],
        },
    },
    {
        icon: <HelpIcon />,
        title: 'Feedback and help',
        to: '/feedback',
    },
    {
        icon: <KeyboardIcon />,
        title: 'Keyboard shortcuts',
        to: '',
    },
]

function Header() {
    const { isAuthenticated, currentUser, logout, isLoading, setLanguage } = useAppContext()
    const [isModalShowing, toggleShowModal] = useModal()
    const navigate = useNavigate()

    // Handle upload navigation
    const handleUploadClick = () => {
        navigate(config.routes.upload)
    }

    // Handle logic menu items
    const handleMenuChange = (menuItem) => {
        switch (menuItem.type) {
            case 'language':
                setLanguage(menuItem.code)
                break
            default:
                if (menuItem.title === 'Log out') {
                    logout()
                }
                break
        }
    }

    const userMenu = [
        {
            icon: <ViewProfileIcon />,
            title: 'View profile',
            to: currentUser ? `/@${currentUser.nickname}` : '/',
        },
        {
            icon: <GetCoinsIcon />,
            title: 'Get coins',
            to: '/getcoins',
        },
        {
            icon: <SettingsIcon />,
            title: 'Settings',
            to: '/settings',
        },

        ...MENU_ITEMS,

        {
            icon: <LogoutIcon />,
            title: 'Log out',
            separate: true,
        },
    ]

    const handleLoginSuccess = (userData) => {
        console.log('User logged in:', userData)
    }

    if (isLoading) {
        return (
            <header className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('logo')}>
                        <Link to={config.routes.home} className={cx('logo-link')}>
                            <Image src={images.logo} alt="Tiktok" />
                        </Link>
                    </div>
                    <Search />
                    <div className={cx('actions')}>
                        <div className={cx('loading')}>Loading...</div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('logo')}>
                    <Link to={config.routes.home} className={cx('logo-link')}>
                        <Image src={images.logo} alt="Tiktok" />
                    </Link>
                </div>

                <Search />

                <div className={cx('actions')}>
                    {isAuthenticated && currentUser ? (
                        <>                            <Tippy delay="200" content="Upload video" placement="bottom">
                                <button className={cx('action-btn')} onClick={handleUploadClick}>
                                    <UploadIcon />
                                </button>
                            </Tippy>
                            <Tippy delay="200" content="Messages" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <MessageIcon />
                                </button>
                            </Tippy>
                            <Tippy delay="200" content="Inbox" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <InboxIcon />
                                    <span className={cx('badge')}>12</span>
                                </button>
                            </Tippy>
                        </>
                    ) : (                        <>
                            <Button outline leftIcon={<FontAwesomeIcon icon={faPlus} />} onClick={handleUploadClick}>
                                Upload
                            </Button>
                            <Button primary onClick={toggleShowModal}>
                                Log in
                            </Button>
                            <Modal
                                isModalShowing={isModalShowing}
                                toggleShowModal={toggleShowModal}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        </>
                    )}

                    <Menu items={isAuthenticated ? userMenu : MENU_ITEMS} onChange={handleMenuChange}>
                        {isAuthenticated && currentUser ? (
                            <div className={cx('user-info')}>
                                <Image
                                    src={currentUser.avatar || images.noImage}
                                    alt={currentUser.nickname || currentUser.first_name}
                                    className={cx('user-avatar')}
                                />
                            </div>
                        ) : (
                            <button className={cx('more-btn')}>
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        )}
                    </Menu>
                </div>
            </div>
        </header>
    )
}

export default Header
