import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateCompanyForm from './CreateCompanyForm';
import { toast } from 'react-toastify';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
// In your React component, e.g., AccountDetails.js


function AccountDetails() {
  const [accountDetails, setAccountDetails] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [email] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false); // To toggle between edit and view mode
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [originalData, setOriginalData] = useState({});

  const [userDetailsExist, setUserDetailsExist] = useState(false);
  const navigate = useNavigate();

  
  
  
  

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/getUserDetails?email=${encodeURIComponent(email)}`);
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setUsername(response.data.data.username || '');
        setName(response.data.data.name || '');
        setSurname(response.data.data.surname || '');
        setStreet(response.data.data.street || ''); // Set street
        setNumber(response.data.data.number || ''); // Set number
        setCity(response.data.data.city || ''); // Set city
        setPostcode(response.data.data.postcode || ''); // Set postcode
        setIsEditMode(false); // Have details, view mode
        setUserDetailsExist(true); // User details exist
        setOriginalData(userData); // Store the original data
      } else {
        setIsEditMode(true); // No details, edit mode
        setUserDetailsExist(false); // No user details found
      }
    }
    catch (error) {
      console.error('Error fetching user details:', error);
      setIsEditMode(true); // Assume edit mode on error
      setUserDetailsExist(false); // Error fetching details, assume no details exist
    }
}; 

useEffect(() => {
  fetchUserDetails();
}, [email]); // Depend on email to refetch if it changes

// Adjust handleSubmit to use userDetailsExist to decide between insert/update
const handleSubmit = async (event) => {
  event.preventDefault();
  const endpoint = userDetailsExist ? '/updateUserDetails' : '/insertUserDetails';

  try {
    const response = await axios.post(`http://localhost:3001${endpoint}`, {
      email,
      username,
      name,
      surname,
      street,
      number,
      city,
      postcode,
    });
    if (response.data.success) {
      toast.success(`${userDetailsExist ? 'Updated' : 'Saved'} successfully!`);
      setIsEditMode(false); // Exit edit mode after successful operation
      setUserDetailsExist(true); // Assume details now exist after successful save/update
      fetchUserDetails(); // Refetch user details to update UI
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
    navigate('/LoginUser'); // Adjust as necessary for your route setup
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

const handleCancelEdit = () => {
  // Reset fields to original data
  setUsername(originalData.username || '');
  setName(originalData.name || '');
  setSurname(originalData.surname || '');
  setStreet(originalData.street || '');
  setCity(originalData.city || '');
  setPostcode(originalData.postcode || '');
  setIsEditMode(false); // Exit edit mode
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
      <label htmlFor="name">name:</label>
      <input
  id="name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter your name"
  readOnly={!isEditMode}
/>
<label htmlFor="surname">surname:</label>
<input
  id="surname"
  type="text"
  value={surname}
  onChange={(e) => setSurname(e.target.value)}
  placeholder="Enter your surname"
  readOnly={!isEditMode}
/>
<label htmlFor="street">street:</label>
<input
  id="street"
  type="text"
  value={street}
  onChange={(e) => setStreet(e.target.value)}
  placeholder="Enter your street"
  readOnly={!isEditMode}
/>
<label htmlFor="number">number:</label>
<input
  id="number"
  type="text"
  value={number}
  onChange={(e) => setNumber(e.target.value)}
  placeholder="Enter your numer"
  readOnly={!isEditMode}
/>
<label htmlFor="postcode">postcode:</label>
<input
  id="postcode"
  type="text"
  value={postcode}
  onChange={(e) => setPostcode(e.target.value)}
  placeholder="Enter your postcode"
  readOnly={!isEditMode}
/>
<label htmlFor="city">city:</label>
<input
  id="city"
  type="text"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  placeholder="Enter your city"
  readOnly={!isEditMode}
/>
      {isEditMode ? (
        <>
        <button type="submit">{username ? 'Update Details' : 'Save Data'}</button>
        <button type="button" onClick={handleCancelEdit}>Cancel</button>
        </>
        
      ) : (
        <p><button type="button" onClick={handleEditClick}>Edit</button></p>
        

      )
      }
      <p><button type="button" onClick={handleLogout}>Logout</button></p>
      

    </form>
    {updateMessage && <p>{updateMessage}</p>}
  </div>
);
}

export default AccountDetails;
