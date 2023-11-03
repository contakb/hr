import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EmployeeParam() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  // New state variables for the employee parameters
  const [koszty, setKoszty] = useState('');
  const [ulga, setUlga] = useState('');
  const [kodUb, setKodUb] = useState('');
  const [validFrom, setValidFrom] = useState('');
  // Add a state to store the response data for the notification
  const [paramData, setParamData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Adjust the URL and payload to match your new API endpoint for adding employee parameters
      const response = await axios.post(`http://localhost:3001/employees/${employeeId}/add-params`, {
        koszty,
        ulga,
        kodUb,
        validFrom
      });
  
      // Set the response data to paramData to show the notification
      setParamData({
        ...response.data.employeeParams,
        // Ensure kod_ub is a string with leading zeros
        kod_ub: String(response.data.employeeParams.kod_ub).padStart(6, '0')
      }); // Adjust according to your actual response structure
  
      // Clear form fields or navigate to a confirmation page
      setKoszty('');
      setUlga('');
      setKodUb('');
      setValidFrom('');
  
      // Optionally navigate to a confirmation page or show a success message
    } catch (error) {
      // Handle errors here
      console.error('Error adding employee parameters:', error);
    }
  };
  

  // Add handlers for the new input fields
  const handleKosztyChange = (event) => setKoszty(event.target.value);
  const handleUlgaChange = (event) => setUlga(event.target.value);
  const handleKodUbChange = (event) => setKodUb(event.target.value);
  const handleValidFromChange = (event) => setValidFrom(event.target.value);

  // Below is the form where you can input the parameters
  return (
    <div>
      <h2>Add Employee Parameters</h2>
      <form onSubmit={handleSubmit}>
        <label>Koszty uzyskania przychodu:</label>
        <input type="number" value={koszty} onChange={handleKosztyChange} />

        <label>Ulga podatkowa:</label>
        <input type="number" value={ulga} onChange={handleUlgaChange} />

        <label>Kod ubezpieczenia:</label>
        <input type="text" value={kodUb} onChange={handleKodUbChange} />

        <label>Valid From:</label>
        <input type="date" value={validFrom} onChange={handleValidFromChange} />

        <button type="submit">Add Parameters</button>
      </form>
      
      {paramData && (
        <div>
          <h2>Parameters Added Successfully!</h2>
          {/* You will display the relevant fields from the paramData here.
               Make sure these fields match the response data structure from your API. */}
          <p>Koszty: {paramData.koszty}</p>
          <p>Ulga: {paramData.ulga}</p>
          <p>Kod UB: {paramData.kod_ub}</p> {/* Make sure the property name matches */}
    <p>Valid From: {paramData.valid_from}</p> {/* Make sure the property name matches */}
          {/* ... more fields as needed ... */}
        </div>
      )}

      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export default EmployeeParam;
