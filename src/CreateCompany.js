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
import { supabase } from './supabaseClient';
import { useUser } from './UserContext'; // Ensure correct pat



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
const { user, updateUserContext } = useUser();
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
        setError('Nie odnaleziono danych firmy. Proszę uzupełnić poniższe dane.');
      } else {
        setError('Failed to fetch company data.');
      }

      setCompanyData(null); // Set companyData to null when fetch fails
      setIsLoading(false);
    });
};


useEffect(() => {
  // Only fetch user details if the user object is available
  if (!user) {
    navigate('/login');
    
  } else {
    // If no user is present, navigate to login
    fetchCompanyData();
  }
}, [user, navigate]);// Added fetchUserDetails as a dependency


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

  const handleSubmit = (event) => {
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
    // Return the axios call directly as it returns a Promise
   await axiosInstance.post('http://localhost:3001/create-company', {
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
        wypadkowe: wypadkoweRate // Include the wypadkowe rate here
      })
      .then((response) => {
        if (response && response.data) {
        // Handle successful create employee
  console.log('Company created:', response.data);
  // Set success message
  setUpdateMessage('Company created successfully.');
  setUpdateMessage('Company created successfully. You can now move to the next step.');
  setShowNextStepButton(true); // Show the button to move to the next step
  // Mark the step as completed in the context
  markStepAsCompleted(1); // Assuming step 1 is for creating a company
  nextStep(); // Move to the next step
  console.log("Moving to the next step");
  
    // Navigate to the next page, for example, add employees
    
  // Fetch the latest company data
  fetchCompanyData(); 
  // Clear form fields
  setCompanyName('');
  setStreet('');
  setNumber('');
  setPostcode('');
  setCity('');
setCountry('');
  setTaxOffice('');
  setPESEL('');

  // Switch back to view mode after a delay
  setTimeout(() => {
    setIsEditMode(false);
    setUpdateMessage('');
}, 3000);

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

// Set the created employee data in the state
localStorage.setItem('createdCompany', JSON.stringify(createdCompanyData));
setCreatedCompany(createdCompanyData);


        
}
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



const handleUpdateCompany = async (event, companyId) => {
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
  
    await axiosInstance.put(`http://localhost:3001/update-company/${companyId}`, companyData)
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
      {validationError && <div className="text-red-500">{validationError}</div>}
      {updateMessage && <div className="text-green-500">{updateMessage}</div>}
      {isLoading ? (
          <p>Loading...</p>
      ) : error ? (
        <div>
          <p className="text-red-500">{error}</p>
          {/* Call renderForm function to display the form for creating a new company */}
          {renderForm()}
        </div>
      ) : companyData && !isEditMode ? (
          <div>
                     <p>Company Name: <span className="font-medium">{companyData.company_name}</span></p>
        <p>street: <span className="font-medium">{companyData.street}</span></p>
        <p>number: <span className="font-medium">{companyData.number}</span></p>
        <p>kod pocztowy: <span className="font-medium">{companyData.post_code}</span></p>
        <p>city: <span className="font-medium">{companyData.city}</span></p>
        <p>country: <span className="font-medium">{companyData.country}</span></p>
        <p>Tax ID: <span className="font-medium">{companyData.taxid}</span></p>
        {companyData.forma === 'osoba_fizyczna' && (
        <p>PESEL: <span className="font-medium">{companyData.pesel}</span></p>
      )}
        <p>Tax Office: <span className="font-medium">{companyData.tax_office}</span></p>
        <p>ID: <span className="font-medium">{companyData.company_id}</span></p>
        <p>ubezpieczenie wypadkowe: <span className="font-medium">{companyData.wypadkowe}</span></p>
        <p>rachunek bankowy: <span className="font-medium">{companyData.bank_account}</span></p>
        <p>forma działalności: <span className="font-medium">{companyData.forma}</span></p>

        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => toggleEditMode(true)}>Edit Company</button>
          </div>
      ) : (
        renderForm()
        )}
        {/* Move the conditional rendering here, outside the renderForm function */}
      {showNextStepButton && (
        <div className="mt-4">
          <p>{updateMessage}</p>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={goToNextStep}>Go to Next Step</button>
        </div>
      )}
    </div>
    {/* Conditionally render ToDo component if companyData exists */}
    {companyData && (
      <div className="todoList mt-5">
        <ToDo />
      </div>
    )}
  </div>
</div>
);
  function renderForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
         {/* Your form fields go here */}
         <div className="flex flex-col">
        <label className="font-semibold" htmlFor="companyName">Company Name:</label>
        <input className="border border-gray-300 rounded p-2" id="companyName" type="text" value={CompanyName} onChange={handleCompanyNameChange} />
        </div>
        <label className="font-semibold" htmlFor="Taxid">Tax id:</label>
         <input className="border border-gray-300 rounded p-2" id="Taxid" type="text" value={Taxid} onChange={handleTaxidChange} />
         <div className="flex flex-col mb-4">
  <label className="mb-2 font-semibold" htmlFor="formaPrawna">Forma Prawna:</label>
  <select
    id="formaPrawna"
    name="formaPrawna"
    value={formData.formaPrawna}
    onChange={handleChange}  // Assuming handleChange handles form updates
    className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
  >
    <option value="osoba_prawna">Osoba Prawna</option>
    <option value="osoba_fizyczna">Osoba Fizyczna</option>
  </select>
</div>

  
{formData.formaPrawna === 'osoba_fizyczna' && (
  <div className="flex flex-col mb-4">
    <label className="mb-2 font-semibold" htmlFor="PESEL">PESEL Number:</label>
    <input
      id="PESEL"
      type="text"
      name="PESEL"
      value={formData.PESEL}
      onChange={handleChange}  // Again, ensure handleChange is set up to handle this input
      className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    />
  </div>
)}

  
         {/* Street */}
  <div className="flex flex-col">
    <label htmlFor="street" className="font-semibold">Street:</label>
    <input id="street" type="text" value={street} onChange={handleStreetChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>

  {/* Number */}
  <div className="flex flex-col">
    <label htmlFor="number" className="font-semibold">Number:</label>
    <input id="number" type="text" value={number} onChange={handleNumberChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>

  {/* Postcode */}
  <div className="flex flex-col">
    <label htmlFor="postcode" className="font-semibold">Postcode:</label>
    <input id="postcode" type="text" value={postcode} onChange={handlePostcodeChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>

  {/* City */}
  <div className="flex flex-col">
    <label htmlFor="city" className="font-semibold">City:</label>
    <input id="city" type="text" value={city} onChange={handleCityChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>

  {/* Country */}
  <div className="flex flex-col">
    <label htmlFor="country" className="font-semibold">Country:</label>
    <input id="country" type="text" value={country} onChange={handleCountryChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>

  {/* Bank Account */}
  <div className="flex flex-col">
    <label htmlFor="bankAccount" className="font-semibold">Bank account:</label>
    <input id="bankAccount" type="text" value={Bankaccount} onChange={handleBankaccountChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
  </div>
  
        {/* Tax Office - Assuming 'Select' is a component from a library like 'react-select' */}
  <div className="flex flex-col">
    <label htmlFor="taxOffice" className="font-semibold">Tax Office:</label>
    <Select
      id="taxOffice"
      options={taxOfficeOptions}
      onChange={handleTaxOfficeChange}
      isSearchable={true}
      placeholder="Wybierz US"
      value={taxOfficeOptions.find(option => option.value === taxOffice)}
      classNamePrefix="react-select" // You might need to adjust this based on your Select component's props
    />
  </div>
  
  <div className="flex flex-col">
        <p><label htmlFor="numberOfEmployees" className="font-semibold">Number of Employees:</label>
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
  </div>
  <div>
  <div className="flex flex-col">
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
  </div>
  <div className="flex space-x-2 mt-4">
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {isEditMode ? 'Update Company' : 'Create Company'}
    </button>
    <button onClick={() => toggleEditMode(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
      Cancel
    </button>
    <button onClick={handleClearData} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      Clear Data
    </button>
  </div>

        </div>
      </form>
    );
}

}
export default CreateCompany;
