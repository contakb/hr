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
  <div className="p-4">
    <h1 className="font-bold text-xl mb-4">Account Details</h1>
    <p className="mb-2">Email: {user.email}</p>
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { id: 'username', value: username, onChange: setUsername, placeholder: 'Enter your username' },
        { id: 'name', value: name, onChange: setName, placeholder: 'Enter your name' },
        { id: 'surname', value: surname, onChange: setSurname, placeholder: 'Enter your surname' },
        { id: 'street', value: street, onChange: setStreet, placeholder: 'Enter your street' },
        { id: 'number', value: number, onChange: setNumber, placeholder: 'Enter your number' },
        { id: 'postcode', value: postcode, onChange: setPostcode, placeholder: 'Enter your postcode' },
        { id: 'city', value: city, onChange: setCity, placeholder: 'Enter your city' },
      ].map((input) => (
        <div key={input.id}>
          <label htmlFor={input.id} className="block text-gray-700 text-sm font-bold mb-2">
            {input.id}:
          </label>
          <input
            id={input.id}
            type="text"
            value={input.value}
            onChange={(e) => input.onChange(e.target.value)}
            placeholder={input.placeholder}
            readOnly={!isEditMode}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      ))}
      <div className="flex items-center space-x-2">
        {isEditMode ? (
          <>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {username ? 'Update Details' : 'Save Data'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleEditClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Edit
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Logout
      </button>
    </form>
    {updateMessage && <p className="mt-4">{updateMessage}</p>}
    <div className="mt-6">
      <h2 className="font-bold text-lg mb-2">Company Data:</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {companyData ? (
        <div className="space-y-2">
          {/* Company data fields */}
          <p>Company Name: {companyData.company_name}</p>
          {/* The rest of the company data fields */}
        </div>
      ) : (
        <p>No data available. Please add company details.</p>
      )}
      <button
        onClick={handleManageCompanyData}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {companyData ? 'Update Company Data' : 'Create Company Data'}
      </button>
    </div>
  </div>
);
}

export default AccountDetails;
