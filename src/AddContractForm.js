import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AddContractForm() {
  const { employeeId } = useParams();
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

    try {
      const response = await axios.post(`http://localhost:3001/employees/${employeeId}/add-contract`, {
        grossAmount,
        startDate,
        endDate,
        stanowisko,
        etat,
        typ_umowy,
        workstart_date,
        period_próbny
        
      });
      // Update the contract state with the returned data
setContract(response.data.contract);

      // Handle successful contract addition
      console.log('Contract added:', response.data.contract);

      // Clear form fields
      setGrossAmount('');
      setStartDate('');
      setEndDate('');
      setstanowisko('');
      setetat('');
      settyp_umowy('');
      setworkstart_date('');
      setperiod_próbny('');
    } catch (error) {
      // Handle contract addition error
      console.error('Error adding contract:', error);
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
      <h2>Add Contract</h2>
      <form onSubmit={handleSubmit}>
        <label>Gross Amount:</label>
        <input type="text" value={grossAmount} onChange={handleGrossAmountChange} />

        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={handleEndDateChange} />

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
<select value={typ_umowy} onChange={handletyp_umowy}>
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

        <button type="submit">Add Contract</button>
        
      </form>
      <button onClick={viewEmployeeContract}>View Contract</button>
      {contract && (
  <div>
    <h2>Contract Created Successfully!</h2>
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
<p><button onClick={viewEmployeeContract}>View Contract</button></p>
<p><button onClick={handleBackClick}>Back</button></p>
    </div>
    
  );
}

export default AddContractForm;
