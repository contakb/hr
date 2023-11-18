import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

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



    
  
  const navigate = useNavigate();

  const { employeeId } = useParams();

  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
        try {
            const employeeResponse = await axios.get(`http://localhost:3001/api/employees/${employeeId}`);
            const contractResponse = await axios.get(`http://localhost:3001/api/contracts/${employeeId}`);

            console.log("Contracts fetched:", contractResponse.data.contracts);

            setEmployee(employeeResponse.data.employee);
            setContracts(contractResponse.data.contracts);

          
        

            const state = location.state || {};
            const newContractId = state.newContractId;

            let selectedContract;
            if (newContractId) {
                selectedContract = contractResponse.data.contracts.find(contract => contract.id === newContractId);
                setSelectedContractId(newContractId);
            } else if (contractResponse.data.contracts.length > 0) {
                selectedContract = contractResponse.data.contracts[0];
                setSelectedContractId(selectedContract.id);
            } else {
                setSelectedContractId(null);
            }

            // Check if the contract is already terminated
            if (selectedContract && (selectedContract.termination_type || selectedContract.termination_date || selectedContract.deregistration_code)) {
                setIsTerminated(true);
            } else {
                setIsTerminated(false);
            }

            console.log("Employee fetched:", employeeResponse.data.employee);
            console.log("Contracts fetched:", contractResponse.data.contracts);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    fetchData();
}, [employeeId, location]);


    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const handleContractSelection = (e) => {
    const selectedId = e.target.value;
    console.log("Contract Selected:", selectedId);
    setSelectedContractId(selectedId);
};
// Function to toggle the document visibility
const toggleDocumentVisibility = () => {
    setShowDocument(!showDocument);
  };
  
  

const handleTerminationTypeChange = (e) => {
    setTerminationType(e.target.value);

    // Reset terminationDate if termination type is 'za wypowiedzeniem'
    if (e.target.value === 'za wypowiedzeniem') {
        setTerminationDate(terminationEndDate);
    } else {
        setTerminationDate(''); // Clear the termination date for other types
    }
};

useEffect(() => {
    if (terminationType === 'with_notice') {
        setTerminationDate(terminationEndDate);
    }
}, [terminationEndDate, terminationType]);


// Function to render the appropriate document based on the termination type
const renderTerminationDocument = () => {
    switch(terminationType) {
      case 'mutual_agreement':
        return renderMutualAgreementDocument();
      case 'with_notice':
        // Add more cases as needed
        return renderNoticeOfTerminationDocument();
      // ... other cases ...
      default:
        return <p>Select a termination type to view the document.</p>;
    }
  };

// Function to render the Mutual Agreement Document
const renderMutualAgreementDocument = () => {
    return (
      <div>
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
          <p>Z dniem {terminationDate} r. strony zgodnie postanawiają, za porozumieniem stron, rozwiązać umowę zawartą  w dniu {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} </p>
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
  };
  
  // Function to render the Notice of Termination Document
  const renderNoticeOfTerminationDocument = () => {
    return (
      <div>
        <h2>Wypowiedzenie Umowy o Pracę</h2>
        {/* ... rest of the document with employee and contract data ... */}
      </div>
    );
  };  

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
    
    let finalTerminationDate = terminationDate;
    if (terminationType === 'with_notice') {
        finalTerminationDate = terminationEndDate;
        if (new Date(finalTerminationDate) > new Date(currentContractEndDate)) {
            // Alert or adjust the date
            finalTerminationDate = currentContractEndDate;
        }
    }

    // Construct the payload with the updated data
    const updatedContractData = {
      termination_type: terminationType || null, // Use null as fallback if empty
      termination_date: finalTerminationDate, // Directly use terminationDate
      deregistration_code: deregistrationCode || null,
      initiated_by_employee: initiatedByEmployee || null,
    };
    
    console.log("Submitting Termination for Contract ID:", selectedContractId);
    console.log("Termination Payload:", updatedContractData);
    
    try {
        // Use the `put` method to send a request to your server endpoint
        const response = await axios.put(`http://localhost:3001/api/contracts/${selectedContractId}/terminate`, updatedContractData);
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
  // Find the selected contract and update its end date
  const selectedContract = contracts.find(contract => contract.id === selectedContractId);
  if (selectedContract) {
      setCurrentContractEndDate(selectedContract.contract_to_date);
  }
}, [contracts, selectedContractId]); // Depend on contracts and selectedContractId




// useEffect to update terminationPeriod when contracts change
// Second useEffect Hook
useEffect(() => {
    // This useEffect is now only responsible for setting the termination period
    // for regular contracts based on the total duration
    if (totalDuration > 0) {
        const period = getTerminationPeriod(totalDuration);
        setTerminationPeriod(period);
    }
}, [totalDuration]);



// Helper function to calculate total duration from the earliest contract
const getTotalDuration = (contracts) => {
    if (contracts.length === 0) return 0;

    // Find the earliest contract start date
    const startDates = contracts.map(contract => new Date(contract.contract_from_date));
    const earliestStartDate = new Date(Math.min(...startDates));
    const today = new Date();

    // Calculate total duration in months
    let months;
    months = (today.getFullYear() - earliestStartDate.getFullYear()) * 12;
    months -= earliestStartDate.getMonth();
    months += today.getMonth();

    console.log("Total Duration in Months:", months); // Log to check the calculated months


    return months <= 0 ? 0 : months;
};


// Helper function to determine termination period based on total duration
// Helper function for trial period termination period

// Helper function to determine termination period based on total duration
const getTerminationPeriod = (totalDurationMonths) => {
    if (totalDurationMonths < 6) return '2 weeks';
    else if (totalDurationMonths < 36) return '1 month';
    return '3 months';
}



// useEffect to calculate terminationEndDate
// useEffect to calculate and store initial terminationEndDate
useEffect(() => {
    if (dataWypowiedzenia && terminationPeriod) {
        const endDate = calculateTerminationEndDate(dataWypowiedzenia, terminationPeriod);
        setTerminationEndDate(endDate);
        setInitialTerminationEndDate(endDate); // Store the initially calculated date
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

    return endDate.toISOString().split('T')[0]; // Return the date in YYYY-MM-DD format
};

// ... rest of your code

  
return (
  <div className="contract">
    <div className="header">Umowa o pracę</div>
    {/* Dropdown for selecting a contract */}
    <select onChange={handleContractSelection} value={selectedContractId} required>
  <option value="" disabled={selectedContractId !== ''}>Select a contract</option>
  {contracts.map((contract) => (
    <option key={contract.id} value={contract.id}>
      Contract from {new Date(contract.contract_from_date).toLocaleDateString()} to {new Date(contract.contract_to_date).toLocaleDateString()}
    </option>
  ))}
</select>



    {/* Contract details */}
    {selectedContractId && (
      <div className="contract-details">
        <div className="employee-info">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Surname:</strong> {employee.surname}</p>
          {/* Add more employee information here */}
        </div>
        <div className="contract-terms">
        <form onSubmit={handleSubmitTermination}>
  {/* Termination Type Selection */}
  <label>
    Data rozwiązania umowy:
  <input 
  type="date" 
  name="dataWypowiedzenia" 
  value={dataWypowiedzenia} 
  onChange={(e) => setDataWypowiedzenia(e.target.value)}
/>
 </label>

 <select 
    name="terminationType" 
    value={terminationType} 
    onChange={handleTerminationTypeChange}
>
    <option value="" disabled>Select Termination Type</option>
    <option value="mutual_agreement">Porozumienie stron</option>
    <option value="contract_expiry">Z upływem czasu na jaki została zawarta</option>
    <option value="with_notice">Za wypowiedzeniem</option>
    <option value="without_notice">Bez okresu wypowiedzenia</option>
</select>



{terminationType === 'with_notice' && (
    <>
        {!manualEndDate ? (
            <>
                <p><strong>Zakończenie okresu wypowiedzenia: {terminationEndDate}</strong></p>
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
    <input 
        type="date" 
        name="terminationDate" 
        value={terminationDate} 
        onChange={handleTerminationDateChange}
    />
)}



  {/* Deregistration Code Selection */}
  <select 
    name="deregistrationCode" 
    value={deregistrationCode} 
    onChange={handleDeregistrationCodeChange}
  >
    <option value="" disabled selected>kod zwolnienia</option>
    <option value="100">100 - Ustanie ubezpieczenia</option>
    <option value="500">500 - Zgon os.ub.</option>
    <option value="600">600 - Inna</option>
  </select>

  {/* Checkbox for Initiated by Employee */}
  <label>
    Rozwiązanie stosunku pracy przez pracownika
    <input 
      type="checkbox" 
      name="initiatedByEmployee" 
      checked={initiatedByEmployee} 
      onChange={handleInitiatedByEmployeeChange}
    />
  </label>

  <button type="submit" disabled={isTerminated}>Terminate Contract</button>
  </form>
  <button onClick={toggleDocumentVisibility}>
      {showDocument ? 'Hide Document' : 'Create Document'}
    </button>
    {showDocument && renderTerminationDocument()}

{updateMessage && <div>{updateMessage}</div>}
            <button onClick={handleBackToEmployeeList}>Back to EmployeeList</button>

            
        </div>
      </div>
    )}
    
    <p><button onClick={handleBackClick}>Back</button></p>
  </div>
);
};

export default TerminateContract;
