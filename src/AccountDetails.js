import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateCompanyForm from './CreateCompanyForm';
import { toast } from 'react-toastify';
import axios from 'axios'; // Assuming you're using axios for HTTP requests
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
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
  const [companyData, setCompanyData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = useUser();
  const userEmail = user?.email; // Safely access the email property

  
  
  
  

  const fetchUserDetails = async () => {
    if (!user || !user.email) {
      console.error("User data is not available.");
      return;
    }
  
    try {
      const response = await axiosInstance.get(`http://localhost:3001/getUserDetails?email=${encodeURIComponent(user.email)}`);
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setUsername(userData.username || ''); // Notice direct access to userData
  setName(userData.name || '');
  setSurname(userData.surname || '');
  setStreet(userData.street || ''); // Set street
  setNumber(userData.number || ''); // Set number
  setCity(userData.city || ''); // Set city
  setPostcode(userData.postcode || ''); // Set postcode
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
  // Only fetch user details if the user object is available
  if (user && user.email) {
    fetchUserDetails();
  } else {
    // If no user is present, navigate to login
    navigate('/login');
  }
}, [user, navigate, ]); // Added fetchUserDetails as a dependency





useEffect(() => {
  

  // Fetch company data if user is present
  const fetchCompanyData = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:3001/api/created_company', {
        
      });
      setCompanyData(response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError('Failed to fetch company data.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchCompanyData();
}, [user, navigate]);




// Adjust handleSubmit to use userDetailsExist to decide between insert/update
const handleSubmit = async (event) => {
  event.preventDefault();
  const endpoint = userDetailsExist ? '/updateUserDetails' : '/insertUserDetails';

  try {
    const response = await axiosInstance.post(`http://localhost:3001${endpoint}`, {
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



const handleManageCompanyData = () => {
  navigate('/CreateCompany');
};

if (isLoading) {
  return <div>Loading...</div>;
}


return (
  <div>
    <h1>Account Details</h1>
    <p>Email: {user.email}</p>
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
    <div>
            <h1>Dane firmy:</h1>
            {error && <p className="error-message">{error}</p>}
            {companyData ? (
                <div>
                    <p>Company Name: {companyData.company_name}</p>
                    <p>Street: {companyData.street}</p>
                    <p>Number: {companyData.number}</p>
                    <p>Post Code: {companyData.post_code}</p>
                    <p>City: {companyData.city}</p>
                    <p>Country: {companyData.country}</p>
                    <p>Tax ID: {companyData.taxid}</p>
                    {companyData.forma === 'osoba_fizyczna' && <p>PESEL: {companyData.pesel}</p>}
                    <p>Tax Office: {companyData.tax_office}</p>
                    <p>ID: {companyData.company_id}</p>
                    <p>Insurance: {companyData.wypadkowe}</p>
                    <p>Bank Account: {companyData.bank_account}</p>
                    <p>Business Form: {companyData.forma}</p>
                </div>
            ) : (
                <p>No data available. Please add company details.</p>
            )}
            <button onClick={handleManageCompanyData}>
                {companyData ? 'Update Company Data' : 'Create Company Data'}
            </button>
        </div>
  </div>
  
);
}

export default AccountDetails;
