import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import MedicalExaminationView from './MedicalExaminationView';

function EmployeeForm() {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeSurname, setEmployeeSurname] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [PESEL, setPESEL] = useState('');
  const [country, setCountry] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null); // Track the created employee
  const navigate = useNavigate();  // Import the useNavigate hook
  const [taxOfficeID, setTaxOfficeID] = useState('');
const [taxOfficeName, setTaxOfficeName] = useState('');
const [taxOffices, setTaxOffices] = useState([]);
const [taxOffice, setTaxOffice] = useState('');




  useEffect(() => {
    axios.get('http://localhost:3001/tax-offices')
        .then((response) => {
            setTaxOffices(response.data);
        })
        .catch((error) => {
            console.error('Error fetching tax offices:', error);
        });
}, []); // Empty dependency array ensures this effect runs only once

// This useEffect is for persisting created employee data
useEffect(() => {
  const savedEmployee = localStorage.getItem('createdEmployee');
  if (savedEmployee) {
    setCreatedEmployee(JSON.parse(savedEmployee));
  }
}, []); // Will also trigger only on the initial mount of the component

  const [validationError, setValidationError] = useState(null);  // Add this line

  function isValidPESEL(pesel) {
    if (pesel.length !== 11 || !/^\d{11}$/.test(pesel)) {
      return false;  // check for length and digits only
    }
  
    // Compute the checksum using weights for each digit
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;
  
    for (let i = 0; i < 10; i++) {
      sum += weights[i] * parseInt(pesel[i], 10);
    }
  
    const checksum = (10 - (sum % 10)) % 10;
  
    // The last digit should match the checksum
    return parseInt(pesel[10], 10) === checksum;
  }
  function isValidPostcode(postcode) {
    const regex = /^\d{2}-\d{3}$/;
    return regex.test(postcode);
  }
  

  const handleCreateEmployee = (event) => {
    event.preventDefault();

    if (!employeeName || !employeeSurname || !street || !number || !postcode || !city || !country || !taxOffice || !PESEL) {
      setValidationError("All fields must be entered!");  // Set the error message
      return;
    }
    if (!isValidPESEL(PESEL)) {
      setValidationError("Invalid PESEL number!");  // Set the error message
      return;
    }
    if (!isValidPostcode(postcode)) {
      setValidationError("Invalid postcode format! It should be XX-XXX.");
      return;
    }
    
    if (!taxOffice) {
      setValidationError("Please select a tax office from the dropdown!");
      return;
  }
  
   
    
  

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
        taxOfficeName,
        PESEL
      })
      .then((response) => {
        // Handle successful create employee
  console.log('Employee created:', response.data);

// Use the returned employeeId from the server response
const createdEmployeeData = {
  employeeId: response.data.employeeId,
  employeeName: response.data.employeeName,
  employeeSurname: response.data.employeeSurname,
  street,
  number,
  postcode,
  city,
  country,
  taxOffice,
  PESEL
};



const handleMedicalExamination = (employeeId) => {
  navigate(`/medical-examination/${employeeId}`, {
    state: {
      employeeData: {
        name: createdEmployee.employeeName,
        surname: createdEmployee.employeeSurname,
        pesel: createdEmployee.PESEL,
        number: createdEmployee.number
        // Add other data you want to pass here
      },
    },
  });
};



  
  // This function will redirect to the AddContractForm for the specific employee
  const handleGoToAddContract = (employeeId) => {
    navigate(`/add-contract/${employeeId}`);
  }

  // This function will redirect to the AddContractForm for the specific employee
  const goToAddParameters = (employeeId) => {
    navigate(`/employee-param/${employeeId}`);
  }

// Set the created employee data in the state
localStorage.setItem('createdEmployee', JSON.stringify(createdEmployeeData));
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
  const taxOfficeOptions = taxOffices.map(office => ({
    value: office.id,
    label: office.tax_office
}));

const handleTaxOfficeChange = (selectedOption) => {
  if (selectedOption) {
      setTaxOffice(selectedOption.value);
      
      // This sets the name as well
      setTaxOfficeName(selectedOption.label);
  } else {
      setTaxOffice('');
      setTaxOfficeName('');
  }
};
  


  const handlePESELChange = (event) => {
    setPESEL(event.target.value);
  };

  return (
    <div>
      <h1>Employee Form</h1>
      {/* Display validation error if present */}
      {validationError && <div style={{ color: 'red' }}>{validationError}</div>}
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
            <Select 
                options={taxOfficeOptions} 
                onChange={handleTaxOfficeChange}
                isSearchable={true}
                placeholder="Wybierz US"
                value={taxOfficeOptions.find(option => option.value === taxOffice)}
            />


        <label>Pesel:</label>
        <input type="text" value={PESEL} onChange={handlePESELChange} />

        <button type="submit">Create Employee</button>
      </form>
      
      {createdEmployee ? (
  <button onClick={() => navigate(`/medical-examination/${createdEmployee.employeeId}`)}>Medical</button>
) : (
  <button disabled>MedicalExam</button>
)}

      {/* Conditionally render the Add Contract button */}
    {createdEmployee ? (
      <button onClick={() => navigate(`/add-contract/${createdEmployee.employeeId}`)}>Add Contract</button>
    ) : (
      <button disabled>Add Contract</button>
    )}
     {/* Conditionally render the Add Contract button */}
     {createdEmployee ? (
      <button onClick={() => navigate(`/employee-param/${createdEmployee.employeeId}`)}>Add Params</button>
    ) : (
      <button disabled>Add Params</button>
    )}
	  {createdEmployee && (
        <div>
          <h2>Employee Created Successfully!</h2>
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
