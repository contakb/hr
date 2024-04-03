import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';

function EmployeeParam() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasParams = location.state?.hasParams; // This will be undefined if no state is passed

  // New state variables for the employee parameters
  const [koszty, setKoszty] = useState('250');
  const [ulga, setUlga] = useState('');
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
const user = useRequireAuth();

const clearForm = () => {
  setKoszty('');
  setUlga('');
  setKodUb('');
  setValidFrom('');
  // Reset any other state variables or form fields as necessary
};


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

// Decode function for kod_ub
const decodeKodUb = (kodUb) => {
  const isRetired = kodUb.charAt(4) === '1';
  const hasDisabilityBenefit = kodUb.charAt(4) === '2';
  const hasDisability = kodUb.charAt(5); // Assuming last character represents the disability degree

  return {
    isRetired,
    hasDisabilityBenefit,
    hasDisability
  };
};


useEffect(() => {
  // Function to fetch existing parameters
  const fetchParams = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:3001/api/employee-params/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
        }
      });
      if (response.data && response.data.parameters.length > 0) {
        const fetchedParams = response.data.parameters[0];
        // Decode the kod_ub
      const { isRetired, hasDisabilityBenefit, hasDisability } = decodeKodUb(fetchedParams.kod_ub);

      // Update state with the decoded values
      setIsRetired(isRetired);
      setHasDisabilityBenefit(hasDisabilityBenefit);
      setHasDisability(hasDisability);

        setKoszty(fetchedParams.koszty);
        setUlga(fetchedParams.ulga);
        setKodUb(fetchedParams.kod_ub);
        setValidFrom(fetchedParams.valid_from);
        setParamData(fetchedParams); // Store fetched data in state
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
      response = await axiosInstance.put(`http://localhost:3001/employees/${employeeId}/update-params`, {
        koszty,
        ulga,
        kodUb,
        validFrom
      }, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
        }
      });
     
      toast.success('Parameters updated successfully for employee!'); // Success message for update
      
      
    } else {
      // If paramData does not exist, add new parameters
      response = await axiosInstance.post(`http://localhost:3001/employees/${employeeId}/add-params`, {
        koszty,
        ulga,
        kodUb,
        validFrom
      }, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
        }
      });
      setParamData({
        ...response.data.employeeParams,
        kod_ub: String(response.data.employeeParams.kod_ub).padStart(6, '0')
      });
      markStepAsCompleted(4); // Mark the "Add Employees" step as completed
  nextStep(); // Move to the next step
  setparamsAdded(true); 
  toast.success('Parameters added successfully for employee!');
      
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
    <div className="bg-gray-100 min-h-screen p-8">
      {isInSetupProcess &&<StepIndicator steps={steps} isCurrentStepCompleted={paramsAdded} />}
      {isInSetupProcess &&<StepIndicator steps={steps} currentStep={currentStep} />}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">{hasParams ? 'Update Employee Parameters' : 'Add Employee Parameters'} dla { employeeId }</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
      <label className="block text-sm font-medium text-gray-700">Czy pracownik pracuje poza miejscem zamieszkania?</label>
      <div className="flex items-center space-x-2">
      <label className="inline-flex items-center">
  <input
    type="radio"
    name="worksOutsideHome"
    value="yes"
    checked={worksOutsideHome === true}
    onChange={handleWorksOutsideHomeChange}
  /> Tak
  </label>
  <label className="inline-flex items-center">
  <input
    type="radio"
    name="worksOutsideHome"
    value="no"
    checked={worksOutsideHome === false}
    onChange={handleWorksOutsideHomeChange}
  /> Nie
  </label>
</div>
</div>
        <label className="block text-sm font-medium text-gray-700">Koszty uzyskania przychodu:</label>
        <input type="number" value={koszty} onChange={handleKosztyChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />

        <div class="grid grid-cols-2 gap-4">
 
  <div>
    <label class="block text-sm font-medium text-gray-700">Czy pracownik jest emerytem?</label>
    <div class="mt-1 flex space-x-2">
      <label class="flex items-center">
        <input
          type="radio"
          name="retirementStatus"
          value="yes"
          checked={isRetired}
          onChange={handleRetirementChange}
          class="form-radio"
        /> 
        <span class="ml-2">Tak</span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          name="retirementStatus"
          value="no"
          checked={!isRetired}
          onChange={handleRetirementChange}
          class="form-radio"
        /> 
        <span class="ml-2">Nie</span>
      </label>
    </div>
  </div>

  
  <div>
    <label class="block text-sm font-medium text-gray-700">Czy pracownik otrzymuje rentę?</label>
    <div class="mt-1 flex space-x-2">
      <label class="flex items-center">
        <input
          type="radio"
          name="benefitStatus"
          value="yes"
          checked={hasDisabilityBenefit}
          onChange={handleDisabilityBenefitChange}
          class="form-radio"
        /> 
        <span class="ml-2">Tak</span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          name="benefitStatus"
          value="no"
          checked={!hasDisabilityBenefit}
          onChange={handleDisabilityBenefitChange}
          class="form-radio"
        /> 
        <span class="ml-2">Nie</span>
      </label>
    </div>
  </div>
</div>



{/* Question for the number of companies */}
<label className="block text-sm font-medium text-gray-700">Ilość firm, w których pracuje:</label>
<select value={numOfCompanies} onChange={handleNumOfCompaniesChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
  <option value={1}>1 firma</option>
  <option value={2}>2 firmy</option>
  <option value={3}>3 firmy</option>
  {/* Add more options if needed */}
</select>


        <label className="block text-sm font-medium text-gray-700">Ulga podatkowa:</label>
        <input type="number" value={ulga} onChange={handleUlgaChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />

        {/* Question for the degree of disability */}
<label className="block text-sm font-medium text-gray-700">Stopień niepełnosprawności:</label>
<select value={hasDisability} onChange={handleDisabilityChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
  <option value="0">Brak</option>
  <option value="1">Lekki</option>
  <option value="2">Umiarkowany</option>
  <option value="3">Znaczny</option>
</select>


        <label className="block text-sm font-medium text-gray-700">Kod ubezpieczenia:</label>
        <input type="text" value={kodUb} onChange={handleKodUbChange} className="mt-1 block border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />

        <label className="block text-sm font-medium text-gray-700">Valid From:</label>
        <input type="date" value={validFrom} onChange={handleValidFromChange} />
        <div className="flex  items-center mt-5">
        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{hasParams ? 'Update Parameters' : 'Add Parameters'}</button>
        <button onClick={clearForm} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Clear
          </button>
        <button onClick={() => navigate(-1)} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Back
          </button>
          
        </div>
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

      
    </div>
    </div>
    
  );
}

export default EmployeeParam;
