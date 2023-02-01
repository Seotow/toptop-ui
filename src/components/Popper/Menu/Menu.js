import PropTypes from 'prop-types'
import { useState } from 'react'
import classNames from 'classnames/bind'
import Tippy from '@tippyjs/react/headless'
import { Wrapper as PopperWrapper } from '~/components/Popper'
import MenuItem from './MenuItem'
import Header from './Header'
import styles from './Menu.module.scss'

const cx = classNames.bind(styles)

const defaultFn = () => {}

function Menu({ items = [], children, hideOnClick = false, onChange = defaultFn }) {
    const [history, setHistory] = useState([{ data: items }])
    const current = history[history.length - 1]

    const renderItems = () => {
        return current.data.map((item, index) => {
            const isParent = !!item.children

            return (
                <MenuItem
                    key={index}
                    data={item}
                    onClick={() => {
                        if (!isParent) {
                            onChange(item)
                        } else {
                            setHistory((prev) => [...prev, item.children])
                        }
                    }}
                />
            )
        })
    }

    const handleBack = () => {
        setHistory((prev) => prev.slice(0, prev.length - 1))
    }

    const renderResult = (attrs) => (
        <div className={cx('menu-list')} tabIndex="-1" {...attrs}>
            <PopperWrapper className={cx('menu-popper')}>
                {history.length > 1 && (
                    <Header
                        title={current.title}
                        onBack={handleBack}
                    />
                )}

                {<div className={cx('menu-body')}>{renderItems()}</div>}
            </PopperWrapper>
        </div>
    )

    // Reset to first menu on hide
    const handleHide = () => setHistory((prev) => prev.slice(0, 1))

    return (
        <Tippy
            offset={[12, 8]}
            delay={[0, 700]}
            interactive
            hideOnClick={hideOnClick}
            placement="bottom-end"
            render={renderResult}
            onHide={handleHide}
        >
            {children}
        </Tippy>
    )
}

Menu.propTypes = {
    items: PropTypes.array,
    children: PropTypes.node.isRequired,
    hideOnClick: PropTypes.bool,
    onChange: PropTypes.func,
}

export default Menu
