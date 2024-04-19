import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
import { useRequireAuth } from './useRequireAuth';

function Aneks() {
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
  const [employee_id, setEmployeeId] = useState(''); // Initialize employee_id state
  const [showGrossAmount, setShowGrossAmount] = useState(false);
const [showStanowisko, setShowStanowisko] = useState(false);
const [showEtat, setShowEtat] = useState(false);
const [relatedContracts, setRelatedContracts] = useState([]);
const { user, updateUserContext } = useUser();


  
   // Check if we are in edit mode (contractId is present)
   const isEditMode = !!contractId;
  // Load contract data if contractId is provided
  useEffect(() => {
    if (contractId) {
      axiosInstance.get(`http://localhost:3001/api/empcontracts/${contractId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
        }
      })
        .then(response => {
          const contract = response.data;
          setGrossAmount(contract.gross_amount);
          setStartDate(contract.contract_from_date);
          setEndDate(contract.contract_to_date);
          setstanowisko(contract.stanowisko);
          setetat(contract.etat);
          settyp_umowy(contract.typ_umowy);
          setworkstart_date(contract.workstart_date);
          setEmployeeId(contract.employee_id);
          // Set other fields as needed
        })
        .catch(error => console.error('Error fetching contract:', error));
    }
  }, [contractId]);
  
  
  // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const viewEmployeeContract = () => {
  // You can navigate to the EmployeeContract page for the specific employee
  // Assuming your route path is something like /employee-contract/:employeeId
  navigate(`/Aneks/${employeeId}`);
};

const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    setFeedbackMessage('');
  
    let updatedFields = {
      contract_from_date: startDate, // This field is always included
      employee_id: employeeId,      // Assuming this is always needed
    };
  
    if (showGrossAmount) updatedFields.gross_amount = grossAmount;
    if (showStanowisko) updatedFields.stanowisko = stanowisko;
    if (showEtat) updatedFields.etat = etat;
  
    try {
      const response = await axiosInstance.post('http://localhost:3001/api/aneks', 
      {
        originalContractId: contractId,
        aneksData: updatedFields,
      }, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
        }
      });
  
      setFeedbackMessage('Aneks added successfully.');
      setContract(response.data.aneksContract);
    } catch (error) {
      console.error('Error in aneks operation:', error);
      setIsError(true);
      setFeedbackMessage('Error in creating aneks.');
    } finally {
      setIsSubmitting(false);
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

  const fetchRelatedContracts = async (employeeId) => {
    try {
      const response = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
        }
      });
      return response.data.contracts;
    } catch (error) {
      console.error('Error fetching related contracts:', error);
      throw error;
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const contracts = await fetchRelatedContracts(employeeId);
        console.log('Contract ID:', contractId, typeof contractId);


        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
          setGrossAmount(contract.gross_amount);
          setStartDate(contract.contract_from_date);
          setEndDate(contract.contract_to_date);
          setstanowisko(contract.stanowisko);
          setetat(contract.etat);
          settyp_umowy(contract.typ_umowy);
          setworkstart_date(contract.workstart_date);
          setEmployeeId(contract.employee_id);
          // Set other fields as needed
          
        }
        
      } catch (error) {
        console.error('Error fetching contract data:', error);
        // Handle error
      }
    };
    console.log('Contract IDs in relatedContracts:', relatedContracts.map(contract => contract.id));

  
    if (contractId && employeeId) {
      fetchData();
    }
  }, [contractId, employeeId]);
  

  const handleDeleteAneks = async () => {
    const userConfirmed = window.confirm("Are you sure you want to delete this annex?");
    if (!userConfirmed) return;
  
    console.log('Attempting to delete annex with ID:', contractId);
  
    try {
      // Log to check the type and value of contractId
      console.log('Contract ID:', contractId, typeof contractId);
  
      const relatedContracts = await fetchRelatedContracts(employeeId);
  
      // Log to check all contract IDs in relatedContracts
      console.log('Contract IDs in relatedContracts:', relatedContracts.map(contract => contract.id));
  
      // Convert contractId to a number if it's a string
      const numericContractId = Number(contractId);
      const currentContract = relatedContracts.find(contract => contract.id === numericContractId);
  
      // Log to check the found currentContract
      console.log('Current Contract:', currentContract);
  
      if (!currentContract) {
        alert("Error: Contract not found.");
        return;
      }
  
      if (currentContract.kontynuacja === null) {
        alert("This contract cannot be deleted because it is not an annex.");
        return;
      }
  
      await axiosInstance.delete(`http://localhost:3001/api/contracts/${contractId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
          'X-Schema-Name': user.schemaName // Pass the schemaName as a custom header
        }
      });
      setFeedbackMessage('Annex deleted successfully.');
      // Redirect or update UI as needed
    } catch (error) {
      console.error('Error deleting annex:', error);
      setIsError(true);
      setFeedbackMessage('Error in deleting annex.');
    }
  };
  
  
  
  
  
  
  return (
    <div>
      {/* Dynamically set the page title */}
      <h2>Skasuj aneks</h2>
      <p>Anuluj aktualny aneks nr {contractId} z dnia {startDate}</p>
      <button onClick={handleDeleteAneks}>Skasuj</button>
      {feedbackMessage && (
        <div style={{ color: isError ? 'red' : 'green' }}>
          {feedbackMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
      <div>
      <h2>Dodaj nowy aneks do umowy</h2>
    <label>Data obowiązywania zmiany:</label>
    <input 
      type="date" 
      value={startDate} 
      onChange={handleStartDateChange} 
    />
  </div>
  <div>
    <label>
      <input 
        type="checkbox" 
        checked={showGrossAmount} 
        onChange={() => setShowGrossAmount(!showGrossAmount)} 
      />
      Gross Amount
    </label>
    {showGrossAmount && (
      <div>
        <label>Gross Amount:</label>
        <input 
          type="text" 
          value={grossAmount} 
          onChange={handleGrossAmountChange} 
        />
      </div>
    )}
  </div>

  <div>
    <label>
      <input 
        type="checkbox" 
        checked={showStanowisko} 
        onChange={() => setShowStanowisko(!showStanowisko)} 
      />
      Stanowisko
    </label>
    {showStanowisko && (
      <div>
        <label>Stanowisko:</label>
        <input 
          type="text" 
          value={stanowisko} 
          onChange={handleStanowisko} 
        />
      </div>
    )}
  </div>

  <div>
    <label>
      <input 
        type="checkbox" 
        checked={showEtat} 
        onChange={() => setShowEtat(!showEtat)} 
      />
      Etat
    </label>
    {showEtat && (
      <div>
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
</div>
    )}
  </div>


        <button type="submit" disabled={isSubmitting}>
          Zapisz aneks
        </button>
        
      </form>
      <button onClick={viewEmployeeContract}>Wyświetl aneks</button>
      
      {contract && (
  <div>
    <h2>Aneks przygotowany Successfully!</h2>
    <p>Contract ID: {contract.id}</p>
    <p>Employee ID: {contract.employee_id}</p>
    <p>Gross Amount: {contract.gross_amount}</p>
    <p>Data zmiany: {contract.contract_from_date}</p>
    <p>Stanowisko: {contract.stanowisko}</p>
    <p>Etat: {contract.etat}</p>
  </div>
)}

<p><button onClick={handleBackClick}>Back</button></p>
    </div>
    
  );
}

export default Aneks;
