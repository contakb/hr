import React, { useState, useEffect,useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import MedicalExaminationView from './MedicalExaminationView';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps

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
const { markStepAsCompleted } = useSetup();
const [showNextStepButton, setShowNextStepButton] = useState(false);

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
  markStepAsCompleted(2); // Mark the "Add Employees" step as completed
  nextStep(); // Move to the next step
  setEmployeeAdded(true); 

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
      {isInSetupProcess && <StepIndicator steps={steps} currentStep={currentStep} />}
      {isInSetupProcess && <StepIndicator steps={steps} isCurrentStepCompleted={employeeAdded} />}
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
  <button onClick={() => navigate(`/add-contract/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}>Add/view Contract</button>
) : (
  <button disabled>Add Contract</button>
)}

{/* Conditionally render the Add Params button */}
{createdEmployee ? (
  <button onClick={() => navigate(`/employee-param/${createdEmployee.employeeId}${isInSetupProcess ? '?setup=true' : ''}`)}>Add Params</button>
) : (
  <button disabled>Add Params</button>
)}
	  {createdEmployee && (
        <div>
          <h2>Employee id:{createdEmployee. employeeId} Created Successfully!</h2>
          <p>ID: {createdEmployee. employeeId}</p>
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
    {/* Move the conditional rendering here, outside the renderForm function */}
    {showNextStepButton && (
          <div>
            <button onClick={goToNextStep}>Go to Next Step</button>
            {/* Render the Back button only if not on the first step */}
{currentStep > 1 && (
  <button onClick={goToPreviousStep}>Back</button>
)}
          </div>
    )}
    </div>
  );
}

export default EmployeeForm;
