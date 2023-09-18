import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateCompanyForm from './CreateCompanyForm';

function AccountDetails() {
  const { username, userid } = useParams();
  const [accountDetails, setAccountDetails] = useState(null);
  const [fetchedUserId, setFetchedUserId] = useState(null); // New state for userid

  useEffect(() => {
    // Fetch the account details using the username parameter
    fetch(`http://localhost:3001/account/${username}`)
      .then(response => response.json())
      .then(data => setAccountDetails(data))
      .catch(error => console.error('Error fetching account details:', error));
  }, [username]);

  return (
    <div>
      <h1>Account Details</h1>
      {accountDetails ? (
        <div>
          <p>Email: {accountDetails.email}</p>
          <p>Username: {accountDetails.username}</p>
          <p>Userid: {accountDetails.userid}</p>
        </div>
      ) : (
        <p>Loading account details...</p>
      )}

      <hr />

      <CreateCompanyForm />
    </div>
  );
}

export default AccountDetails;
