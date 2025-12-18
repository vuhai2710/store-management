import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated) {

    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
