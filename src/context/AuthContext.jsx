import React, { createContext, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser } from '../store/slices/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const login = async (email, role) => {
    try {
      await dispatch(loginUser({ email, password: 'password', role })).unwrap();
      return true;
    } catch (error) {
      console.error('Login action failed:', error);
      return false;
    }
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

const ROLE_ROUTES = {
  'Super Admin': '/super-admin-dashboard',
  'Sales': '/sales-dashboard',
  'Company Admin': '/company-admin-dashboard',
  'Dispatcher': '/dispatcher-dashboard',
  'Driver': '/driver-dashboard',
  'Warehouse Manager': '/warehouse-dashboard',
  'Yard Attendant': '/yard-attendant-dashboard',
  'Accounts': '/accounts-dashboard',
  'Customer': '/customer-dashboard',
};

// Protected Route Component with Role Based Access Control
export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard
    const correctRoute = ROLE_ROUTES[user.role] || '/dashboard';
    return <Navigate to={correctRoute} replace />;
  }

  return children;
}

