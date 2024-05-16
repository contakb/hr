import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps
import axiosInstance from './axiosInstance';
import { useRequireAuth } from './useRequireAuth';

function AddContractForm() {
  const { employeeId, contractId, employeeName } = useParams();
  const navigate = useNavigate();
  console.log('Employee ID:', employeeId);

  const [grossAmount, setGrossAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stanowisko, setstanowisko] = useState('');
  const [etat, setetat] = useState('');
  const [typ_umowy, settyp_umowy] = useState('');
  const [workstart_date, setworkstart_date] = useState('');
  const [contract, setContract] = useState(null);
  const [period_próbny, setperiod_próbny] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isAneksPresent, setIsAneksPresent] = useState(false);
  const { currentStep, setCurrentStep, nextStep, steps } = useSetup(); // Use the context to control steps
const [contractAdded, setcontractAdded] = useState(false);
const { markStepAsCompleted } = useSetup();
const [showNextStepButton, setShowNextStepButton] = useState(false);

const { setIsInSetupProcess } = useSetup();
const user = useRequireAuth();


const location = useLocation();

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
}, [location.pathname]); // Depend on location.pathname to re-evaluate when the route changes


  
   // Check if we are in edit mode (contractId is present)
   const isEditMode = !!contractId;
  // Load contract data if contractId is provided
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (contractId) {
        try {
          // Fetch the contract being edited
          const contractResponse = await axiosInstance.get(`http://localhost:3001/api/empcontracts/${contractId}`,{
            headers: {
                'Authorization': `Bearer ${user.access_token}`,
                'X-Schema-Name': user.schemaName // Include the schema name in the request headers
            }
        });
          const contract = contractResponse.data;
          setGrossAmount(contract.gross_amount);
          setStartDate(contract.contract_from_date);
          setEndDate(contract.contract_to_date);
          setstanowisko(contract.stanowisko);
          setetat(contract.etat);
          settyp_umowy(contract.typ_umowy);
          setworkstart_date(contract.workstart_date);
          // ... Any other fields that need to be set
  
          // Fetch all contracts for the employee to check for aneks
        const allContractsResponse = await axiosInstance.get(`http://localhost:3001/api/contracts/${contract.employee_id}`,{
          headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'X-Schema-Name': user.schemaName // Include the schema name in the request headers
          }
      });
        const allContracts = allContractsResponse.data.contracts;
        console.log("All contracts for employee:", allContracts);

        // Check if any contract is an aneks to the current contract
        const aneksExists = allContracts.some(c => c.kontynuacja === parseInt(contractId));
        console.log("Contract ID being edited:", contractId);
        console.log("Aneks Exists:", aneksExists);

        setIsAneksPresent(aneksExists);
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
  
    fetchContractDetails();
  }, [contractId]);
  
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
  
  
  // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const viewEmployeeContract = () => {
  // You can navigate to the EmployeeContract page for the specific employee
  // Assuming your route path is something like /employee-contract/:employeeId
  navigate(`/EmployeeContract/${employeeId}`);
};


  const handleAddContract = () => {
    console.log('Employee ID:', employeeId);
    navigate(`/add-contract/${employeeId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setIsError(false);
    setFeedbackMessage('');
  
    const contractData = {
      grossAmount,
      startDate,
      endDate,
      stanowisko,
      etat,
      typ_umowy,
      workstart_date,
      period_próbny
    };
    console.log('Updating contract data:', contractData);
    
    // Check for overlapping contracts if it's a new contract
    if (!contractId) {
      const isOverlapping = await checkForOverlappingContracts(startDate, endDate);
      if (isOverlapping) {
        setFeedbackMessage('There is already a contract for the selected period.');
        setIsError(true);
        setIsSubmitting(false);
        return;
      }
    }
  
    try {
      let response;
      if (contractId) {
        // Update existing contract
        response = await axiosInstance.put(`http://localhost:3001/api/contracts/${contractId}`, contractData, {
          headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'X-Schema-Name': user.schemaName // Include the schema name in the request headers
          }
      });
        setFeedbackMessage('Contract updated successfully.');
        setIsSubmitting(false); // Re-enable the button only for updates
      } else {
        // Add new contract
        response = await axiosInstance.post(`http://localhost:3001/employees/${employeeId}/add-contract`, contractData, {
          headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'X-Schema-Name': user.schemaName // Include the schema name in the request headers
          }
      });
        setFeedbackMessage('Contract added successfully.');
        setContract(response.data.contract);
        markStepAsCompleted(3); // Mark the "Add Employees" step as completed
  nextStep(); // Move to the next step
  setcontractAdded(true); 
      }
  
      // Handle response for both adding and updating
      console.log('Contract operation successful:', response.data);
  
    
  
       
  
      // Clear form fields after adding a new contract
      if (!contractId) {
        setGrossAmount('');
        setStartDate('');
        setEndDate('');
        setstanowisko('');
        setetat('');
        settyp_umowy('');
        setworkstart_date('');
        setperiod_próbny('');
      }
    } catch (error) {
      console.error('Error in contract operation:', error);
      setIsError(true);
      setIsSubmitting(false); // Re-enable the submit button after submission
    }
    
  };

  // Function to check for overlapping contracts
  const checkForOverlappingContracts = async (newStart, newEnd) => {
    try {
      const response = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeId}`,{
        headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName // Include the schema name in the request headers
        }
    });
      return response.data.contracts.some(contract => {
        const start = new Date(contract.contract_from_date);
        const end = new Date(contract.contract_to_date);
        return (new Date(newStart) <= end && new Date(newEnd) >= start);
      });
    } catch (error) {
      console.error('Error checking overlapping contracts:', error);
      return false;
    }
  };

  const handleGrossAmountChange = (event) => {
    setGrossAmount(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
  
    // Optionally set workstart_date to startDate if it's earlier
    if (new Date(workstart_date) < new Date(newStartDate)) {
      setworkstart_date(newStartDate);
    }
  };
  
  const handleWorkStartDateChange = (event) => {
    const newWorkStartDate = event.target.value;
  
    // Only update workstart_date if it's the same or later than startDate
    if (new Date(newWorkStartDate) >= new Date(startDate)) {
      setworkstart_date(newWorkStartDate);
    } else {
      // If the selected date is earlier, revert to the startDate
      setworkstart_date(startDate);
    }
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleStanowisko = (event) => {
    setstanowisko(event.target.value);
  };
  const handleetat = (event) => {
    setetat(event.target.value);
  };
  const handletyp_umowy = (event) => {
    settyp_umowy(event.target.value);
  };
  const handleworkstart_date = (event) => {
    setworkstart_date(event.target.value);
  };
  const handleperiod_próbny = (event) => {
    setperiod_próbny(event.target.value);
  };
  return (
    <div>
      <div className="bg-gray-100 min-h-screen p-8">
      {isInSetupProcess && <StepIndicator steps={steps} currentStep={currentStep} />}
      {isInSetupProcess && <StepIndicator steps={steps} isCurrentStepCompleted={contractAdded} />}
      {/* Dynamically set the page title */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2  className="text-2xl font-semibold mb-6">{isEditMode ? 'Edytuj umowę o pracę' : 'Dodaj umowę o pracę'} dla pracownika: {employeeId}{employeeName}</h2>
      {feedbackMessage && (
        <div className={`mb-4 p-4 rounded ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
          {feedbackMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
      <div className="flex flex-wrap -mx-2">
            <div className="w-full px-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">Gross Amount:</label>
        <input 
        type="text" 
        value={grossAmount} 
        onChange={handleGrossAmountChange} 
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="w-1/2 px-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">Start Date:</label>
<input 
  type="date" 
  value={startDate} 
  onChange={handleStartDateChange} 
  disabled={isEditMode && isAneksPresent} 
  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
/>
</div>
<div className="w-1/2 px-2 mb-4">
<label className="block text-sm font-medium text-gray-700">End Date:</label>
<input 
  type="date" 
  value={endDate} 
  onChange={handleEndDateChange} 
  disabled={isEditMode && isAneksPresent} 
  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
/>
</div>
<div className="w-full px-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">Stanowisko:</label>
        <input type="text" value={stanowisko} onChange={handleStanowisko} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"  />
</div>
<div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Etat:</label>
<select value={etat} onChange={handleetat} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
<option value="" disabled hidden>wybierz wielkość etatu</option>
  <option value="1/1">1/1</option>
  <option value="1/2">1/2</option>
  <option value="1/3">1/3</option>
  <option value="1/4">1/4</option>
  <option value="2/3">2/3</option>  
  <option value="3/4">3/4</option>
  <option value="1/8">1/8</option>
  <option value="3/8">3/8</option>
  <option value="7/8">7/8</option>
</select>
</div>

<div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Typ umowy:</label>
<select value={typ_umowy} onChange={handletyp_umowy} disabled={isEditMode && isAneksPresent} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
<option value="" disabled hidden>wybierz typ umowy</option>
  <option value="próbny 1 miesiąc">okres próbny 1 miesiąc</option>
  <option value="próbny 2 miesiące">okres próbny 2 miesiące</option>
  <option value="próbny 3 miesiące">okres próbny 3 miesiące</option>
  <option value="określony">czas określony</option>
  <option value="nieokreślony">czas nieokreślony</option>
</select>
</div>
<div className="w-full px-2 mb-4">
{typ_umowy === 'próbny 1 miesiąc' && (
    <div>
        <label className="block text-sm font-medium text-gray-700">Długość okresu umowy po okresie próbnym:</label>
        <p>okres krótszy niż 6 miesięcy</p>
    </div>
)}
{typ_umowy === 'próbny 2 miesiące' && (
    <div>
        <label className="block text-sm font-medium text-gray-700">Długość okresu umowy po okresie próbnym:</label>
        <p>okres od 6 do 12 mcy</p>
    </div>
)}
{typ_umowy === 'próbny 3 miesiące' && (
    <div>
        <label className="block text-sm font-medium text-gray-700">Długość okresu umowy po okresie próbnym:</label>
        <p>powyżej 12 mcy lub czas nieokreślony</p>
    </div>
)}
</div>
{['próbny 1 miesiąc', 'próbny 2 miesiące', 'próbny 3 miesiące'].includes(typ_umowy) && (
  <div className="w-full px-2 mb-4">
    <label className="block text-sm font-medium text-gray-700">
      Wpisz długość okresu umowy po okresie próbnym (ilość miesięcy):
    </label>
    <input 
      type="text" 
      value={period_próbny} 
      onChange={handleperiod_próbny} 
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
)}

        

        <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Dzień rozpoczęcia pracy:</label>
        <input type="date" value={workstart_date} onChange={handleWorkStartDateChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
</div>
</div>
<div className="flex gap-2 mb-2">
        <button className={`inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}  type="submit" disabled={isSubmitting}>
          {isEditMode ? 'Update Contract' : 'Add Contract'}
        </button>
        
        
        
      
      <button className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"onClick={viewEmployeeContract}>View Contract</button>
      <button className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"  onClick={handleBackClick}>Back</button>
      
      </div>
      </form>
      {contract && (
  <div>
    <h2>{isEditMode ? 'Contract Updated Successfully!' : 'Contract Created Successfully!'}</h2>
    <p>Contract ID: {contract.id}</p>
    <p>Employee ID: {contract.employee_id}</p>
    <p>Gross Amount: {contract.gross_amount}</p>
    <p>Start Date: {contract.contract_from_date}</p>
    <p>End Date: {contract.contract_to_date}</p>
    <p>Stanowisko: {contract.stanowisko}</p>
    <p>Etat: {contract.etat}</p>
    <p>Workstart Date: {contract.workstart_date}</p>
    <p>Typ Umowy: {contract.typ_umowy}</p>
    <p>Dł umowy po okresie próbnym: {contract.period_próbny}</p>
  </div>
)}


    </div>
    </div>
    </div>
    
  );
}

export default AddContractForm;
