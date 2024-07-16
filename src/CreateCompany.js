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


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faAddressCard, faUserShield, faCog, faMoneyCheckAlt, faCalendarAlt, faClock, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

// Import MUI components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


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
        representativeName: '', // Add this line
        okresRozliczeniowy: '',
        poraNocna: '',
        wynagrodzenieInfo: '',
        wynagrodzenieOption: '',
        regon: ''
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
  const [representativeName, setRepresentativeName] = useState(''); // Add this line
  const [okresRozliczeniowy, setOkresRozliczeniowy] = useState(''); // Add this line
const [poraNocna, setPoraNocna] = useState(''); // Add this line
const [wynagrodzenieInfo, setWynagrodzenieInfo] = useState(''); // Add this line
const [regon, setRegon] = useState(''); // Add this line
const [wynagrodzenieOption, setWynagrodzenieOption] = useState('');
  const [createdCompany, setCreatedCompany] = useState(null); // Track the created company
  const navigate = useNavigate();  // Import the useNavigate hook
  const [taxOfficeID, setTaxOfficeID] = useState('');
const [taxOfficeName, setTaxOfficeName] = useState('');
const [taxOffices, setTaxOffices] = useState([]);
const [taxOffice, setTaxOffice] = useState('');
const [formData, setFormData] = useState('');
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
  

  axiosInstance.get('http://localhost:3001/api/created_company', {
    headers: {
      Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
      'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
    }
  })
  .then(response => {
    const company = response.data.length > 0 ? response.data[0] : null;
    if (company && company.company_id) {
      setCompanyData(company);
      setError(''); // Clear any previous error messages
    } else {
      setCompanyData(null); // Set to null if no data is returned
      setError('Nie odnaleziono danych firmy. Proszę uzupełnić poniższe dane.'); // No company data found message
      setIsEditMode(false)
    }
    setIsLoading(false);
  })
  .catch(error => {
    console.error('Error fetching company data:', error);
    if (error.response && error.response.status === 404) {
      setError('Nie odnaleziono danych firmy. Proszę uzupełnić poniższe dane.');
      setIsEditMode(false)
    } else {
      setError('Failed to fetch company data.');
    }
    setCompanyData(null); // Set companyData to null when fetch fails
    setIsLoading(false);
  });
};

useEffect(() => {
  if (user) {
    fetchCompanyData();
  } else {
    navigate('/LoginUser');
  }
}, [user, navigate]); // useEffect will trigger when user or navigate changes


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
  setRepresentativeName(''); // Add this line
  setPoraNocna('22 - 8'); // Add this line
  setWynagrodzenieInfo(''); // Add this line
  setWynagrodzenieOption(''); // Add this line
  setRegon(''); // Add this line
  setCreatedCompany(null); // Track the created company
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
  if (!CompanyName || !street || !number || !postcode || !city || !country || !taxOffice || !Taxid || !representativeName || !poraNocna || !wynagrodzenieInfo  || !okresRozliczeniowy || !regon) {
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
    // Define the company data
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
      representativeName, // Add this line
      okresRozliczeniowy,
      poraNocna,
      wynagrodzenieInfo,
      wynagrodzenieOption,
      regon
  };

  // Make the API call
  await axiosInstance.post('http://localhost:3001/create-company', companyData, {
      headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token from the user object
          'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
      }
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
  setRepresentativeName(''); // Add this line
  setOkresRozliczeniowy('1 miesiąc');
  setPoraNocna('22 - 8');
  setWynagrodzenieInfo('');
  setWynagrodzenieOption('');
  setRegon('');

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
  formaPrawna,
  representativeName, // Add this line
  okresRozliczeniowy,
  poraNocna,
  wynagrodzenieInfo,
  wynagrodzenieOption,
  regon
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

  const handleRepresentativeNameChange = (event) => {
    setRepresentativeName(event.target.value);
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
      setRepresentativeName(companyData.representative_name || '');
      setOkresRozliczeniowy(companyData.okres_rozliczeniowy || '1 miesiąc');
      setPoraNocna(companyData.pora_nocna || '22 - 8');
      setWynagrodzenieInfo(companyData.wynagrodzenie_info || '');
      setWynagrodzenieOption(companyData.wynagrodzenieoption || '');
      setRegon(companyData.regon || '');
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
    if (!CompanyName || !street || !number || !postcode || !city || !country || !Taxid || !taxOfficeName || !representativeName || !regon) {
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
      representativeName, // Add this line
      okresRozliczeniowy,
      poraNocna,
      wynagrodzenieInfo,
      wynagrodzenieOption,
      regon
      
    };

    console.log('Updating company data:', companyData);
  
    try {
      const response = await axiosInstance.put(`http://localhost:3001/update-company/${companyId}`, companyData, {
          headers: {
              'Authorization': `Bearer ${user.access_token}`, // Assuming 'user.access_token' is valid
              'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
          }
      });
      
      console.log('Company updated successfully:', response.data);
      setUpdateMessage('Company updated successfully.');
      fetchCompanyData(); // Fetch the latest company data
      setIsEditMode(false); // Switch back to view mode
      setTimeout(() => setUpdateMessage(''), 3000); // Clear message after 3 seconds
  } catch (error) {
      console.error('Error updating company:', error);
      setValidationError('Failed to update company data.');
  }
};
  
  

return (
  <div className="setupProcess bg-gray-50 min-h-screen flex flex-col items-center justify-start pt-10">
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div className="companyTodoContainer max-w-4xl w-full flex flex-col lg:flex-row gap-8">
          <div className="companyDetails bg-white shadow-md rounded px-6 py-8 flex-1">
              <h1 className="text-2xl font-semibold mb-4">Dane Twojej firmy:</h1>
              {validationError && <div className="text-red-500">{validationError}</div>}
              {updateMessage && <div className="text-green-500">{updateMessage}</div>}
              {isLoading ? (
                  <p>Loading...</p>
              ) : error ? (
                  <div><p className="text-red-500">{error}</p>{renderForm()}</div>
              ) : companyData && !isEditMode ? (
                  <>
                      {/* Company Name and Address */}
                      <div className="mb-4">
                          <div className="flex items-center">
                              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                              <label className="block text-gray-700 text-sm font-bold">Nazwa firmy:</label>
                          </div>
                          <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.company_name}</p>
                          <div className="flex items-center">
                              <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                              <label className="block text-gray-700 text-sm font-bold">Osoba reprezentująca:</label>
                          </div>
                          <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.representative_name}</p>
                          <div className="flex items-center mt-2">
                              <FontAwesomeIcon icon={faAddressCard} className="mr-2" />
                              <label className="block text-gray-700 text-sm font-bold">Adres:</label>
                          </div>
                          <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.street} {companyData.number}, {companyData.post_code} {companyData.city}, {companyData.country}</p>
                      </div>

                      {/* Accordion for Bank Account */}
                      <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography><FontAwesomeIcon icon={faMoneyCheckAlt} className="mr-2" /> Bank Account</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Rachunek bankowy:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.bank_account}</p>
                              </div>
                          </AccordionDetails>
                      </Accordion>

                      {/* Accordion for Salary */}
                      <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography><FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" /> Wynagrodzenie</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Wynagrodzenie:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.wynagrodzenie_info}</p>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Okres rozliczeniowy:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.okres_rozliczeniowy}</p>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Pora nocna:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.pora_nocna}</p>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Wypłata wynagrodzenias:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.wynagrodzenieoption}</p>
                              </div>
                          </AccordionDetails>
                      </Accordion>

                      {/* Accordion for IDs and Tax Office */}
                      <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography><FontAwesomeIcon icon={faCog} className="mr-2" /> NIP I US</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Tax ID:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.taxid}</p>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Regon:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.regon}</p>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Tax Office:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.tax_office}</p>
                              </div>
                          </AccordionDetails>
                      </Accordion>

                      {/* Accordion for Insurance */}
                      <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography><FontAwesomeIcon icon={faClock} className="mr-2" /> Ubezpieczenia</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                              <div className="mb-4">
                                  <label className="block text-gray-700 text-sm font-bold">Ubezpieczenie wypadkowe:</label>
                                  <p className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight">{companyData.wypadkowe}</p>
                              </div>
                          </AccordionDetails>
                      </Accordion>

                      <div className="col-span-1 md:col-span-2 mt-4">
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => toggleEditMode(true)}>Edytuj dane firmy</button>
                      </div>
                  </>
              ) : (
                  renderForm()
              )}
              {showNextStepButton && (
                  <div className="mt-4">
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={goToNextStep}>Go to Next Step</button>
                  </div>
              )}
          </div>

          {companyData && (
              <div className="todoList bg-white shadow-md rounded px-6 py-8 flex-1">
                  <ToDo />
              </div>
          )}
      </div>
  </div>
);

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({
      ...formData,
      [name]: value,
  });
};

function renderForm() {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col">
          <label className="font-semibold" htmlFor="companyName">Nazwa firmy:</label>
          <input className="border border-gray-300 rounded p-2" id="companyName" type="text" value={CompanyName} onChange={handleCompanyNameChange} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="representativeName" className="font-semibold">Osoba reprezentująca firmę:</label>
          <input id="representativeName" type="text" value={representativeName} onChange={handleRepresentativeNameChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold" htmlFor="Taxid">Tax id:</label>
          <input className="border border-gray-300 rounded p-2" id="Taxid" type="text" value={Taxid} onChange={handleTaxidChange} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="wynagrodzenieInfo" className="font-semibold">regon:</label>
          <textarea id="regon" name="regon" className="form-textarea block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none" value={regon} onChange={(e) => setRegon(e.target.value)} placeholder="Wprowadź regon" />
          
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-2 font-semibold" htmlFor="formaPrawna">Forma Prawna:</label>
          <select id="formaPrawna" name="formaPrawna" value={formData.formaPrawna} onChange={handleChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          <option value="" disabled hidden>wybierz formę</option>
            <option value="osoba_prawna">Osoba Prawna</option>
            <option value="osoba_fizyczna">Osoba Fizyczna</option>
          </select>
        </div>

        {formData.formaPrawna === 'osoba_fizyczna' && (
          <div className="flex flex-col mb-4">
            <label className="mb-2 font-semibold" htmlFor="PESEL">PESEL Number:</label>
            <input id="PESEL" type="text" name="PESEL" value={formData.PESEL} onChange={handleChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="street" className="font-semibold">Street:</label>
          <input id="street" type="text" value={street} onChange={handleStreetChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="number" className="font-semibold">Number:</label>
          <input id="number" type="text" value={number} onChange={handleNumberChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="postcode" className="font-semibold">Postcode:</label>
          <input id="postcode" type="text" value={postcode} onChange={handlePostcodeChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="city" className="font-semibold">City:</label>
          <input id="city" type="text" value={city} onChange={handleCityChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="country" className="font-semibold">Country:</label>
          <input id="country" type="text" value={country} onChange={handleCountryChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="bankAccount" className="font-semibold">Bank account:</label>
          <input id="bankAccount" type="text" value={Bankaccount} onChange={handleBankaccountChange} className="border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="taxOffice" className="font-semibold">Tax Office:</label>
          <Select id="taxOffice" options={taxOfficeOptions} onChange={handleTaxOfficeChange} isSearchable={true} placeholder="Wybierz US" value={taxOfficeOptions.find(option => option.value === taxOffice)} classNamePrefix="react-select" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="okresRozliczeniowy" className="font-semibold">Okres rozliczeniowy:</label>
          <select id="okresRozliczeniowy" name="okresRozliczeniowy" className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none" value={okresRozliczeniowy} onChange={(e) => setOkresRozliczeniowy(e.target.value) }>
          <option value="" disabled hidden>wybierz okres</option>
            <option value="1 miesiąc">1 miesiąc</option>
            <option value="2 miesiące">2 miesiące</option>
            <option value="3 miesiące">3 miesiące</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="poraNocna" className="font-semibold">Pora nocna:</label>
          <select id="poraNocna" name="poraNocna" className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none" value={poraNocna} onChange={(e) => setPoraNocna(e.target.value)}>
          <option value="" disabled hidden>wybierz godziny</option>
            <option value="22 - 8">22 - 8</option>
            <option value="23 - 7">23 - 7</option>
            <option value="24 - 6">24 - 6</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="wynagrodzenieOption" className="font-semibold">Termin wypłaty:</label>
          <select id="wynagrodzenieOption" name="wynagrodzenieOption" className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none" value={wynagrodzenieInfo} onChange={(e) => setWynagrodzenieInfo(e.target.value)}>
          <option value="" disabled hidden>wybierz termin</option>
            <option value="z dołu ostatniego dnia miesiąca kalendarzowego">z dołu ostatniego dnia miesiąca kalendarzowego</option>
            <option value="do 5 dnia następnego miesiąca kalendarzowego">do 5 dnia następnego miesiąca kalendarzowego</option>
            <option value="do 10 dnia następnego miesiąca kalendarzowego">do 10 dnia następnego miesiąca kalendarzowego</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="wynagrodzenieOption" className="font-semibold">Wynagrodzenie wypłacane jest:</label>
          <select id="wynagrodzenieOption" name="wynagrodzenieOption" className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none" value={wynagrodzenieOption} onChange={(e) => setWynagrodzenieOption(e.target.value)}>
            <option value="" disabled hidden>wybierz rodzaj</option>
            <option value="przelewem na podany nr rachunku bankowego">przelewem na podany nr rachunku bankowego</option>
            <option value="gotówką w siedzibie firmy - po złożeniu oświadczenia na piśmie">gotówką w siedzibie firmy - po złożeniu oświadczenia na piśmie</option>
          </select>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label htmlFor="numberOfEmployees" className="font-semibold block mb-2">Ilość pracowników:</label>
            <input type="number" id="numberOfEmployees" placeholder="Podaj ilość osób zgłoszonych do ub. wypadkowego" value={numberOfEmployees} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => {
              setNumberOfEmployees(e.target.value);
              if (e.target.value <= 10) {
                setWypadkoweRate('1.67%');
              } else {
                setWypadkoweRate('');
              }
            }} />
          </div>

          <div className="flex flex-col mb-4 space-y-2">
            <label htmlFor="ubezpieczenieWypadkowe" className="font-semibold block">Ujęta stopa procentowa na ub. wypadkowe:</label>
            {numberOfEmployees > 10 ? (
              <input type="text" id="ubezpieczenieWypadkowe" placeholder="Uzułnij wartość w % jeśli masz powyżej 10 pracowników" value={wypadkoweRate} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => setWypadkoweRate(e.target.value)} />
            ) : (
              <p className="bg-gray-100 rounded w-full py-2 px-3">{wypadkoweRate} (dla firm zatrudniających mniej niż 10 osób)</p>
            )}

            <div className="text-sm mt-2">
              <p>Uwaga: Firma posiadająca więcej niż 10 pracowników i uzyskała z ZUS stopę procentową składki na ubezpieczenie wypadkowe.</p>
            </div>
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
