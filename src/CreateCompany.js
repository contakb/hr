import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ToDo from './ToDo'; // Adjust the path as necessary
import './Login.css';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Adjust the path as necessary
import { useLocation } from 'react-router-dom';
// Import your custom axios instance
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary



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
    const [updateMessage, setUpdateMessage] = useState('');
  // Add a new piece of state to manage the visibility of the success message and button
const [showNextStepButton, setShowNextStepButton] = useState(false);
const { currentStep, setCurrentStep, nextStep } = useSetup(); // Use the context to control steps
const location = useLocation();
const { markStepAsCompleted } = useSetup();
const { setIsInSetupProcess } = useSetup();

// Define this outside your component if these steps are used in multiple places
const steps = [
  { name: "Create Company", path: "/create-company" },
  { name: "Add Employees", path: "/createEmployee?setup=true" },
  { name: "Add Contract to Employee", path: "/add-contract/${createdEmployee.employeeId}" }, // New step
  { name: "Add Params to Employee", path: "/employee-param/:employeeId" }, // New step
  { name: "Salary Setup", path: "/salary-selection" },
];

useEffect(() => {
  const currentPath = location.pathname;
  const stepIndex = steps.findIndex(step => step.path === currentPath);
  if (stepIndex !== -1) {
    setCurrentStep(stepIndex + 1);
  }
}, [location, setCurrentStep]);

const isSetupCompleted = () => {
  const setupCompleted = localStorage.getItem('setupCompleted');
  return setupCompleted === 'true';
};

useEffect(() => {
  // Only mark setup as started if it hasn't been completed before
  if (!isSetupCompleted()) {
    setIsInSetupProcess(true);
  }

  // Cleanup function to reset on component unmount, which might be optional 
  // based on your app's flow and whether entering another setup-related component
  // should automatically mean the setup process is ongoing.
  return () => {
    // Consider whether you need to reset this based on your app's logic
    // setIsInSetupProcess(false);
  };
}, [setIsInSetupProcess]);


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

const fetchCompanyData = async () => {
  axiosInstance.get('http://localhost:3001/api/created_company')
    .then(response => {
        const company = response.data.length > 0 ? response.data[0] : null;
        if (company && company.company_id) {
            setCompanyData(company);
            setError(''); // Clear any previous error messages
        } else {
            setCompanyData(null); // Set to null if no data is returned
        }
        setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching company data:', error);
      // Check if the error is due to no data found and set an appropriate message
      if (error.response && error.response.status === 404) {
        setError('No existing company data found. Please fill out the form to create a new company.');
      } else {
        setError('Failed to fetch company data.');
      }

      setCompanyData(null); // Set companyData to null when fetch fails
      setIsLoading(false);
    });
};

useEffect(() => {
  fetchCompanyData();
}, []);

const goToNextStep = () => {
  // Increment the current step.
  nextStep();

  // Wait for the next step update to propagate.
  setTimeout(() => {
    // Calculate the next step based on the updated currentStep.
    // Note: Ensure you have the latest currentStep value here. You might need to use a useEffect hook
    // to listen to currentStep changes if this doesn't work as expected.
    const nextStepIndex = currentStep - 1; // Adjust if your steps array is 0-indexed and currentStep is 1-indexed.
    const nextStepPath = steps[nextStepIndex]?.path;

    if (nextStepPath) {
      navigate(nextStepPath);
    }
  }, 100); // A slight delay to ensure the state update has been processed.
};










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

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    console.log('CreatedCompany Data:', companyData); // Debugging

    // Perform validation checks
  if (!CompanyName || !street || !number || !postcode || !city || !country || !taxOffice || !Taxid) {
    setValidationError("All fields must be entered!");
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
  if (formData.formaPrawna === 'osoba_fizyczna' && (!formData.PESEL || !isValidPESEL(formData.PESEL))) {
    setValidationError("Invalid or missing PESEL number for Osoba Fizyczna!");
    return;
  }

  // Clear validation error if all checks pass
  setValidationError(null);
  
    if (isEditMode && companyData && companyData.company_id) {
      // When in edit mode and company data is available
      handleUpdateCompany(event, companyData.company_id);
    } else if (!isEditMode) {
      // Call handleCreateCompany and chain with then/catch for async handling
      handleCreateCompany()
        .then((response) => {
          console.log('Company created:', response.data);
          setUpdateMessage('Company created successfully. You can now move to the next step.');
  setShowNextStepButton(true); // Show the button to move to the next step
  nextStep(); // Move to the next step
  
          // Optional: Handle post-creation logic here if needed
        })
        .catch((error) => {
          console.error('Error creating company:', error);
          // Handle errors, such as showing an error message
        });
    } else {
      console.error('No valid company data for update.');
    }
};

const handleCreateCompany = async () => {
  try {
    const response = await axiosInstance.post('http://localhost:3001/create-company', {
      CompanyName,
      street,
      number,
      postcode,
      city,
      country,
      taxOfficeName: taxOffice, // Assuming taxOffice is correctly defined in your component's state
      PESEL: formData.formaPrawna === 'osoba_fizyczna' ? formData.PESEL : null,
      Taxid,
      Bankaccount,
      formaPrawna: formData.formaPrawna,
      wypadkowe: wypadkoweRate
    });

    console.log('Company created:', response.data);
    // Assuming response.data contains the flag 'success'
    if (response.data.success) {
      setUpdateMessage('Company created successfully. You can now move to the next step.');
      setShowNextStepButton(true);
      nextStep(); // Assuming this is a function to move to the next setup step
      // Optionally, clear form fields or perform additional state updates here
    } else {
      // Handle any server-specified errors (e.g., validation errors returned from your API)
      setUpdateMessage('Failed to create company. Please check your input.');
    }
  } catch (error) {
    console.error('Error creating company:', error);
    setUpdateMessage(error.response?.data?.error || 'An unexpected error occurred while creating the company.');
  }
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
  
    if (formData.formaPrawna === 'osoba_fizyczna' && (!formData.PESEL || !isValidPESEL(formData.PESEL))) {
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
      PESEL: formData.formaPrawna === 'osoba_fizyczna' ? formData.PESEL : null,
      Taxid,
      Bankaccount,
      formaPrawna: formData.formaPrawna,
      wypadkowe: wypadkoweRate,
      
    };

    console.log('Updating company data:', companyData);
  
    axiosInstance.put(`http://localhost:3001/update-company/${companyId}`, companyData)
        .then(response => {
            console.log('Company updated successfully:', response.data);
            setUpdateMessage('Company updated successfully.');
        fetchCompanyData(); // Fetch the latest company data
        setIsEditMode(false); // Switch back to view mode
        setTimeout(() => setUpdateMessage(''), 3000); // Clear message after 3 seconds
        })
        .catch(error => {
            console.error('Error updating company:', error);
            setValidationError('Failed to update company data.');
        });
  };
  
  

  return (
    <div className="setupProcess bg-gray-50 min-h-screen flex flex-col items-center justify-start pt-10">
  <StepIndicator steps={steps} currentStep={currentStep} />

  <div className="companyTodoContainer max-w-4xl w-full">
    <div className="companyDetails bg-white shadow-md rounded px-6 py-8 mt-5">
      <h1 className="text-2xl font-semibold mb-4">Dane Twojej firmy:</h1>
      {validationError && <div style={{ color: 'red' }}>{validationError}</div>}
      {updateMessage && <div style={{ color: 'green' }}>{updateMessage}</div>}
      {isLoading ? (
          <p>Loading...</p>
      ) : error ? (
        <div>
          <p>{error}</p>
          {/* Call renderForm function to display the form for creating a new company */}
          {renderForm()}
        </div>
      ) : companyData && !isEditMode ? (
          <div>
                    <p>Company Name: {companyData.company_name}</p>
        <p>street: {companyData.street}</p>
        <p>number: {companyData.number}</p>
        <p>kod pocztowy: {companyData.post_code}</p>
        <p>city: {companyData.city}</p>
        <p>country: {companyData.country}</p>
        <p>Tax ID: {companyData.taxid}</p>
        {companyData.forma === 'osoba_fizyczna' && (
        <p>PESEL: {companyData.pesel}</p>
      )}
        <p>Tax Office: {companyData.tax_office}</p>
        <p>ID: {companyData.company_id}</p>
        <p>ubezpieczenie wypadkowe: {companyData.wypadkowe}</p>
        <p>rachunek bankowy: {companyData.bank_account}</p>
        <p>forma działalności: {companyData.forma}</p>

        <button onClick={() => toggleEditMode(true)}>Edit Company</button>
          </div>
      ) : (
        renderForm()
        )}
        {/* Move the conditional rendering here, outside the renderForm function */}
        {showNextStepButton && (
          <div>
            <p>{updateMessage}</p>
            <button onClick={goToNextStep}>Go to Next Step</button>
          </div>
        )}
      </div>
    {/* Conditionally render ToDo component if companyData exists */}
    {companyData && (
      <div className="todoList">
        <ToDo />
      </div>
    )}
  </div>
  </div>
);
  function renderForm() {
    return (
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


      </form>
    );
}

}
export default CreateCompany;
