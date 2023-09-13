import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SalaryCalculationPage = () => {
  const { employeeId } = useParams();
  const [grossAmount, setGrossAmount] = useState('');
  const [insurancePercentage, setInsurancePercentage] = useState('');
  const [otherPercentage, setOtherPercentage] = useState('');
  const [netAmount, setNetAmount] = useState('');

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform salary calculation based on the inputs
    const deductions = (grossAmount * insurancePercentage) / 100 + (grossAmount * otherPercentage) / 100;
    const net = grossAmount - deductions;
    setNetAmount(net);
  };

  // Fetch employee data from the server
// Fetch employee data from the server
useEffect(() => {
  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`/api/contracts/${employeeId}/gross_amount`);
      const { data } = response; // Destructure the response data
      
      console.log('API Response:', data); // Log the response data
      
      if (data.hasOwnProperty('grossAmount')) {
        setGrossAmount(data.grossAmount);
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  fetchEmployeeData();
}, [employeeId]);



return (
    <div>
      <h1>Salary Calculation</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="employeeId">Employee ID:</label>
<input
  type="text"
  id="employeeId"
  value={employeeId}
  disabled // disable input as it's derived from the URL
/>


        <label htmlFor="grossAmount">Gross Amount:</label>
        <input
          type="number"
          id="grossAmount"
          value={grossAmount}
          onChange={(e) => setGrossAmount(parseFloat(e.target.value))}
        />

        <label htmlFor="insurancePercentage">Insurance Percentage:</label>
        <input
          type="number"
          id="insurancePercentage"
          value={insurancePercentage}
          onChange={(e) => setInsurancePercentage(parseFloat(e.target.value))}
        />

        <label htmlFor="otherPercentage">Other Percentage:</label>
        <input
          type="number"
          id="otherPercentage"
          value={otherPercentage}
          onChange={(e) => setOtherPercentage(parseFloat(e.target.value))}
        />

        <button type="submit">Calculate Salary</button>
      </form>

      {netAmount !== '' && <p>Net Amount: {netAmount}</p>}
    </div>
  );
};

export default SalaryCalculationPage;
