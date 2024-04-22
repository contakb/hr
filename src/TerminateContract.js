import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary

const TerminateContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [terminationType, setTerminationType] = useState(''); // Adjust initial values as needed
  const [deregistrationCode, setDeregistrationCode] = useState('');
  const [initiatedByEmployee, setInitiatedByEmployee] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(''); // Add this line to define updateMessa
  const [isTerminated, setIsTerminated] = useState(false); // New state to track termination status
  const [showDocument, setShowDocument] = useState(false);
  const [dataWypowiedzenia, setDataWypowiedzenia] = useState(new Date().toISOString().slice(0, 10));
  const [terminationEndDate, setTerminationEndDate] = useState('');
  const [terminationPeriod, setTerminationPeriod] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [manualEndDate, setManualEndDate] = useState(false);
  const [initialTerminationEndDate, setInitialTerminationEndDate] = useState('');
  const [currentContractEndDate, setCurrentContractEndDate] = useState('');
  const componentRef = useRef();
  const user = useRequireAuth();

   



    
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const navigate = useNavigate();

  const { employeeId } = useParams();

  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
        try {
            const [employeeResponse, contractResponse] = await Promise.all([
                axiosInstance.get(`http://localhost:3001/api/employees/${employeeId}`, {
                    headers: { 'Authorization': `Bearer ${user.access_token}`, 'X-Schema-Name': user.schemaName },
                }),
                axiosInstance.get(`http://localhost:3001/api/contracts/${employeeId}`, {
                    headers: { 'Authorization': `Bearer ${user.access_token}`, 'X-Schema-Name': user.schemaName },
                })
            ]);

            if (contractResponse.data.contracts) {
                const combinedContracts = combineContracts(contractResponse.data.contracts);
                const mostRecentContract = combinedContracts.reduce((latest, current) => 
                    new Date(current.contract_to_date) > new Date(latest.contract_to_date) ? current : latest, combinedContracts[0]);
                setContracts(combinedContracts);
                setSelectedContractId(mostRecentContract.id);
                setCurrentContractEndDate(mostRecentContract.contract_to_date);
                updateFormFields(mostRecentContract);
            }
            setEmployee(employeeResponse.data.employee);
        } catch (error) {
            console.error('Error fetching data:', error);
            setContracts([]);
            setEmployee({});
        }
    }
    fetchData();
}, [employeeId, axiosInstance]);



function combineContracts(contracts) {
  let contractMap = new Map();

  contracts.forEach(contract => {
    const originalId = contract.kontynuacja || contract.id;
    
    if (!contractMap.has(originalId)) {
      contractMap.set(originalId, { ...contract });
    } else {
      let existing = contractMap.get(originalId);
      // Ensuring that the original contract_from_date is maintained
      contractMap.set(originalId, {
        ...existing,
        ...contract,
        contract_from_date: existing.contract_from_date, // Preserves the original start date
        contract_to_date: contract.contract_to_date, // Updates to the latest end date from aneks
        gross_amount: contract.gross_amount || existing.gross_amount,
        stanowisko: contract.stanowisko || existing.stanowisko,
        etat: contract.etat || existing.etat,
        typ_umowy: contract.typ_umowy || existing.typ_umowy
      });
    }
  });

  return Array.from(contractMap.values());
}

useEffect(() => {
  // When contracts data is available, determine the most recent contract and update fields accordingly
  if (contracts.length > 0) {
      const mostRecentContract = contracts.reduce((latest, current) => 
          new Date(current.contract_to_date) > new Date(latest.contract_to_date) ? current : latest, contracts[0]);
      setSelectedContractId(mostRecentContract.id);
      setCurrentContractEndDate(mostRecentContract.contract_to_date);
      updateFormFields(mostRecentContract); // Ensure initial setup reflects the correct contract details
  }
}, [contracts]);


// Adjust updateFormFields to handle setting termination date based on contract type and status
function updateFormFields(contract) {
  console.log("Updating form fields with contract:", contract);
  const isContractTerminated = !!contract.termination_type || !!contract.termination_date || !!contract.deregistration_code;
  setIsTerminated(isContractTerminated);
  setTerminationType(contract.termination_type || '');
  setDataWypowiedzenia(contract.termination_date || '');
  setDeregistrationCode(contract.deregistration_code || '');
  setInitiatedByEmployee(!!contract.initiated_by_employee);

  // Decide on the termination date logic based on the state and type of termination
  if (isContractTerminated) {
      // If the contract is terminated, show the termination date if it exists, otherwise show the contract end date
      setTerminationDate(contract.contract_to_date || contract.termination_date);
  } else if (contract.termination_type === 'contract_expiry' || new Date(contract.contract_to_date) < new Date()) {
      // For contracts that are set to expire or have expired without a specific termination action
      setTerminationDate(contract.contract_to_date);
  } else {
      // If none of the above conditions apply, clear the termination date
      setTerminationDate('');
  }
}

function updateTerminationDate(contract, isTerminated) {
  // This function now purely ensures that termination dates are managed correctly without overriding manual inputs.
  if (!isTerminated) {
    if (terminationType !== 'contract_expiry' && terminationType !== 'with_notice') {
      setTerminationDate('');
    }
  }
}








    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const handleContractSelection = (event) => {
  const selectedId = event.target.value;
  setSelectedContractId(selectedId);

  const selectedContract = contracts.find(contract => contract.id.toString() === selectedId);
  if (selectedContract) {
      updateFormFields(selectedContract);
  }
};

// Function to toggle the document visibility
const toggleDocumentVisibility = () => {
    setShowDocument(!showDocument);
  };
  
  
  const handleTerminationTypeChange = (e) => {
    const selectedTerminationType = e.target.value;
    setTerminationType(selectedTerminationType);

    if (selectedTerminationType === 'with_notice') {
        setTerminationDate(terminationEndDate);
    } else if (selectedTerminationType === 'contract_expiry') {
        setTerminationDate(currentContractEndDate);
    } else {
        setTerminationDate('');
    }
};





// Function to render the appropriate document based on the termination type
const renderTerminationDocument = () => {
    switch(terminationType) {
      case 'mutual_agreement':
        return <RenderMutualAgreementDocument ref={componentRef} />;
      case 'with_notice':
        // Add more cases as needed
        return <RenderNoticeOfTerminationDocument ref={componentRef}/>;
      // ... other cases ...
      default:
        return <p>Select a termination type to view the document.</p>;
    }
  };

// Function to render the Mutual Agreement Document
const RenderMutualAgreementDocument = React.forwardRef((props, ref) => {
  return (
  <div ref={ref}>
        <h2>Porozumienie Stron</h2>
          <p>Data: {dataWypowiedzenia}</p>
          <p>This employment contract ("Contract") is entered into on 
           
          na umowę o pracę na: {selectedContract ? selectedContract.typ_umowy : "N/A"} 
          od {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} 
          do {selectedContract && selectedContract.contract_to_date ? new Date(selectedContract.contract_to_date).toLocaleDateString() : "N/A"} 
          </p>
          <p><strong>stanowisko: </strong> {selectedContract?.stanowisko}</p>
          <p><strong>etat: </strong> {selectedContract?.etat}</p>
          <p><strong>okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {selectedContract?.period_próbny} miesiące</p>
          <p><strong>Pracodawca:</strong> Your Company Name, located at Your Company Address</p>
          <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.city}</p>
          <p></p>
          <section>
          <p>Z dniem {selectedContract.contract_to_date} r. strony zgodnie postanawiają, za porozumieniem stron, rozwiązać umowę zawartą  w dniu {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} </p>
          <p><strong> Rozwiązanie umowy o pracę zostało sporządzone w dwóch egzemplarzach po jednym dla każdej ze stron</strong></p>
          </section>

          <section>
        <div className="signatures">
          <p>______________________________</p>
          <p>Employer's Signature</p>
          <p>______________________________</p>
          <p>Employee's Signature</p>
        </div>
        </section>
        </div>
      );
  });
  
  // Function to render the Notice of Termination Document
  const RenderNoticeOfTerminationDocument = React.forwardRef((props, ref) => {
    // Your JSX here
    return (
      <div ref={ref}>
        Za wypowiedzeniem
      </div>
    );
  });  

const handleDeregistrationCodeChange = (e) => {
    setDeregistrationCode(e.target.value);
    console.log("Deregistration Code Changed:", e.target.value);
};

const handleInitiatedByEmployeeChange = (e) => {
    setInitiatedByEmployee(e.target.checked);
    console.log("Initiated By Employee Changed:", e.target.checked);
};

const handleTerminationDateChange = (e) => {
    setTerminationDate(e.target.value);
    console.log("Termination Date Changed:", e.target.value);
};

// Convert selectedContractId to a number for comparison if contract IDs are numbers
const selectedContract = contracts.find(contract => contract.id === Number(selectedContractId));

// ... (inside your component)
console.log("Current terminationDate state:", terminationDate);


const handleSubmitTermination = async (e) => {
    e.preventDefault();
    if (!selectedContractId) {
      console.error('No contract selected');
      return; // Exit the function if no contract is selected
    }
    
    let finalTerminationDate = terminationType === 'with_notice' ? terminationEndDate : terminationDate;
    if (new Date(finalTerminationDate) > new Date(currentContractEndDate)) {
        alert("Termination date cannot extend beyond the current contract end date.");
        return;
    }

    // Construct the payload with the updated data
    const updatedContractData = {
      termination_type: terminationType || null, // Use null as fallback if empty
      termination_date: finalTerminationDate, // Directly use terminationDate
      deregistration_code: deregistrationCode || null,
      initiated_by_employee: initiatedByEmployee || null,
      dataWypowiedzenia

    };
    
    console.log("Submitting Termination for Contract ID:", selectedContractId);
    console.log("Termination Payload:", updatedContractData);
    
    try {
        // Use the `put` method to send a request to your server endpoint
        const response = await axiosInstance.put(`http://localhost:3001/api/contracts/${selectedContractId}/terminate`, updatedContractData, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`, // Use the access token
            'X-Schema-Name': user.schemaName, // Send the schema name as a header
          }
        });
        console.log("Termination Response:", response.data);
        
        // Handle success - maybe navigate back to the employee list or show a success message
        if (response.data.updatedContract) {
          setUpdateMessage('Contract terminated successfully!');
          setIsTerminated(true); // Update termination status
          console.log('Message set:', updateMessage);
          setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
        }
    } catch (error) {
        console.error('Error terminating contract:', error);
        setUpdateMessage('Failed to terminate contract.');
        setTimeout(() => setUpdateMessage(''), 3000);
        // Handle error - show an error message to the user
    }
};

const handleBackToEmployeeList = () => {
    navigate('/employeelist'); // Navigate back to EmployeeList
};

// First useEffect Hook
useEffect(() => {
    const currentContract = contracts[contracts.length - 1]; // Get the most recent contract
    const isTrialPeriod = currentContract && currentContract.typ_umowy && currentContract.typ_umowy.includes('próbny');

    if (isTrialPeriod) {
        switch (currentContract.typ_umowy) {
            case 'próbny 1 miesiąc':
                setTerminationPeriod('3 days');
                break;
            case 'próbny 2 miesiące':
                setTerminationPeriod('1 week');
                break;
            case 'próbny 3 miesiące':
                setTerminationPeriod('2 weeks');
                break;
            default:
                // Handle other trial period types if any
                break;
        }
    } else {
        const duration = getTotalDuration(contracts);
        setTotalDuration(duration);
    }
}, [contracts]);

useEffect(() => {
  const selectedContract = contracts.find(contract => contract.id.toString() === selectedContractId);
  if (selectedContract) {
      setCurrentContractEndDate(selectedContract.contract_to_date);
      setDataWypowiedzenia(selectedContract.termination_date || '');
      updateTerminationDate(selectedContract, isTerminated);

      // Automatically set termination date if the contract has expired
      if (!selectedContract.termination_date) {
          setTerminationDate(selectedContract.contract_to_date);
      }

      console.log("Updated for selected contract:", selectedContract);
  }
}, [contracts, selectedContractId, isTerminated]);




// Helper function to calculate total duration from the earliest contract
const getTotalDuration = (contracts) => {
  if (contracts.length === 0) return 0;

  // Find the earliest contract start date
  const startDates = contracts.map(contract => new Date(contract.contract_from_date));
  const earliestStartDate = new Date(Math.min(...startDates));
  const today = new Date();

  // Calculate total duration in months
  let months = today.getMonth() - earliestStartDate.getMonth() 
               + (12 * (today.getFullYear() - earliestStartDate.getFullYear()));

               console.log("Total Duration in Months:", months); // Log to check the calculated months
  // Ensure the duration is not negative
  return months >= 0 ? months : 0;
};




// Helper function to determine termination period based on total duration
// Helper function for trial period termination period

// Helper function to determine termination period based on total duration
// Inside the useEffect for setting terminationPeriod
useEffect(() => {
  const getTerminationPeriod = (totalDurationMonths, contracts) => {
      const mostRecentContract = contracts[contracts.length - 1];
      const isTrialPeriod = mostRecentContract && mostRecentContract.typ_umowy && mostRecentContract.typ_umowy.includes('próbny');

      let period = '';
      if (isTrialPeriod) {
          switch (mostRecentContract.typ_umowy) {
              case 'próbny 1 miesiąc':
                  period = '3 days';
                  break;
              case 'próbny 2 miesiące':
                  period = '1 week';
                  break;
              case 'próbny 3 miesiące':
                  period = '2 weeks';
                  break;
              default:
                  break; // Default case for trial period contracts
          }
      } else {
          if (totalDurationMonths === 0 || totalDurationMonths < 6) {
              period = '2 weeks'; // This should cover contracts shorter than 6 months
          } else if (totalDurationMonths < 36) {
              period = '1 month';
          } else {
              period = '3 months';
          }
      }
      console.log("Determined Termination Period:", period);
      return period;
  };

  if (totalDuration >= 0) {
      const period = getTerminationPeriod(totalDuration, contracts);
      setTerminationPeriod(period);
  }
}, [totalDuration, contracts]);

// Inside the useEffect for calculating terminationEndDate
useEffect(() => {
  if (dataWypowiedzenia && terminationPeriod) {
      const endDate = calculateTerminationEndDate(dataWypowiedzenia, terminationPeriod);
      setTerminationEndDate(endDate);
      setInitialTerminationEndDate(endDate); // Store the initially calculated termination end date
      console.log("Data Wypowiedzenia:", dataWypowiedzenia, "Termination Period:", terminationPeriod, "Calculated End Date:", endDate);
  }
}, [dataWypowiedzenia, terminationPeriod]);






// Helper function to calculate termination end date based on start date and period
const calculateTerminationEndDate = (startDate, period) => {
    let endDate = new Date(startDate);

    switch (period) {
        case '3 days': {
            let workingDaysCount = 0;
            while (workingDaysCount < 3) {
                endDate.setDate(endDate.getDate() + 1);
                // Check if the day is a working day (not Saturday or Sunday)
                if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
                    workingDaysCount++;
                }
            }
            break;
        }
        case '1 week': {
            // Find the next Saturday
            while (endDate.getDay() !== 6) {
                endDate.setDate(endDate.getDate() + 1);
            }
            // Add 7 days
            endDate.setDate(endDate.getDate() + 7);
            break;
        }
        case '2 weeks': {
            // Find the next Saturday
            while (endDate.getDay() !== 6) {
                endDate.setDate(endDate.getDate() + 1);
            }
            // Add 14 days
            endDate.setDate(endDate.getDate() + 14);
            break;
        }
        case '1 month': {
            // Move to the next month and find the last day
             // Move to the start of the next month
             endDate.setMonth(endDate.getMonth() + 1, 1); 
             // Find the last day of that month
             endDate.setMonth(endDate.getMonth() + 1, 0); 
             break;
        }
        case '3 months': {
            // Move to the start of the next month from the notice date
    endDate.setMonth(endDate.getMonth() + 1, 1); 

    // Then move to the third month from that point
    endDate.setMonth(endDate.getMonth() + 3); 

    // Find the last day of that third month
    endDate.setDate(0); 
    break;
            
    break;
        }
        default:
            // Default logic if needed
    }
    console.log("Start Date:", startDate, "Period:", period, "End Date:", endDate.toISOString().split('T')[0]);
    return endDate.toISOString().split('T')[0]; // Return the date in YYYY-MM-DD format
};

// ... rest of your code
console.log("Current Termination End Date:", terminationEndDate);

  
return (
  <div className="bg-gray-100 p-8">
    <div className="max-w-4xl mx-auto">
    <div className="text-lg font-semibold mb-4">Umowa o pracę</div>
    {/* Dropdown for selecting a contract */}
    <select onChange={handleContractSelection} value={selectedContractId} required className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mb-4">
  <option value="" disabled={selectedContractId !== ''}>Wybierz umowę:</option>
  {contracts.map((contract) => (
    <option key={contract.id} value={contract.id}>
      Na okres: {contract.typ_umowy} from {new Date(contract.contract_from_date).toLocaleDateString()} to {new Date(contract.contract_to_date).toLocaleDateString()}
    </option>
  ))}
</select>



    {/* Contract details */}
    {selectedContractId && (
       <div className="bg-white shadow rounded p-6 mt-4">
       <div className="mb-4">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Surname:</strong> {employee.surname}</p>
          {/* Add more employee information here */}
        </div>
        <form onSubmit={handleSubmitTermination} className="space-y-4">
  {/* Termination Type Selection */}
  <div className="grid grid-cols-2 gap-4">
              <div>
  <label className="block text-sm font-medium text-gray-700"></label>
    Data rozwiązania umowy:
  <input 
  type="date" 
  name="dataWypowiedzenia" 
  value={dataWypowiedzenia} 
  onChange={(e) => setDataWypowiedzenia(e.target.value)}
  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
/>
</div>
 
<div>
                <label className="block text-sm font-medium text-gray-700">Typ rozwiązania umowy:</label>
 <select 
    name="terminationType" 
    value={terminationType} 
    onChange={handleTerminationTypeChange}
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
>
    <option value="" disabled>Wybierz typ rozwiązania</option>
    <option value="mutual_agreement">Porozumienie stron</option>
    <option value="contract_expiry">Z upływem czasu na jaki została zawarta</option>
    <option value="with_notice">Za wypowiedzeniem</option>
    <option value="without_notice">Bez okresu wypowiedzenia</option>
</select>
</div>


{terminationType === 'with_notice' && (
    <>
        {!manualEndDate ? (
            <>
                 <p><strong>Zakończenie okresu wypowiedzenia: {terminationEndDate || 'Not available'}</strong></p>
                {new Date(terminationEndDate) > new Date(currentContractEndDate) && (
                    <p style={{ color: 'red' }}>
                        Note: Termination date adjusted to match contract end date: {currentContractEndDate}
                    </p>
                )}
            </>
        ) : (
            <input 
                type="date" 
                name="manualTerminationDate" 
                value={terminationEndDate} 
                onChange={(e) => setTerminationEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
        )}

        <label>
            Ręczne dostosowanie daty zakończenia umowy:
            <input 
                type="checkbox" 
                checked={manualEndDate} 
                onChange={() => {
                    setManualEndDate(!manualEndDate);
                    if (!manualEndDate) {
                        // Adjust to the initial terminationEndDate or contract end date when checkbox is unchecked
                        const adjustedDate = new Date(initialTerminationEndDate) > new Date(currentContractEndDate) ? currentContractEndDate : initialTerminationEndDate;
                        setTerminationEndDate(adjustedDate);
                    }
                }}
            />
        </label>
    </>
)}

{terminationType !== 'with_notice' && (
  <div>
  <label className="block text-sm font-medium text-gray-700">Dzień zakończenia umowy:</label>
    <input 
        type="date" 
        name="terminationDate" 
        value={terminationDate} 
        onChange={handleTerminationDateChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
    </div>
)}



  {/* Deregistration Code Selection */}
  <div>
                <label className="block text-sm font-medium text-gray-700">kod zwolnienia:</label>
  <select 
    name="deregistrationCode" 
    value={deregistrationCode} 
    onChange={handleDeregistrationCodeChange}
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
  >
    <option value="" disabled selected>wybierz kod zwolnienia</option>
    <option value="100">100 - Ustanie ubezpieczenia</option>
    <option value="500">500 - Zgon os.ub.</option>
    <option value="600">600 - Inna</option>
  </select>
  </div>

  {/* Checkbox for Initiated by Employee */}
  <label>
    Rozwiązanie stosunku pracy przez pracownika
    <input 
      type="checkbox" 
      name="initiatedByEmployee" 
      checked={initiatedByEmployee} 
      onChange={handleInitiatedByEmployeeChange}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
    />
  </label>
  </div>
  <button 
  type="submit" 
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
  >
  {isTerminated ? 'Update Termination' : 'Terminate Contract'}
  </button>
  </form>
  
  <button onClick={toggleDocumentVisibility} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mt-4">
      {showDocument ? 'Hide Document' : 'Create Document'}
    </button>
    {showDocument && renderTerminationDocument()}

     
    
        {showDocument && (
            <button onClick={handlePrint}>Save as PDF</button>
        )}

{updateMessage && <div>{updateMessage}</div>}
            <button onClick={handleBackToEmployeeList} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">Back to EmployeeList</button>
            
            
        </div>
      
    )}
    <p><button onClick={handleBackClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">Back</button></p>
    
  </div>
  </div>
);
};

export default TerminateContract;
