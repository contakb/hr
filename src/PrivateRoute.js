import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const PrivateRoute = ({ element: Component, allowedRoles }) => {
  const { user, loading } = useUser();

  if (loading) {
    console.log("PrivateRoute: Loading...");
    return <div>Loading...</div>;
  }

  console.log("PrivateRoute: User", user);

  if (!user) {
    console.log("PrivateRoute: No user, redirecting to /register");
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
    console.log(`PrivateRoute: User role is ${user.role}, rendering component`);
    return <Component />;
  }

  console.log(`PrivateRoute: User role is ${user.role}, redirecting to /unauthorized`);
  return <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
