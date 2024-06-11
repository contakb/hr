import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import CalendarPage from './CalendarPage';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary

function EmployeeAccount() {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useUser();
  const [taxOffices, setTaxOffices] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [taxOffice, setTaxOffice] = useState('');
  const [taxOfficeName, setTaxOfficeName] = useState('');
  const navigate = useNavigate();

  const fetchEmployeeDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('http://localhost:3001/employee', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName, // Include the schema name in the request headers
          'X-User-Email': user.email // Include the user email in the request headers
        },
        params: { user_email: user.email } // Add the user email as a query parameter
      });

      if (response.data) {
        setEmployeeDetails(response.data);
      } else {
        toast.error('Employee details not found.');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('An error occurred while fetching employee details.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEmployeeDetails();
    }
    // New logic to fetch tax offices
    axios.get('http://localhost:3001/tax-offices')
      .then((response) => {
        setTaxOffices(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tax offices:', error);
      });
  }, [user, fetchEmployeeDetails]);

  const taxOfficeOptions = taxOffices ? taxOffices.map(office => ({
    value: office.tax_office,
    label: office.tax_office
  })) : [];

  const handleTaxOfficeChange = (e) => {
    const selectedOption = e.target.value;
    setTaxOffice(selectedOption);
    setTaxOfficeName(selectedOption);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`http://localhost:3001/update-employee/${employeeDetails.id}`, employeeDetails, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName // Include the schema name in the request headers
        }
      });

      if (response.data) {
        toast.success('Details updated successfully!');
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error updating employee details:', error);
      toast.error('An error occurred while updating employee details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (event) => {
    event.preventDefault();
    setIsEditMode(true);
  };
  
  const handleCancelEdit = () => {
    
    setIsEditMode(false);
  };
  
  

  const toggleDetails = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      console.log('Logged out successfully');
      navigate('/LoginUser'); // Adjust as necessary for your route setup
    } else {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 p-4">
      <div className="flex flex-col lg:flex-row gap-8 justify-center lg:items-start">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md">
          <h1 className="font-bold text-xl mb-4">Employee Details:</h1>
          {employeeDetails && (
            <div>
              <p className="mb-3">Name: {employeeDetails.name}</p>
              <p className="mb-3">Surname: {employeeDetails.surname}</p>
              <button
                type="button"
                onClick={toggleDetails}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
              {showDetails && (
                <form onSubmit={handleSave} className="space-y-4 mt-4">
                  <div className="flex flex-wrap -mx-2">
                  <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="surname" className="block text-gray-700 text-sm font-bold mb-2">Surname:</label>
                      <input
                        id="surname"
                        name="surname"
                        type="text"
                        value={employeeDetails.surname}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="street" className="block text-gray-700 text-sm font-bold mb-2">Street:</label>
                      <input
                        id="street"
                        name="street"
                        type="text"
                        value={employeeDetails.street}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="number" className="block text-gray-700 text-sm font-bold mb-2">Number:</label>
                      <input
                        id="number"
                        name="number"
                        type="text"
                        value={employeeDetails.number}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="postcode" className="block text-gray-700 text-sm font-bold mb-2">Postcode:</label>
                      <input
                        id="postcode"
                        name="postcode"
                        type="text"
                        value={employeeDetails.postcode}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City:</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={employeeDetails.city}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country:</label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={employeeDetails.country}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="taxOffice" className="block text-gray-700 text-sm font-bold mb-2">Tax Office:</label>
                      <select
                        id="taxOffice"
                        name="tax_office"
                        value={employeeDetails.tax_office}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        {taxOffices.map(office => (
                          <option key={office.id} value={office.tax_office}>{office.tax_office}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditMode ? (
                      <>
                        <button
                          type="submit"
                          disabled={isLoading} // Disable the button when isLoading is true
                          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading ? 'Processing...' : 'Save'}
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
                </form>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-col w-full lg:max-w-md lg:space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="font-bold text-xl mb-4">Calendar:</h2>
            <CalendarPage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAccount;
