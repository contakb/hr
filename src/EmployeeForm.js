import React, { useState } from 'react';
import axios from 'axios';

function EmployeeForm() {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeSurname, setEmployeeSurname] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [PESEL, setPESEL] = useState('');
  const [country, setCountry] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null); // Track the created employee

  const handleCreateEmployee = (event) => {
    event.preventDefault();

    // Perform create employee request to the server
    axios
      .post('http://localhost:3001/create-employee', {
        employeeName,
        employeeSurname,
        street,
        number,
        postcode,
        city,
		country,
        taxOffice,
        PESEL
      })
      .then((response) => {
        // Handle successful create employee
  console.log('Employee created:', response.data);

  const createdEmployeeData = {
    employeeName,
    employeeSurname,
    street,
    number,
    postcode,
    city,
    country,
    taxOffice,
    PESEL
  };

  // Set the created employee data in the state
  setCreatedEmployee(createdEmployeeData);

        // Clear form fields
        setEmployeeName('');
        setEmployeeSurname('');
        setStreet('');
        setNumber('');
        setPostcode('');
        setCity('');
		setCountry('');
        setTaxOffice('');
        setPESEL('');
      })
      .catch((error) => {
        // Handle create employee error
        console.error('Error creating employee:', error);
      });
  };

  const handleEmployeeNameChange = (event) => {
    setEmployeeName(event.target.value);
  };

  const handleEmployeeSurnameChange = (event) => {
    setEmployeeSurname(event.target.value);
  };

  const handleStreetChange = (event) => {
    setStreet(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const handlePostcodeChange = (event) => {
    setPostcode(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };
  
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleTaxOfficeChange = (event) => {
    setTaxOffice(event.target.value);
  };

  const handlePESELChange = (event) => {
    setPESEL(event.target.value);
  };

  return (
    <div>
      <h1>Employee Form</h1>
      <form onSubmit={handleCreateEmployee}>
        <label>Employee Name:</label>
        <input type="text" value={employeeName} onChange={handleEmployeeNameChange} />

        <label>Employee Surname:</label>
        <input type="text" value={employeeSurname} onChange={handleEmployeeSurnameChange} />

        <label>Street:</label>
        <input type="text" value={street} onChange={handleStreetChange} />

        <label>Number:</label>
        <input type="text" value={number} onChange={handleNumberChange} />

        <label>Postcode:</label>
        <input type="text" value={postcode} onChange={handlePostcodeChange} />

        <label>City:</label>
        <input type="text" value={city} onChange={handleCityChange} />
		
		<label>Country:</label>
        <input type="text" value={country} onChange={handleCountryChange} />

        <label>Tax Office:</label>
        <input type="text" value={taxOffice} onChange={handleTaxOfficeChange} />

        <label>Pesel:</label>
        <input type="text" value={PESEL} onChange={handlePESELChange} />

        <button type="submit">Create Employee</button>
      </form>
	  {createdEmployee && (
        <div>
          <h2>Created Employee</h2>
          <p>Name: {createdEmployee.employeeName}</p>
          <p>Surname: {createdEmployee.employeeSurname}</p>
          <p>Street: {createdEmployee.street}</p>
          <p>Number: {createdEmployee.number}</p>
          <p>Postcode: {createdEmployee.postcode}</p>
          <p>City: {createdEmployee.city}</p>
          <p>Tax Office: {createdEmployee.taxOffice}</p>
          <p>Pesel: {createdEmployee.PESEL}</p>
        </div>
		)}
    </div>
  );
}

export default EmployeeForm;
