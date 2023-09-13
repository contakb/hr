import React, { useState } from 'react';
import axios from 'axios';
import EmployeeForm from './EmployeeForm';

function SalaryCalculator() {
  const [grossAmount, setGrossAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const socialInsurance = 0.1; // Example value
  const incomeTax = 0.2; // Example value
  const healthInsurance = 0.05; // Example value

  function calculateNetSalary(grossAmount, socialInsurance, incomeTax, healthInsurance) {
    // Calculate the net amount based on the provided rates and gross amount
    const netAmount = grossAmount - (grossAmount * socialInsurance) - (grossAmount * incomeTax) - (grossAmount * healthInsurance);
    return netAmount;
  }

  const handleCalculateSalary = (event) => {
    event.preventDefault();

    // Perform salary calculation request to the server
    axios
      .post('http://localhost:3001/calculate-salary', {
        grossAmount
      })
      .then((response) => {
        // Handle successful salary calculation
        console.log('Salary calculated:', response.data);

        // Update net amount
        setNetAmount(response.data.netAmount);
      })
      .catch((error) => {
        // Handle salary calculation error
        console.error('Error calculating salary:', error);
      });
  };

  const handleGrossAmountChange = (event) => {
    setGrossAmount(event.target.value);
  };

  return (
    <div>
      <h1>Salary Calculator</h1>
      <form onSubmit={handleCalculateSalary}>
        <label>Gross Amount:</label>
        <input type="number" value={grossAmount} onChange={handleGrossAmountChange} />

        <button type="submit">Calculate Salary</button>
      </form>

      {netAmount && (
        <div>
          <h2>Net Amount:</h2>
          <p>{netAmount}</p>
        </div>
      )}

      <EmployeeForm />
    </div>
  );
}

export default SalaryCalculator;
