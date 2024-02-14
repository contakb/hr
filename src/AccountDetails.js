import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateCompanyForm from './CreateCompanyForm';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
// In your React component, e.g., AccountDetails.js


function AccountDetails() {
  const [accountDetails, setAccountDetails] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [email] = useState(location.state?.email || '');
  const [isEditMode, setIsEditMode] = useState(false); // To toggle between edit and view mode

  const [userDetailsExist, setUserDetailsExist] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  axios.get(`http://localhost:3001/getUserDetails?email=${encodeURIComponent(email)}`)
    .then(response => {
      if (response.data.success && response.data.data) {
        setUsername(response.data.data.username || '');
        setIsEditMode(false); // Have details, view mode
        setUserDetailsExist(true); // User details exist
      } else {
        setIsEditMode(true); // No details, edit mode
        setUserDetailsExist(false); // No user details found
      }
    })
    .catch(error => {
      console.error('Error fetching user details:', error);
      setIsEditMode(true); // Assume edit mode on error
      setUserDetailsExist(false); // Error fetching details, assume no details exist
    });
}, [email]);

// Adjust handleSubmit to use userDetailsExist to decide between insert/update
const handleSubmit = async (event) => {
  event.preventDefault();
  const endpoint = userDetailsExist ? '/updateUserDetails' : '/insertUserDetails';

  try {
    const response = await axios.post(`http://localhost:3001${endpoint}`, {
      email,
      username,
    });
    if (response.data.success) {
      setUpdateMessage(`${userDetailsExist ? 'Updated' : 'Saved'} successfully!`);
      setIsEditMode(false); // Exit edit mode after successful operation
      setUserDetailsExist(true); // Assume details now exist after successful save/update
    } else {
      setUpdateMessage('Failed to save details.');
    }
  } catch (error) {
    console.error('Error saving account details:', error);
    setUpdateMessage('An error occurred while saving details.');
  }
};


// Inside your React component, e.g., AccountDetails.js
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    console.log('Logged out successfully');
    // Reset local state here if necessary, e.g., setUsername('')
    navigate('/login'); // Adjust as necessary for your route setup
  } else {
    console.error('Error logging out:', error);
  }
};


  

// Additional function to handle "Edit" button click, to prevent form submission
const handleEditClick = (event) => {
  event.preventDefault();
  console.log("Edit clicked, switching to edit mode...");
  setIsEditMode(true);
};


return (
  <div>
    <h1>Account Details</h1>
    <p>Email: {email}</p>
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        readOnly={!isEditMode} // Make field editable only in edit mode
      />
      {isEditMode ? (
        <button type="submit">{username ? 'Update Details' : 'Save Data'}</button>
      ) : (
        <button type="button" onClick={handleEditClick}>Edit</button>

      )}
      <button type="button" onClick={handleLogout}>Logout</button>

    </form>
    {updateMessage && <p>{updateMessage}</p>}
  </div>
);
}

export default AccountDetails;
