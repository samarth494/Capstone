import { isAuthenticated } from '../utils/auth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // If there is no token, redirect to the front page.
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    // If there is a token, render the child routes.
    return <Outlet />;
};

export default ProtectedRoute;
