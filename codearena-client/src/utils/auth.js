
export const getAuthToken = () => {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const getUser = () => {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    try {
        if (sessionUser) return JSON.parse(sessionUser);
        if (localUser) return JSON.parse(localUser);
    } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
    }
    return null;
};

export const login = (token, user, rememberMe) => {
    if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};

export const updateUser = (userData) => {
    if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
    if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(userData));
    }
};

export const isAuthenticated = () => {
    return !!getAuthToken();
};
