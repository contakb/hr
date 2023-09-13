import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AddContractForm() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  console.log('Employee ID:', employeeId);

  const [grossAmount, setGrossAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddContract = () => {
    console.log('Employee ID:', employeeId);
    navigate(`/add-contract/${employeeId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3001/employees/${employeeId}/add-contract`, {
        grossAmount,
        startDate,
        endDate,
      });

      // Handle successful contract addition
      console.log('Contract added:', response.data);

      // Clear form fields
      setGrossAmount('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      // Handle contract addition error
      console.error('Error adding contract:', error);
    }
  };

  const handleGrossAmountChange = (event) => {
    setGrossAmount(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    <div>
      <h2>Add Contract</h2>
      <form onSubmit={handleSubmit}>
        <label>Gross Amount:</label>
        <input type="text" value={grossAmount} onChange={handleGrossAmountChange} />

        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={handleEndDateChange} />

        <button type="submit">Add Contract</button>
      </form>
    </div>
  );
}

export default AddContractForm;
