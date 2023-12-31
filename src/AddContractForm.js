import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AddContractForm() {
  const { employeeId, contractId } = useParams();
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


  
   // Check if we are in edit mode (contractId is present)
   const isEditMode = !!contractId;
  // Load contract data if contractId is provided
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (contractId) {
        try {
          // Fetch the contract being edited
          const contractResponse = await axios.get(`http://localhost:3001/api/empcontracts/${contractId}`);
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
        const allContractsResponse = await axios.get(`http://localhost:3001/api/contracts/${contract.employee_id}`);
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
        response = await axios.put(`http://localhost:3001/api/contracts/${contractId}`, contractData);
        setFeedbackMessage('Contract updated successfully.');
        setIsSubmitting(false); // Re-enable the button only for updates
      } else {
        // Add new contract
        response = await axios.post(`http://localhost:3001/employees/${employeeId}/add-contract`, contractData);
        setFeedbackMessage('Contract added successfully.');
        setContract(response.data.contract);
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
      const response = await axios.get(`http://localhost:3001/api/contracts/${employeeId}`);
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
    setStartDate(event.target.value);
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
      {/* Dynamically set the page title */}
      <h2>{isEditMode ? 'Edit Contract' : 'Add Contract'}</h2>
      {feedbackMessage && (
        <div style={{ color: isError ? 'red' : 'green' }}>
          {feedbackMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>Gross Amount:</label>
        <input type="text" value={grossAmount} onChange={handleGrossAmountChange} />

        <label>Start Date:</label>
<input 
  type="date" 
  value={startDate} 
  onChange={handleStartDateChange} 
  disabled={isEditMode && isAneksPresent} 
/>

<label>End Date:</label>
<input 
  type="date" 
  value={endDate} 
  onChange={handleEndDateChange} 
  disabled={isEditMode && isAneksPresent} 
/>


        <label>Stanowisko:</label>
        <input type="text" value={stanowisko} onChange={handleStanowisko} />

        <label>Etat:</label>
<select value={etat} onChange={handleetat}>
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


<label>Typ umowy:</label>
<select value={typ_umowy} onChange={handletyp_umowy} disabled={isEditMode && isAneksPresent}>
<option value="" disabled hidden>wybierz typ umowy</option>
  <option value="próbny 1 miesiąc">okres próbny 1 miesiąc</option>
  <option value="próbny 2 miesiące">okres próbny 2 miesiące</option>
  <option value="próbny 3 miesiące">okres próbny 3 miesiące</option>
  <option value="określony">czas określony</option>
  <option value="nieokreślony">czas nieokreślony</option>
</select>

{typ_umowy === 'próbny 1 miesiąc' && (
    <div>
        <label>Długość okresu umowy po okresie próbnym:</label>
        <p>okres krótszy niż 6 miesięcy</p>
    </div>
)}
{typ_umowy === 'próbny 2 miesiące' && (
    <div>
        <label>Długość okresu umowy po okresie próbnym:</label>
        <p>okres od 6 do 12 mcy</p>
    </div>
)}
{typ_umowy === 'próbny 3 miesiące' && (
    <div>
        <label>Długość okresu umowy po okresie próbnym:</label>
        <p>powyżej 12 mcy lub czas nieokreślony</p>
    </div>
)}
{['próbny 1 miesiąc', 'próbny 2 miesiące', 'próbny 3 miesiące'].includes(typ_umowy) && (
    <div>
<label>Wpisz długość okresu umowy po okresie próbnym (ilość miesięcy):</label> 
<input type="text" value={period_próbny} onChange={handleperiod_próbny}/>
</div>
)}
        

        <label>Dzień rozpoczęcia pracy:</label>
        <input type="date" value={workstart_date} onChange={handleworkstart_date} />

        <button type="submit" disabled={isSubmitting}>
          {isEditMode ? 'Update Contract' : 'Add Contract'}
        </button>
        
      </form>
      <button onClick={viewEmployeeContract}>View Contract</button>
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

<p><button onClick={handleBackClick}>Back</button></p>
    </div>
    
  );
}

export default AddContractForm;
