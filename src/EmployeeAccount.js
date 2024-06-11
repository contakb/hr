import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import CalendarPage from './CalendarPage';
import { toast } from 'react-toastify';
import { useRequireAuth } from './useRequireAuth';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary

function EmployeeAccount() {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useUser();

  const fetchEmployeeDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('http://localhost:3001/employees', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName // Include the schema name in the request headers
        }
      });

      // Find the employee details from the response using the user email
      const employee = response.data.employees.find(emp => emp.user_email === user.email);

      if (!employee) {
        toast.error('Employee details not found.');
      } else {
        setEmployeeDetails(employee);
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
  }, [user, fetchEmployeeDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/update-employee/${employeeDetails.id}`, employeeDetails, {
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

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 p-4">
      <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md mx-auto">
        <h1 className="font-bold text-xl mb-4">Employee Details</h1>
        {employeeDetails && (
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeName" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                id="employeeName"
                name="name"
                type="text"
                value={employeeDetails.name}
                onChange={handleInputChange}
                readOnly={!isEditMode}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="employeeSurname" className="block text-gray-700 text-sm font-bold mb-2">Surname:</label>
              <input
                id="employeeSurname"
                name="surname"
                type="text"
                value={employeeDetails.surname}
                onChange={handleInputChange}
                readOnly={!isEditMode}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {isEditMode ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditMode}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={toggleEditMode}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md mx-auto mt-8">
        <h2 className="font-bold text-xl mb-4">Calendar:</h2>
        <CalendarPage />
      </div>
    </div>
  );
}

export default EmployeeAccount;
