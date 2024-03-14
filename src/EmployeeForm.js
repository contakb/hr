import React, { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import MedicalExaminationView from './MedicalExaminationView';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps

function EmployeeForm() {
  const initialFormData = {
    employeeName: '',
    employeeSurnam: '',
    street: '',
    number: '',
    postcode: '',
    city: '',
    PESEL: '',
    country: '',
    taxOffice: '',
    taxOfficeName: '',
    
  }
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
    setCreatedEmployee(JSON.parse(savedEmployee));
    localStorage.removeItem('createdEmployee');
  } 
}, []);





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
  
  

const fetchEmployeeData = async () => {
      await axios.get(`http://localhost:3001/employees/${employeeId}`)
      .then(response => {
        const employeeData = response.data.length > 0 ? response.data[0] : null;
        if (employeeData && employeeData.employeeId) {
            setEmployeeData(employeeData)
            setEmployeeName(employeeData.name);
            setEmployeeSurname(employeeData.surname);
            setStreet(employeeData.street);
            setNumber(employeeData.number);
            setPostcode(employeeData.postcode);
            setCity(employeeData.city);
            setCountry(employeeData.country);
            setPESEL(employeeData.pesel);
            setTaxOffice(employeeData.tax_office);
          } else {
            setEmployeeData(null); // Set to null if no data is returned
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

      setEmployeeData(null); // Set companyData to null when fetch fails
      setIsLoading(false);
    });
};




  // Fix handleSubmit logic
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check if we are in edit mode and have an existing employee
    if (isEditMode && employeeData && employeeData.employeeId) {
      // When in edit mode and company data is available
      handleUpdateDetails(event, employeeData.employeeId);
    } else if (!isEditMode) {
      handleCreateEmployee() 
      .then((response) => {
        console.log('Employee created:', response.data);
        setUpdateMessage('Company Employee successfully. You can now move to the next step.');
setShowNextStepButton(true); // Show the button to move to the next step
nextStep(); // Move to the next step

        // Optional: Handle post-creation logic here if needed
      })
      .catch((error) => {
        console.error('Error creating employee:', error);
        // Handle errors, such as showing an error message
      });
  } else {
    console.error('No valid employee data for update.');
  }
};// Create a new employee entry in the database
  

const handleCreateEmployee = async () => {

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
  markStepAsCompleted(2); // Mark the "Add Employees" step as completed
  nextStep(); // Move to the next step
  // Fetch the latest company data
  fetchEmployeeData(); 
  // Clear form fields
  setEmployeeName('');
  setStreet('');
  setNumber('');
  setPostcode('');
  setCity('');
setCountry('');
  setTaxOfficeName('');
  setPESEL('');

  // Switch back to view mode after a delay
  setTimeout(() => {
    setIsEditMode(false);
    setUpdateMessage('');
}, 3000);

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
  taxOffice: taxOfficeName,
  PESEL,
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

// Set the created employee data in the state
localStorage.setItem('createdEmployee', JSON.stringify(createdEmployeeData));
setCreatedEmployee(createdEmployeeData);



        
      })
      .catch((error) => {
        // Handle create employee error
        console.error('Error creating employee:', error);
      });
  };

const handleUpdateDetails = async (event, employeeId) => {
    event.preventDefault();

    const updatedDetails = {
      name: employeeName,
      surname: employeeSurname,
      pesel: PESEL,
      street: street,
      number: number,
      postcode: postcode,
      city: city,
      country: country,
      tax_office: taxOfficeName,
    };
  
    await axios.put(`http://localhost:3001/update-employee/${employeeId}`, updatedDetails)
      .then(response => {
        console.log('Employee updated successfully:', response.data);
        setUpdateMessage('Employee updated successfully.');
        fetchEmployeeData(); // Fetch the latest company data
        setIsEditMode(false); // Switch back to view mode
        setTimeout(() => setUpdateMessage(''), 3000); // Clear message after 3 seconds
        })
        .catch(error => {
            console.error('Error updating company:', error);
            setValidationError('Failed to update company data.');
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
};


const toggleEditMode = (editMode) => {
  if (editMode && employeeData) {
      // Populate form fields with existing employee data
      setEmployeeName(employeeData.employeeName || '');
      setEmployeeSurname(employeeData.employeeSurname || '');
      setStreet(employeeData.street || '');
      setNumber(employeeData.number || '');
      setPostcode(employeeData.post_code || '');
      setCity(employeeData.city || '');
      setCountry(employeeData.country || '');
      // Find the option that matches the taxOffice ID from companyData
      const selectedTaxOfficeOption = taxOfficeOptions.find(option => option.label === employeeData.tax_office);
        if (selectedTaxOfficeOption) {
            setTaxOffice(selectedTaxOfficeOption.value); // Set the tax office ID
            setTaxOfficeName(selectedTaxOfficeOption.label); // Update the tax office name
        } else {
            // Reset or set default values if no matching tax office is found
            setTaxOffice('');
            setTaxOfficeName('');
        }
      setPESEL(employeeData.PESEL || ''); // Make sure the key names match your data structure
  }
  setIsEditMode(editMode); // Update the state to enter/exit edit mode
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
    placeholder="Enter employee name"
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
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
         />
         </div>
         <div className="md:col-span-2 text-xl  text-left mb-6">Miejsce zamieszkania:</div>
         <div>
         <label htmlFor="street" className="block text-sm font-medium text-gray-700">Ulica:</label>
        <input type="text" 
        value={street}
        onChange={handleStreetChange}
        
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
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div className="md:col-span-2">
    <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">Tax Office:</label>
    <Select
        id="taxOffice"
        options={taxOfficeOptions}
        onChange={handleTaxOfficeChange}
        isSearchable={true}
        value={taxOfficeOptions.find(option => option.value === taxOfficeName)}
        classNamePrefix="react-select"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>

<div>
    <label htmlFor="pesel" className="block text-sm font-medium text-gray-700">PESEL:</label>
    <input
        id="pesel"
        type="text"
        value={PESEL}
        onChange={handlePESELChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
</div>
<div>
         <div className="flex justify-between">
         <div className="col-span-1 md:col-span-2">
      <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => toggleEditMode(true)}>Edytuj dane firmy</button>
      </div>
      <div className="flex space-x-2 mt-4">
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {isEditMode ? 'Update Company' : 'Create Company'}
    </button>
    <button onClick={() => toggleEditMode(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
      Cancel
    </button>
    <button onClick={clearForm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      Clear Data
    </button>
  </div>
</div>
</div>

        </div>
      </form>
      
      {createdEmployee ? (
  <div className="flex items-center space-x-2">
    <button 
      onClick={() => navigate(`/medical-examination/${createdEmployee.employeeId}`)}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      Medical
    </button>

    <button 
      onClick={() => navigate(`/add-contract/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      Add/view Contract
    </button>

    <button 
      onClick={() => navigate(`/employee-param/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}
      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
      Add Params
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
  </div>
)}

{createdEmployee && (
  <div className="mt-4 bg-white shadow rounded p-4">
    <h2 className="text-xl font-semibold mb-2">Employee id:{createdEmployee.employeeId} Created Successfully!</h2>
    <p>ID: {createdEmployee.employeeId}</p>
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
