import React, { useState } from 'react';
import axios from 'axios';

function SalaryCalculator() {
  const [contractFromDate, setContractFromDate] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');

  const handleCalculateSalary = (event) => {
    event.preventDefault();

    // Perform salary calculation request to the server
    axios
      .post('http://localhost:3001/calculate-salary', {
        contractFromDate,
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

  const handleContractFromDateChange = (event) => {
    setContractFromDate(event.target.value);
  };

  const handleGrossAmountChange = (event) => {
    setGrossAmount(event.target.value);
  };

  return (
    <div>
      <h1>Salary Calculator</h1>
      <form onSubmit={handleCalculateSalary}>
        <label>Contract From Date:</label>
        <input type="date" value={contractFromDate} onChange={handleContractFromDateChange} />

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
    </div>
  );
}

export default SalaryCalculator;
