import { useState, useEffect } from 'react'
import classNames from 'classnames/bind'
import config from '~/config'
import Menu, { MenuItem } from './Menu'
import styles from './Sidebar.module.scss'
import {
    HomeIcon,
    HomeActiveIcon,
    UserGroupIcon,
    UserGroupActiveIcon,
    LiveIcon,
    LiveActiveIcon,
} from '~/components/Icons'
import SuggestAccounts from '~/components/SuggestAccount/SuggestAccount'
import FollowingAccounts from '~/components/FollowingAccounts'
import * as userService from '~/services/userService'

const cx = classNames.bind(styles)

const INIT_PAGE = 1
const PER_PAGE = 5

function Sidebar() {
    const [page, setPage] = useState(INIT_PAGE)
    const [suggestedUsers, setSuggestedUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            setLoading(true)
            setError(null)
            
            try {
                const result = await userService.getSuggested({ page, perPage: PER_PAGE })
                
                if (result.success && Array.isArray(result.data)) {
                    setSuggestedUsers(prev => {
                        // Create a Set of existing user IDs to prevent duplicates
                        const existingIds = new Set(prev.map(user => user.id))
                        
                        // Filter out duplicates from new data
                        const newUsers = result.data.filter(user => !existingIds.has(user.id))
                        
                        // Return combined array with no duplicates
                        return [...prev, ...newUsers]
                    })
                } else {
                    console.warn('Failed to fetch suggested users:', result.error)
                    setError(result.error || 'Failed to load suggested users')
                }
            } catch (error) {
                console.error('Error fetching suggested users:', error)
                setError('Network error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchSuggestedUsers()
    }, [page])

    const handleSeeAll = () => {
        if (!loading) {
            setPage(page + 1)
        }
    }

    // Prevent wheel events from bubbling up to prevent video scroll
    const handleSidebarScroll = (e) => {
        e.stopPropagation()
    }

    return (
        <aside className={cx('wrapper')} onWheel={handleSidebarScroll}>
            <Menu>
                <MenuItem
                    title="For You"
                    to={config.routes.home}
                    icon={<HomeIcon />}
                    activeIcon={<HomeActiveIcon />}
                    end
                />
                <MenuItem
                    title="Following"
                    to={config.routes.following}
                    icon={<UserGroupIcon />}
                    activeIcon={<UserGroupActiveIcon />}
                />
                <MenuItem title="LIVE" to={config.routes.live} icon={<LiveIcon />} activeIcon={<LiveActiveIcon />} />
            </Menu>
            
            <SuggestAccounts 
                label="Suggested accounts" 
                data={suggestedUsers} 
                onSeeAll={handleSeeAll}
                loading={loading}
                error={error}
            />
            
            <FollowingAccounts label="Following accounts" />
        </aside>
    )
}

export default Sidebar
