import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function CreateCompany() {
    const initialFormData = {
        companyName: '',
        formaPrawna: 'osoba_prawna',
        taxId: '',
        PESEL: '',
        address: '',
        taxOffice: '',
        bankAccount: '',
        ubezpieczenieWypadkowe: '',
      };
  const [CompanyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [companyId, setcompanyId] = useState('');
  const [Taxid, setTaxid] = useState('');
  const [PESEL, setPESEL] = useState('');
  const [country, setCountry] = useState('');
  const [Bankaccount, setBankaccount] = useState('');
  const [createdCompany, setCreatedCompany] = useState(null); // Track the created company
  const navigate = useNavigate();  // Import the useNavigate hook
  const [taxOfficeID, setTaxOfficeID] = useState('');
const [taxOfficeName, setTaxOfficeName] = useState('');
const [taxOffices, setTaxOffices] = useState([]);
const [taxOffice, setTaxOffice] = useState('');
const [formData, setFormData] = useState(initialFormData);
const [formaPrawna, setformaPrawna] = useState('');
const [numberOfEmployees, setNumberOfEmployees] = useState('');
const [wypadkoweRate, setWypadkoweRate] = useState('1.67%');
const [companyData, setCompanyData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);







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
  const savedCompany = localStorage.getItem('createdCompany');
  if (savedCompany) {
    setCreatedCompany(JSON.parse(savedCompany));
    localStorage.removeItem('createdCompany'); // Clear after loading
  }
}, []); // Will also trigger only on the initial mount of the component

useEffect(() => {
  axios.get('http://localhost:3001/api/created_company')
    .then(response => {
      console.log("Fetched company data:", response.data);
      setCompanyData(response.data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching company data:', error);
      setError('Failed to fetch company data.');
      setCompanyData(null); // Set companyData to null when fetch fails
      setIsLoading(false);
    });
}, []);




    const [validationError, setValidationError] = useState(null);  // Add this line

  const handleClearData = () => {
    localStorage.removeItem('createdCompany');
    setCreatedCompany(null);
    // Clear form fields
  setCompanyName('');
  setStreet('');
  setNumber('');
  setPostcode('');
  setCity('');
  setCountry('');
  setTaxOffice('');
  setPESEL('');
  setTaxid('');
  setBankaccount('');
  // Reset any other form-related states, if necessary
  };

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
  const handleSubmit = (event) => {
    event.preventDefault();
  
    console.log('CreatedCompany Data:', companyData); // Debugging
  
    if (isEditMode && companyData && companyData.company_id) {
      // When in edit mode and company data is available
      handleUpdateCompany(event, companyData.company_id);
  } else if (!isEditMode) {
      // When creating a new company
      handleCreateCompany(event);
  } else {
      console.error('No valid company data for update.');
  }
};

  const handleCreateCompany = (event) => {
    event.preventDefault();

    if (!CompanyName || !street || !number || !postcode || !city || !country || !taxOffice || !Taxid) {
      setValidationError("All fields must be entered!");  // Set the error message
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
    // Conditional PESEL validation only for 'osobaFizyczna'
  if (formData.formaPrawna === 'osoba_fizyczna') {
    if (!PESEL || !isValidPESEL(PESEL)) {
      setValidationError("Invalid or missing PESEL number for Osoba Fizyczna!");
      return;
  }

  // Clear validation error if all checks pass
  setValidationError(null);

  // Proceed with further processing (e.g., API call to save data)
  // ...
};
  
   
    
  

    // Perform create employee request to the server
    axios
      .post('http://localhost:3001/create-company', {
        CompanyName,
        street,
        number,
        postcode,
        city,
		country,
        taxOfficeName,
        PESEL: formData.PESEL,
        Taxid,
        Bankaccount,
        formaPrawna: formData.formaPrawna,
        wypadkowe: wypadkoweRate // Include the wypadkowe rate here
      })
      .then((response) => {
        // Handle successful create employee
  console.log('Company created:', response.data);

// Use the returned employeeId from the server response
const createdCompanyData = {
  companyId: response.data.company_id,
  CompanyName: response.data.CompanyName,
  street,
  number,
  postcode,
  city,
  country,
  taxOffice,
  PESEL,
  Taxid,
  Bankaccount,
  formaPrawna
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
localStorage.setItem('createdCompany', JSON.stringify(createdCompanyData));
setCreatedCompany(createdCompanyData);


        // Clear form fields
        setCompanyName('');
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
        console.error('Error creating company:', error);
      });
  };

  const handleCompanyNameChange = (event) => {
    setCompanyName(event.target.value);
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

  const handleTaxidChange = (event) => {
    setTaxid(event.target.value);
  };

  const handlePESELChange = (event) => {
    setPESEL(event.target.value);
  };

  const handleBankaccountChange = (event) => {
    setBankaccount(event.target.value);
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
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
  
const toggleEditMode = (editMode) => {
  if (editMode && companyData) {
      // Populate form fields with existing company data
      setCompanyName(companyData.company_name || '');
      setStreet(companyData.street || '');
      setNumber(companyData.number || '');
      setPostcode(companyData.post_code || '');
      setCity(companyData.city || '');
      setCountry(companyData.country || '');
      // Find the option that matches the taxOffice ID from companyData
      const selectedTaxOfficeOption = taxOfficeOptions.find(option => option.label === companyData.tax_office);
        if (selectedTaxOfficeOption) {
            setTaxOffice(selectedTaxOfficeOption.value); // Set the tax office ID
            setTaxOfficeName(selectedTaxOfficeOption.label); // Update the tax office name
        } else {
            // Reset or set default values if no matching tax office is found
            setTaxOffice('');
            setTaxOfficeName('');
        }
      // ... and so on for other fields
      if (companyData.forma_prawna === 'osoba_fizyczna') {
        setPESEL(companyData.pesel || '');
      }
      setTaxid(companyData.taxid || '');
      setPESEL(companyData.pesel || ''); // Make sure the key names match your data structure
      setBankaccount(companyData.bank_account || '');
      setNumberOfEmployees(companyData.numberOfEmployees || '');
      setWypadkoweRate(companyData.wypadkowe || '1.67%');
      setFormData({ ...formData, formaPrawna: companyData.forma_prawna || 'osoba_prawna' });
  }
  setIsEditMode(editMode); // Update the state to enter/exit edit mode
};



const handleUpdateCompany = (event, companyId) => {
    event.preventDefault();

  
    // Validation code
    if (!CompanyName || !street || !number || !postcode || !city || !country || !Taxid || !taxOfficeName) {
      setValidationError("All fields must be entered!");
      return;
    }
  
    if (!isValidPostcode(postcode)) {
      setValidationError("Invalid postcode format! It should be XX-XXX.");
      return;
    }
  
    if (formData.formaPrawna === 'osoba_fizyczna' && (!PESEL || !isValidPESEL(PESEL))) {
      setValidationError("Invalid or missing PESEL number for Osoba Fizyczna!");
      return;
    }
  
    // Clear validation error if all checks pass
    setValidationError(null);
  
    const companyData = {
      CompanyName,
      street,
      number,
      postcode,
      city,
      country,
      taxOfficeName,
      PESEL: formData.formaPrawna === 'osoba_fizyczna' ? PESEL : null,
      Taxid,
      Bankaccount,
      formaPrawna: formData.formaPrawna,
      wypadkowe: wypadkoweRate,
      
    };
  
    axios.put(`http://localhost:3001/update-company/${companyId}`, companyData)
        .then(response => {
            console.log('Company updated successfully:', response.data);
            // Update UI or navigate to another page as needed
        })
        .catch(error => {
            console.error('Error updating company:', error);
            setValidationError('Failed to update company data.');
        });
  };
  
  

  return (
      <div>
            <h1>Company Form</h1>
            {validationError && <div style={{ color: 'red' }}>{validationError}</div>}
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : companyData && !isEditMode ? (
                <div>
                    <h2>Company Information</h2>
                    <p>Company Name: {companyData.company_name}</p>
        <p>street: {companyData.street}</p>
        <p>number: {companyData.number}</p>
        <p>city: {companyData.city}</p>
        <p>country: {companyData.country}</p>
        <p>Tax ID: {companyData.taxid}</p>
        <p>Tax Office: {companyData.tax_office}</p>
        <p>ID: {companyData.company_id}</p>

        <button onClick={() => toggleEditMode(true)}>Edit Company</button>
                </div>
            ) : (
              <form onSubmit={handleSubmit}>
                    {/* Your form fields go here */}
        <label>Tax id:</label>
        <input type="text" value={Taxid} onChange={handleTaxidChange} />

        <label>Company Name:</label>
        <input type="text" value={CompanyName} onChange={handleCompanyNameChange} />

        <label>
      Forma Prawna:
      <select
        name="formaPrawna"
        value={formData.formaPrawna}
        onChange={handleChange}  // Use the same handleChange for consistency
      >
        <option value="osoba_prawna">Osoba Prawna</option>
        <option value="osoba_fizyczna">Osoba Fizyczna</option>
      </select>
    </label>

    {formData.formaPrawna === 'osoba_fizyczna' && (
      <label>
        PESEL Number:
        <input
          type="text"
          name="PESEL"
          value={formData.PESEL}
          onChange={handleChange}  // Consistent use of handleChange
        />
      </label>
          )}

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

        <label>Bank account:</label>
        <input type="text" value={Bankaccount} onChange={handleBankaccountChange} />

        <label>Tax Office:</label>
            <Select 
                options={taxOfficeOptions} 
                onChange={handleTaxOfficeChange}
                isSearchable={true}
                placeholder="Wybierz US"
                value={taxOfficeOptions.find(option => option.value === taxOffice)}
            />

        
        <p><label htmlFor="numberOfEmployees">Number of Employees:</label>
        <input 
  type="number" 
  id="numberOfEmployees" 
  placeholder="Uzupełnij wartość jeśli masz powyżej 10 pracowników"
  value={numberOfEmployees} 
  onChange={(e) => {
    setNumberOfEmployees(e.target.value);
    if (e.target.value <= 10) {
      setWypadkoweRate('1.67%'); // Automatically set the rate for 10 or fewer employees
    } else {
      setWypadkoweRate(''); // Reset the rate for more than 10 employees
    }
  }} 
/></p>
<div>
  <label htmlFor="ubezpieczenieWypadkowe">Ubezpieczenie Wypadkowe Rate:</label>
  {numberOfEmployees > 10 ? (
    <input 
      type="text" 
      id="ubezpieczenieWypadkowe" 
      placeholder="Enter rate from ZUS" 
      value={wypadkoweRate}
      onChange={(e) => setWypadkoweRate(e.target.value)} // Update state when user inputs a value
    />
  ) : (
    <p>{wypadkoweRate} (for companies with 10 or fewer employees)</p>
  )}
  <p className="note">
    Note: If your company has more than 10 employees, please enter the rate provided by ZUS.
  </p>
</div>
<button type="submit">{isEditMode ? 'Update Company' : 'Create Company'}</button>
   <button onClick={() => toggleEditMode(false)}>Cancel</button>
   <button onClick={handleClearData}>Clear Data</button>
      </form>)}


     

	    {createdCompany && (
        <div>
          <h2>Company Created Successfully!</h2>
          <p>Company Name: {createdCompany.CompanyName}</p>
          <p>Street: {createdCompany.street}</p>
          <p>Number: {createdCompany.number}</p>
          <p>Postcode: {createdCompany.postcode}</p>
          <p>City: {createdCompany.city}</p>
          <p>Tax Office: {createdCompany.taxOffice}</p>
          <p>Pesel - dla osoby fizycznej: {createdCompany.PESEL}</p>
          <p>Tax id: {createdCompany.Taxid}</p>
          <p>Bank account: {createdCompany.Bankaccount}</p>
          <p>Forma prawna: {createdCompany.formaPrawna}</p>
          <p>Stawka ub. wypadkowe: {createdCompany.wypadkoweRate}</p>
          <p>Stawka ub. wypadkowe: {createdCompany.company_id}</p>
        </div>
		)}
        
    </div>
  );
}

export default CreateCompany;
