import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CreateCompanyForm from './CreateCompanyForm';

function AccountDetails() {
  const [accountDetails, setAccountDetails] = useState(null);
  const location = useLocation();
  const userData = location.state; // Get user data from the route state

  useEffect(() => {
    if (userData) {
      // Fetch the account details using the username from userData
      fetch(`http://localhost:3001/account/${userData.username}`)
        .then(response => response.json())
        .then(data => setAccountDetails(data))
        .catch(error => console.error('Error fetching account details:', error));
    }
  }, [userData]);

  console.log('userData:', userData); // Log userData to check if it contains userid
  console.log('userData in AccountDetails:', userData);




  return (
    <div>
      <h1>Account Details</h1>
      {accountDetails ? (
        <div>
          <p>Email: {accountDetails.email}</p>
          <p>Username: {accountDetails.storedUsername}</p>
          <p>Userid: {userData ? userData.userid : 'Not available'}</p>

        </div>
      ) : (
        <p>Loading account details...</p>
      )}

      <hr />
      <CreateCompanyForm userid={userData.AuthenticatedUserID} />
      
    </div>
  );
}

export default AccountDetails;

