import React, { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import MedicalExaminationView from './MedicalExaminationView';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct pat
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';

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
const { currentStep, setCurrentStep, nextStep,  } = useSetup(); // Use the context to control steps
const [employeeAdded, setEmployeeAdded] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [employees, setEmployees] = useState([]);
const { markStepAsCompleted } = useSetup();
const [showNextStepButton, setShowNextStepButton] = useState(false);
const [employeeId, setEmployeeId] = useState(null); // Assume this might be set based on route or state
const [isLoading, setIsLoading] = useState(true);
const [isCreatingNew, setIsCreatingNew] = useState(false);
const [employeeData, setEmployeeData] = useState(null);
const [updateMessage, setUpdateMessage] = useState('');
const [error, setError] = useState(null);
const [isCreating, setIsCreating] = useState(false); // New state for tracking creation/update status
const [isEmployeeCreated, setIsEmployeeCreated] = useState(false);
const [isEmployeeUpdated, setIsEmployeeUpdated] = useState(false);
const [formTouched, setFormTouched] = useState(false);  // Tracks if the form has been interacted with
const user = useRequireAuth();


const { setIsInSetupProcess } = useSetup();


const location = useLocation();

const queryParams = new URLSearchParams(location.search);
    const isInSetupProcess = queryParams.get('setup') === 'true';

// Define this outside your component if these steps are used in multiple places
const steps = [
  { name: "Create Company", path: "/create-company" },
  { name: "Add Employees", path: "/createEmployee?setup=true" },
  { name: "Add Contract to Employee", path: "/add-contract/:employeeId" }, // Use placeholder
  { name: "Add Params to Employee", path: "/employee-param/:employeeId" }, // Use placeholder
  { name: "Salary Setup", path: "/salary-selection" },
];

useEffect(() => {
  const currentPath = location.pathname;
  const stepIndex = steps.findIndex(step => step.path === currentPath);
  if (stepIndex !== -1) {
    setCurrentStep(stepIndex + 1); // Correctly use setCurrentStep here
  }
}, [location, setCurrentStep, steps]); // Include 'steps' in the dependency array if it's not static

const isSetupCompleted = () => {
  const setupCompleted = localStorage.getItem('setupCompleted');
  return setupCompleted === 'true';
};

useEffect(() => {
  // Define paths that are part of the initial setup process
  const setupPaths = ['/CreateCompany', '/createEmployee', '/AddContractForm', '/EmployeeParam'];

  // Check if the current pathname matches any of the setup paths AND setup is not completed
  const isInSetupProcessNow = setupPaths.some(path => location.pathname.startsWith(path)) && !isSetupCompleted();

  // Update the state based on whether the current page is part of the setup process
  setIsInSetupProcess(isInSetupProcessNow);
}, [location.pathname]); // Depend on location.pathname to re-evaluate when the route changes







// This useEffect might not be necessary if you're only logging the state change.
// If you keep it, ensure it doesn't cause any unintended side effects.
useEffect(() => {
  console.log("isInSetupProcess updated:", isInSetupProcess);
}, [isInSetupProcess]);


  useEffect(() => {
    axios.get('http://localhost:3001/tax-offices')
        .then((response) => {
            setTaxOffices(response.data);

        })
        .catch((error) => {
            console.error('Error fetching tax offices:', error);
        });
}, []); // Empty dependency array ensures this effect runs only once

useEffect(() => {
  const savedEmployee = localStorage.getItem('createdEmployee');
  if (savedEmployee) {
    const employeeData = JSON.parse(savedEmployee);
    setEmployeeName(employeeData.employeeName);
    populateFormFields(employeeData);

    // Check if employee data is being updated
    if (employeeData.employeeId) {
      setIsCreatingNew(false); // Employee data exists, so not creating new
      setIsEditMode(false); // Set isEditMode to false when data is being updated
    } else {
      setIsCreatingNew(true); // No employee data exists, so creating new
      setIsEditMode(true); // Set isEditMode to true when creating a new employee
    }

    // Set tax office state based on employeeData.taxOffice
    setTaxOffice(employeeData.taxOfficeName);

    setCreatedEmployee(employeeData);
  } else {
    clearForm();
    setIsCreatingNew(true); // Start in create mode
    setIsEditMode(false); // Set isEditMode to false if no employee data is available
    
  }
  

  return () => {
    clearFormFields(); // Make sure this function resets all form-related states
    setError(null);
    setFormTouched(false);
    toast.dismiss();
};
}, []);


const clearFormFields = () => {
  setEmployeeName('');
  setEmployeeSurname('');
  setStreet('');
  setNumber('');
  setPostcode('');
  setCity('');
  setCountry('');
  setTaxOfficeName('');
  setPESEL('');
};

const populateFormFields = (employeeData) => {
  if (!employeeData) {
      console.error('No employee data available to populate form fields');
      return;
  }

  setEmployeeName(employeeData.employeeName || '');
  setEmployeeSurname(employeeData.employeeSurname || '');
  setStreet(employeeData.street || '');
  setNumber(employeeData.number || '');
  setPostcode(employeeData.postcode || '');
  setCity(employeeData.city || '');
  setCountry(employeeData.country || '');
  setPESEL(employeeData.PESEL || '');

  setTaxOfficeName(employeeData.taxOfficeName|| '');
};










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
  const goToPreviousStep = () => {
    // Decrement the current step, ensuring it doesn't go below the first step
    setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
    
    // Logic to navigate based on the updated currentStep would typically be
    // in a useEffect that reacts to changes in currentStep, similar to your goToNextStep setup.
  };
  
  
  const getDateOfBirth = (pesel) => {
    // Assuming pesel is in the format: YYMMDDNNNNNN
    if (pesel && pesel.length === 11) {
      let year = parseInt(pesel.substring(0, 2), 10);
      let month = parseInt(pesel.substring(2, 4), 10) - 1; // Subtract 1 as months are zero-based in JavaScript Date
      const day = parseInt(pesel.substring(4, 6), 10);
  
      // Adjust year and month for 20th and 21st century
      if (month >= 20) { // People born in 21st century
        month -= 20; // Adjust month back to standard 0-11 range
        year += 2000;
      } else { // People born in 20th century
        year += 1900;
      }
  
      return new Date(year, month, day).toLocaleDateString(); // Format the date as desired
    }
    return '';
  };
  




  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormTouched(true);  // User has attempted to submit, so validate fields

    // Check if we are in edit mode and have an existing employee
    if (isEditMode && createdEmployee && createdEmployee.employeeId) {
        // Call handleUpdateEmployee when in edit mode
        handleUpdateEmployee(createdEmployee.employeeId);
    } else {
        // Call handleCreateEmployee when not in edit mode
        handleCreateEmployee();
    }
};
  // Add this function to handle the back button click
  const handleBackClick = () => {
    console.log("Clearing errors and form data...");
    setError(null);
    clearForm();
    toast.dismiss(); // Clear all toasts

    setTimeout(() => {
        console.log("Navigating back...");
        navigate(-1);
    }, 100);
};


const handleCreateEmployee = async () => {

    if (!employeeName || !employeeSurname || !street || !number || !postcode || !city || !country || !taxOffice || !PESEL) {
      setValidationError("All fields must be entered!");  // Set the error message
      toast.error("Proszę uzupełnić wszystkie dane!");
      return;
    }
    if (!isValidPESEL(PESEL)) {
      setValidationError("Invalid PESEL number!");  // Set the error message
      toast.error("Błędny numer PESEL!");
      return;
    }
    if (!isValidPostcode(postcode)) {
      setValidationError("Invalid postcode format! It should be XX-XXX.");
      toast.error("Błędny format kodu pocztowego. Prawidłowy XX-XXX !");
      return;
    }
    
    if (!taxOffice) {
      setValidationError("Please select a tax office from the dropdown!");
      toast.error("Proszę wybierz dane Urzędu Skarbowego z listy!");
      return;
  }
  
   
    
  try {
    const response = await axiosInstance.post('http://localhost:3001/create-employee', {
      employeeName,
      employeeSurname,
      street,
      number,
      postcode,
      city,
  country,
      taxOfficeName,
      PESEL,
    }, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });

    if (response.data && response.data.employeeId) { // Assuming your API returns the employeeId on successful creation
        console.log('Employee created:', response.data);
        toast.success("Pracownik został dodany do kartoteki");
        const employeeData = {
          ...response.data,
          taxOfficeName // Save taxOfficeName along with other employee data
      };
        await fetchEmployeeData(response.data.employeeId);
        localStorage.setItem('createdEmployee', JSON.stringify(employeeData));
            populateFormFields(employeeData);
            setCreatedEmployee(employeeData);
            setIsCreatingNew(false); // Set flag for newly created employee
            setIsEmployeeCreated(true); // Set flag for employee creation
        setIsEditMode(false); // Switch to edit mode after creating
    } else {
        console.error('Error creating employee: No data returned');
        // Handle case where no data is returned
    }




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

  // Assuming createdEmployee is accessible here
const handleAddViewContractClick = () => {
  if (isInSetupProcess) {
    // If in setup process, move to the next step
    nextStep();

    // Optionally, navigate to the next step manually if necessary
    // This is where you'd include logic similar to what was discussed,
    // but directly within this click handler based on the updated currentStep
  } else {
    // If not in setup process, navigate directly
    navigate(`/add-contract/${createdEmployee.employeeId}`);
  }
};

  // This function will redirect to the AddContractForm for the specific employee
  const goToAddParameters = (employeeId) => {
    navigate(`/employee-param/${employeeId}`);
  }

        
} catch (error) {
  console.error('Error creating employee:', error);
  if (error.response) {
      toast.error(`Błąd: ${error.response.data}`);
  } else {
      toast.error("Błąd przy wprowadzaniu danych nowego pracownika. Spórbuj ponownie.");
  }
}
};
const handleUpdateEmployee = async (employeeId) => {
  try {
      const response = await axiosInstance.put(`http://localhost:3001/update-employee/${employeeId}`, {
          name: employeeName,
          surname: employeeSurname,
          pesel: PESEL,
          street,
          number,
          postcode,
          city,
          country,
          tax_office: taxOfficeName,
    }, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`, // Use the access token
        'X-Schema-Name': user.schemaName, // Send the schema name as a header
      }
    });

      // After updating the employee
// After updating the employee
if (response.data && response.data.updatedEmployee) {
  const updatedEmployee = response.data.updatedEmployee;
  const employeeData = {
    employeeId: updatedEmployee.id,
    employeeName: updatedEmployee.name,
    employeeSurname: updatedEmployee.surname,
    street: updatedEmployee.street,
    number: updatedEmployee.number,
    postcode: updatedEmployee.postcode,
    city: updatedEmployee.city,
    country: updatedEmployee.country,
    taxOfficeName: updatedEmployee.tax_office,
    PESEL: updatedEmployee.pesel
  };
  setIsCreating(false); // Reset state for next operation
  setIsCreatingNew(false);
  // Correctly set the data in local storage
  localStorage.setItem('createdEmployee', JSON.stringify(employeeData));
  console.log('Employee updated successfully:', employeeData);
      populateFormFields(employeeData);
      
      setCreatedEmployee(employeeData);
      setIsEmployeeCreated(false); 
      setIsEmployeeUpdated(true); // Set flag for employee update
      setIsEditMode(false); // Switch back to view mode after update
      } else {
          console.error('Error updating employee: No data returned');
      }
  } catch (error) {
      console.error('Error updating employee:', error);
  }
};





const fetchEmployeeData = async (employeeId) => {
  console.log('Fetching data for employee ID:', employeeId);
  try {
    const response = await axiosInstance.get(`http://localhost:3001/employees/${employeeId}`, {
      headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName // Include the schema name in the request headers
      }
  });
    if (response.data) {
        populateFormFields(response.data);
        localStorage.setItem('createdEmployee', JSON.stringify(response.data));
        setCreatedEmployee(response.data);
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
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

// Adjust the handleTaxOfficeChange function if necessary
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

  const handleCancelEdit = () => {
    // Add any additional logic here to clear form fields or reset state
    window.location.reload();
  };

  // Clear form and local storage correctly
const clearForm = () => {
  setEmployeeName('');
  setEmployeeSurname('');
  setStreet('');
  setNumber('');
  setPostcode('');
  setCity('');
  setCountry('');
  setTaxOfficeName('');
  setPESEL('');
  localStorage.removeItem('createdEmployee');
  setCreatedEmployee(null);
  // Reset state to reflect that there is no longer an employee loaded for editing
  
  setIsCreatingNew(true);
  setIsEditMode(false);
};


// toggleEditMode should be responsible only for toggling the edit mode
const toggleEditMode = () => {
  setIsEditMode(currentMode => !currentMode);
};

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      {isInSetupProcess && <StepIndicator steps={steps} currentStep={currentStep} />}
      {isInSetupProcess && <StepIndicator steps={steps} isCurrentStepCompleted={employeeAdded} />}
      <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-6">Dane pracownika</h1>
      {/* Display validation error if present */}
      <div className="text-red-500 text-center">{validationError}</div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
  <label htmlFor="employeeName" className="block text-gray-700 text-sm font-bold mb-2">Employee Name:</label>
  <input
    id="employeeName"
    type="text"
    value={employeeName}
    onChange={handleEmployeeNameChange}
    readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
         <div>
         <label htmlFor="employeeSurname" className="block text-gray-700 text-sm font-bold mb-2">Nazwisko:</label>
        <input
        id="employeeSurname"
        type="text" 
        value={employeeSurname}
        onChange={handleEmployeeSurnameChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
         />
         </div>
         <div className="md:col-span-2 text-xl  text-left mb-6">Miejsce zamieszkania:</div>
         <div>
         <label htmlFor="street" className="block text-sm font-medium text-gray-700">Ulica:</label>
        <input type="text" 
        value={street}
        onChange={handleStreetChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
         />
         </div>

         <div>
    <label htmlFor="number" className="block text-sm font-medium text-gray-700">Number:</label>
    <input
        id="number"
        type="text"
        value={number}
        onChange={handleNumberChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div>
    <label htmlFor="postcode" className="block text-sm font-medium text-gray-700">Postcode:</label>
    <input
        id="postcode"
        type="text"
        value={postcode}
        onChange={handlePostcodeChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div>
    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City:</label>
    <input
        id="city"
        type="text"
        value={city}
        onChange={handleCityChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div>
    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country:</label>
    <input
        id="country"
        type="text"
        value={country}
        onChange={handleCountryChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div className="md:col-span-2">
  <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">Tax Office:</label>
  {(isEditMode || isCreatingNew) ? (
    <Select
      id="taxOffice"
      options={taxOfficeOptions}
      onChange={handleTaxOfficeChange}
      isSearchable={true}
      value={taxOfficeOptions.find(option => option.label === taxOfficeName)}
      classNamePrefix="react-select"
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
  ) : (
    <input
      id="taxOffice"
      type="text"
      value={taxOfficeName}
      readOnly
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
  )}
</div>


<div>
    <label htmlFor="pesel" className="block text-sm font-medium text-gray-700">PESEL:</label>
    <input
        id="pesel"
        type="text"
        value={PESEL}
        onChange={handlePESELChange}
        readOnly={!isCreatingNew && !isEditMode} // Set readOnly based on isCreatingNew and isEditMode states
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>
<div>
  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Data urodzenia:</label>
  <input
    id="dateOfBirth"
    type="text"
    value={getDateOfBirth(PESEL)} // Assuming you have a function getDateOfBirth to calculate the date of birth
    readOnly
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
  />
</div>
<div>
<div className="flex items-center space-x-2  justify-between">
  {isCreatingNew && !isEditMode && (
    <>
      <button 
        type="submit" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
      >
        Create Employee
      </button>
      <button 
        onClick={clearForm} 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear Data
      </button>
      <button
       className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"onClick={handleBackClick}>Back</button>
    </>
  )}

  {!isCreatingNew && !isEditMode && (
    <>
      <button 
        onClick={() => setIsEditMode(true)} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Edit
      </button>
      <button 
        onClick={clearForm} 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear Data
      </button>
      <button className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"  onClick={handleBackClick}>Back</button>
    </>
  )}

  {isEditMode && (
    <>
      <button 
        type="submit" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Update Employee
      </button>
      <button 
        onClick={() => {
          setIsEditMode(false);
         
          window.location.reload(); // Reload the page
      }} 
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Cancel Edit
      </button>
      <button 
        onClick={clearForm} 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear Data
      </button>
      <button className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"  onClick={handleBackClick}>Back</button>
    </>
    
  )}
</div>










</div>

        </div>
      </form>
      <div className="mt-4 bg-white shadow rounded p-4">
      <div className="md:col-span-2 text-xl  text-left mb-6">Następne kroki do zatrudnienia pracownika:</div>

      {createdEmployee ? (
  <div className="flex items-center space-x-2  justify-between">
    <button 
      onClick={() => navigate(`/medical-examination/${createdEmployee.employeeId}`)}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      1. Medical
    </button>

    <button 
      onClick={() => navigate(`/add-contract/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      2. Add/view Contract
    </button>

    <button 
      onClick={() => navigate(`/employee-param/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      3. Add Params
    </button>
    
    <button 
      onClick={() => navigate(`/holidaybase/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      3. Podstawa urlop
    </button>

  </div>
) : (
  <div className="space-y-4 mt-4">
    <button disabled className="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-50 cursor-not-allowed">
      MedicalExam
    </button>
    <button disabled className="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-50 cursor-not-allowed">
      Add Contract
    </button>
    <button disabled className="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-50 cursor-not-allowed">
      Add Params
    </button>
    <button disabled className="bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline opacity-50 cursor-not-allowed">
      Podstaw urlop
    </button>
  </div>
)}
</div>
{createdEmployee && (
  <div className="mt-4 bg-white shadow rounded p-4">
    <h2 className="text-xl font-semibold mb-2">
      Employee id: {createdEmployee.employeeId} {isEmployeeCreated ? 'Created' : isEmployeeUpdated ? 'Updated' : '' }
      Successfully!
    </h2>
    <p>Name: {createdEmployee.employeeName}</p>
    <p>Surname: {createdEmployee.employeeSurname}</p>
    <p>Street: {createdEmployee.street}</p>
    <p>Number: {createdEmployee.number}</p>
    <p>Postcode: {createdEmployee.postcode}</p>
    <p>City: {createdEmployee.city}</p>
    <p>Tax Office: {createdEmployee.taxOfficeName}</p>
    <p>Pesel: {createdEmployee.PESEL}</p>
  </div>
)}









{showNextStepButton && (
  <div className="flex justify-between mt-4">
    <button 
      onClick={goToNextStep}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      Go to Next Step
    </button>
    {currentStep > 1 && (
      <button 
        onClick={goToPreviousStep}
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
        Back
      </button>
    )}
  </div>
)}
    </div>
    </div>
  );
}

export default EmployeeForm;
