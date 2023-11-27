import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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


  
   // Check if we are in edit mode (contractId is present)
   const isEditMode = !!contractId;
  // Load contract data if contractId is provided
  useEffect(() => {
    if (contractId) {
      axios.get(`http://localhost:3001/api/empcontracts/${contractId}`)
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
      const response = await axios.post('http://localhost:3001/api/aneks', {
        originalContractId: contractId,
        aneksData: updatedFields
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
  
  return (
    <div>
      {/* Dynamically set the page title */}
      <h2>Aneks do umowy</h2>
      {feedbackMessage && (
        <div style={{ color: isError ? 'red' : 'green' }}>
          {feedbackMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
      <div>
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
