import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const PrivateRoute = ({ element: Component, allowedRoles }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/LoginUser" />;
  }

  if (allowedRoles.includes(user.role)) {
    return <Component />;
  }

  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
