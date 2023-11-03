import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EmployeeParam() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  // New state variables for the employee parameters
  const [koszty, setKoszty] = useState('250');
  const [ulga, setUlga] = useState('300');
  const [kodUb, setKodUb] = useState('');
  const [validFrom, setValidFrom] = useState('');
  // Add a state to store the response data for the notification
  const [paramData, setParamData] = useState(null);
  const [worksOutsideHome, setWorksOutsideHome] = useState(false);
const [hasPension, setHasPension] = useState(false);
const [numOfCompanies, setNumOfCompanies] = useState(1);



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

  const handleWorksOutsideHomeChange = (event) => {
    const answer = event.target.value === 'yes';
    setWorksOutsideHome(answer);
    setKoszty(answer ? '300' : '250'); // Automatically set koszty based on the answer
  };
  
  const handleHasPensionChange = (event) => {
    const answer = event.target.value === 'yes';
    setHasPension(answer);
    setUlga(calculateUlga(answer, numOfCompanies));
  };
  
  const handleNumOfCompaniesChange = (event) => {
    const count = Number(event.target.value);
    setNumOfCompanies(count);
    setUlga(calculateUlga(hasPension, count));
  };
  

  const calculateUlga = (hasPension, numOfCompanies) => {
    if (hasPension) {
      return '0'; // If the employee has a pension, ulga is 0
    } else {
      // No pension, determine ulga based on the number of companies
      switch (numOfCompanies) {
        case 1:
          return '300';
        case 2:
          return '150';
        case 3:
          return '100';
        default:
          return '300'; // Default to 300 if something goes wrong
      }
    }
  };
  // Initialize ulga with default value based on conditions
useEffect(() => {
    setUlga(calculateUlga(hasPension, numOfCompanies));
  }, [hasPension, numOfCompanies]); // Recalculate when hasPension or numOfCompanies changes
  
  

  // Below is the form where you can input the parameters
  return (
    <div>
      <h2>Add Employee Parameters</h2>
      <form onSubmit={handleSubmit}>
      <label>Czy pracownik pracuje poza miejscem zamieszkania?</label>
<div>
  <input
    type="radio"
    name="worksOutsideHome"
    value="yes"
    checked={worksOutsideHome === true}
    onChange={handleWorksOutsideHomeChange}
  /> Tak
  <input
    type="radio"
    name="worksOutsideHome"
    value="no"
    checked={worksOutsideHome === false}
    onChange={handleWorksOutsideHomeChange}
  /> Nie
</div>
        <label>Koszty uzyskania przychodu:</label>
        <input type="number" value={koszty} onChange={handleKosztyChange} />

        <label>Posiada rentę/emerytrę?</label>
<div>
  <input
    type="radio"
    name="hasPension"
    value="yes"
    checked={hasPension === true}
    onChange={handleHasPensionChange}
  /> Tak
  <input
    type="radio"
    name="hasPension"
    value="no"
    checked={hasPension === false}
    onChange={handleHasPensionChange}
  /> Nie
</div>
{/* Question for the number of companies */}
<label>Ilość firm, w których pracuje:</label>
<select value={numOfCompanies} onChange={handleNumOfCompaniesChange}>
  <option value={1}>1 firma</option>
  <option value={2}>2 firmy</option>
  <option value={3}>3 firmy</option>
  {/* Add more options if needed */}
</select>


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
