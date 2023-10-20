import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import EmployeeContract from './EmployeeContract';

function EmployeeContractPage({ id }) {
  const [contract, setContract] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/contracts/${id}`);
        console.log('API Response:', response.data);
        setContract(response.data.contract);
      } catch (error) {
        console.error('Error fetching contract:', error);
      }
    };

    fetchContractData();
  }, [id]);

  // Function to navigate back to the employee list page
  const handleNavigateBack = () => {
    navigate('/employeeList'); // You can adjust the path based on your route configuration
  };

  if (!contract) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleNavigateBack}>Back</button> {/* Add the "Back" button */}
      <EmployeeContract employeeData={contract.employeeData} contract={contract} />
    </div>
  );
}

export default EmployeeContractPage;
