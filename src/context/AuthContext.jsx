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

// Protected Route Component with Role Based Access Control
export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login page but save the original location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User role is not permitted to see this page. Redirect to dashboard root.
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

