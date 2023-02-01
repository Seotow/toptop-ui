export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const setCookie = (name, value, options = {}) => {
    const { 
        expires = null, 
        path = '/', 
        domain = null, 
        secure = false, 
        sameSite = 'lax' 
    } = options;
    
    let cookieString = `${name}=${value}`;
    
    if (expires) {
        const date = new Date();
        date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000)); // expires in days
        cookieString += `; expires=${date.toUTCString()}`;
    }
    
    cookieString += `; path=${path}`;
    
    if (domain) {
        cookieString += `; domain=${domain}`;
    }
    
    if (secure) {
        cookieString += `; secure`;
    }
    
    cookieString += `; SameSite=${sameSite}`;
    
    document.cookie = cookieString;
}

export const removeCookie = (name, path = '/') => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

// Local storage helpers
export const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
}

export const getLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error getting localStorage:', error);
        return null;
    }
}

export const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing localStorage:', error);
    }
}