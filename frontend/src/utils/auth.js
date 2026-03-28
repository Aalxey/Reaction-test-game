const USER_KEY = 'user';

export const auth = {
    /**
     * Set the user session
     * @param {Object} userData - The user data to save (username, token, etc.)
     * @param {Boolean} rememberMe - Whether to use local storage (persistent) or session storage
     */
    setUser: (userData, rememberMe) => {
        const data = JSON.stringify(userData);
        if (rememberMe) {
            localStorage.setItem(USER_KEY, data);
            sessionStorage.removeItem(USER_KEY);
        } else {
            sessionStorage.setItem(USER_KEY, data);
            localStorage.removeItem(USER_KEY);
        }
    },

    /**
     * Get the current user session
     * @returns {Object|null}
     */
    getUser: () => {
        const localData = localStorage.getItem(USER_KEY);
        const sessionData = sessionStorage.getItem(USER_KEY);
        const rawData = localData || sessionData;

        if (!rawData) return null;

        try {
            return JSON.parse(rawData);
        } catch (e) {
            console.error('Error parsing user data', e);
            return null;
        }
    },

    /**
     * Remove the user session (Logout)
     */
    removeUser: () => {
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(USER_KEY);
    },

    /**
     * Check if a user is authenticated
     * @returns {Boolean}
     */
    isAuthenticated: () => {
        const user = auth.getUser();
        return !!(user && user.token);
    },

    /**
     * Save username for pre-filling login form
     * @param {string} username 
     */
    saveUsername: (username) => {
        localStorage.setItem('remembered_username', username);
    },

    /**
     * Get remembered username
     * @returns {string|null}
     */
    getRememberedUsername: () => {
        return localStorage.getItem('remembered_username');
    },

    /**
     * Clear remembered username
     */
    clearUsername: () => {
        localStorage.removeItem('remembered_username');
    },

    /**
     * Check if the current user is an admin
     * @returns {Boolean}
     */
    isAdmin: () => {
        const user = auth.getUser();
        return !!(user && user.is_superuser);
    }
};
