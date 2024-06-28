import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const PrivateRoute = ({ element: Component, allowedRoles }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/LoginUser" />;
  }

  const currentDate = new Date();
  const trialEndDate = new Date(user.trialEndDate);
  console.log('Current Date:', currentDate);
  console.log('Trial End Date:', trialEndDate);
  console.log('Trial Status:', user.trialStatus);

  // Check if the trial period has ended
  if (user.trialStatus && currentDate > trialEndDate) {
    return <Navigate to="/trial-ended" />;
  }

  if (allowedRoles.includes(user.role)) {
    return <Component />;
  }

  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
