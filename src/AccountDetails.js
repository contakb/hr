import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CreateCompanyForm from './CreateCompanyForm';

function AccountDetails() {
  const [accountDetails, setAccountDetails] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();
  const userData = location.state;

  useEffect(() => {
    if (userData) {
      // Fetch the account details using the username from userData
      fetch(`http://localhost:3001/account/${userData.username}`)
        .then(response => response.json())
        .then(data => {
          console.log('Response data:', data);
          setAccountDetails(data.accountDetails);
          setSessionData(data.sessionData);
        })
        .catch(error => {
          console.error('Error fetching account details:', error);
        });
    }
  }, [userData]);

  return (
    <div>
      <h1>Account Details</h1>
      {accountDetails && sessionData ? (
        <div>
          <p>Email: {accountDetails.email}</p>
          <p>Username: {sessionData.storedUsername}</p>
          <p>Userid: {sessionData.userid}</p>
        </div>
      ) : (
        <p>Loading account details...</p>
      )}
      <hr />
      <CreateCompanyForm userid={sessionData ? sessionData.userid : null} />
    </div>
  );
}

export default AccountDetails;
