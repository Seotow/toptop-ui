import PropTypes from 'prop-types';
import classNames from "classnames/bind"
import styles from './SuggestAccounts.module.scss'
import AccountItem from './AccountItem';

const cx = classNames.bind(styles)

function SuggestAccounts({ label, data = [], onSeeAll, loading = false, error = null}) {
    return (
        <div className={cx('wrapper')}>
            <p className={cx('label')}>{label}</p>

            {error && (
                <div className={cx('error-message')}>
                    <p>{error}</p>
                </div>
            )}

            {data.map((account, index) => (
                <AccountItem 
                    key={account.id ? `${account.id}-${index}` : `account-${index}`} 
                    data={account} 
                />
            ))}

            {data.length === 0 && !loading && !error && (
                <div className={cx('no-data')}>
                    <p>No accounts found</p>
                </div>
            )}

            {onSeeAll && (
                <div className={cx('more-btn')}>
                    <p 
                        className={cx('btn-title', { disabled: loading })} 
                        onClick={onSeeAll}
                    >
                        {loading ? 'Loading...' : 'See more'}
                    </p>
                </div>
            )}
        </div>
    )
}

SuggestAccounts.propTypes = {
    label: PropTypes.string.isRequired,
    data: PropTypes.array,
    onSeeAll: PropTypes.func,
    loading: PropTypes.bool,
    error: PropTypes.string
}

export default SuggestAccounts
