import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps

function EmployeeParam() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasParams = location.state?.hasParams; // This will be undefined if no state is passed

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
const [hasDisability, setHasDisability] = useState('0'); // '0' for none, '1' for 'lekki', '2' for 'umiarkowany', '3' for 'znaczny'
const [isRetired, setIsRetired] = useState(false); // true if the employee is retired (emerytura)
const [hasDisabilityBenefit, setHasDisabilityBenefit] = useState(false); // true if the employee has a disability benefit (renta)

const { currentStep, setCurrentStep, nextStep, steps } = useSetup(); // Use the context to control steps
const [paramsAdded, setparamsAdded] = useState(false);
const { markStepAsCompleted } = useSetup();
const [showNextStepButton, setShowNextStepButton] = useState(false);

const { setIsInSetupProcess } = useSetup();




const queryParams = new URLSearchParams(location.search);
    const isInSetupProcess = queryParams.get('setup') === 'true';

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
}, [location.pathname]); // Depend on location.pathname to re-evaluate when the route changes [location, setCurrentStep, steps]); // Include 'steps' in the dependency array if it's not static


useEffect(() => {
  // Function to fetch existing parameters
  const fetchParams = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/employee-params/${employeeId}`);
      if (response.data && response.data.parameters.length > 0) {
        const fetchedParams = response.data.parameters[0];
        setKoszty(fetchedParams.koszty);
        setUlga(fetchedParams.ulga);
        setKodUb(fetchedParams.kod_ub);
        setValidFrom(fetchedParams.valid_from);
        // ... set other fields similarly
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };  

  fetchParams();
}, [employeeId]); // employeeId as a dependency

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


const handleSubmit = async (event) => {
  event.preventDefault();
  
  try {
    let response;
    if (paramData) {
      // If paramData exists, update existing parameters
      response = await axios.put(`http://localhost:3001/employees/${employeeId}/update-params`, {
        koszty,
        ulga,
        kodUb,
        validFrom
      });
      // Update paramData with the response data
      setParamData({
        ...response.data.employeeParams,
        kod_ub: String(response.data.employeeParams.kod_ub).padStart(6, '0')
      });
    } else {
      // If paramData does not exist, add new parameters
      response = await axios.post(`http://localhost:3001/employees/${employeeId}/add-params`, {
        koszty,
        ulga,
        kodUb,
        validFrom
      });
      setParamData({
        ...response.data.employeeParams,
        kod_ub: String(response.data.employeeParams.kod_ub).padStart(6, '0')
      });
      markStepAsCompleted(4); // Mark the "Add Employees" step as completed
  nextStep(); // Move to the next step
  setparamsAdded(true); 
      // Clear form fields
      setKoszty('');
      setUlga('');
      setKodUb('');
      setValidFrom('');
    }
  } catch (error) {
    console.error('Error updating/adding parameters:', error);
    // Handle errors for both updating and adding
  }
};

  
  const constructKodUb = (isRetired, hasDisabilityBenefit, hasDisability) => {
    let kodUb = '0110'; // The fixed part
    // Determine the second part based on emerytura/renta
    if (isRetired) {
      kodUb += '1';
    } else if (hasDisabilityBenefit) {
      kodUb += '2';
    } else {
      kodUb += '0';
    }
    // Add the third part based on the degree of disability
    kodUb += hasDisability;
    return kodUb;
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
  const handleDisabilityChange = (event) => {
    const disabilityDegree = event.target.value; // '0', '1', '2', '3'
    setHasDisability(disabilityDegree);
    setKodUb(constructKodUb(hasPension, disabilityDegree));
  };
  const handleRetirementChange = (event) => {
    const selectedValue = event.target.value;
    const isRetirementSelected = selectedValue === 'yes';
  
    setIsRetired(isRetirementSelected);
  
    // Ensure the other option is set to No if this is Yes
    if (isRetirementSelected) {
      setHasDisabilityBenefit(false);
    }
  
    // Update the kod_ub and ulga values
    setKodUb(constructKodUb(isRetirementSelected, false, hasDisability));
    setUlga(calculateUlga(isRetirementSelected, false));
  };
  
  const handleDisabilityBenefitChange = (event) => {
    const selectedValue = event.target.value;
    const isBenefitSelected = selectedValue === 'yes';
  
    setHasDisabilityBenefit(isBenefitSelected);
  
    // Ensure the other option is set to No if this is Yes
    if (isBenefitSelected) {
      setIsRetired(false);
    }
  
    // Update the kod_ub and ulga values
    setKodUb(constructKodUb(false, isBenefitSelected, hasDisability));
    setUlga(calculateUlga(false, isBenefitSelected));
  };
  
  
  
  

  const calculateUlga = (isRetired, hasDisabilityBenefit, numOfCompanies) => {
    if (isRetired || hasDisabilityBenefit) {
      return '0'; // If the employee is retired or has a disability benefit, ulga is 0
    } else {
      // No pension or disability benefit, determine ulga based on the number of companies
      switch (numOfCompanies) {
        case 1: return '300';
        case 2: return '150';
        case 3: return '100';
        default: return '300'; // Default to 300 if something goes wrong
      }
    }
  };
  
  // Initialize ulga with default value based on conditions
  useEffect(() => {
    setUlga(calculateUlga(isRetired, hasDisabilityBenefit, numOfCompanies));
  }, [isRetired, hasDisabilityBenefit, numOfCompanies]);
  
  
 // Call this whenever hasPension or hasDisability changes
 useEffect(() => {
    setKodUb(constructKodUb(isRetired, hasDisabilityBenefit, hasDisability));
  }, [isRetired, hasDisabilityBenefit, hasDisability]);
  
   

  // Below is the form where you can input the parameters
  return (
    <div>
      {isInSetupProcess &&<StepIndicator steps={steps} isCurrentStepCompleted={paramsAdded} />}
      {isInSetupProcess &&<StepIndicator steps={steps} currentStep={currentStep} />}
      <h2>{hasParams ? 'Update Employee Parameters' : 'Add Employee Parameters'} dla { employeeId }</h2>
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

        {/* Question for pension or retirement */}
{/* Question for retirement */}
{/* Question for retirement */}
{/* Question for retirement */}
<label>Czy pracownik jest emerytem?</label>
<div>
  <input
    type="radio"
    name="retirementStatus"
    value="yes"
    checked={isRetired}
    onChange={handleRetirementChange}
  /> Tak
  <input
    type="radio"
    name="retirementStatus"
    value="no"
    checked={!isRetired}
    onChange={handleRetirementChange}
  /> Nie
</div>

{/* Question for disability benefit */}
<label>Czy pracownik otrzymuje rentę?</label>
<div>
  <input
    type="radio"
    name="benefitStatus"
    value="yes"
    checked={hasDisabilityBenefit}
    onChange={handleDisabilityBenefitChange}
  /> Tak
  <input
    type="radio"
    name="benefitStatus"
    value="no"
    checked={!hasDisabilityBenefit}
    onChange={handleDisabilityBenefitChange}
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

        {/* Question for the degree of disability */}
<label>Stopień niepełnosprawności:</label>
<select value={hasDisability} onChange={handleDisabilityChange}>
  <option value="0">Brak</option>
  <option value="1">Lekki</option>
  <option value="2">Umiarkowany</option>
  <option value="3">Znaczny</option>
</select>


        <label>Kod ubezpieczenia:</label>
        <input type="text" value={kodUb} onChange={handleKodUbChange} />

        <label>Valid From:</label>
        <input type="date" value={validFrom} onChange={handleValidFromChange} />

        <button type="submit">{hasParams ? 'Update Parameters' : 'Add Parameters'}</button>

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
