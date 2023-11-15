import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const TerminateContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  
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
  
        if (newContractId) {
          setSelectedContractId(newContractId);
        } else if (contractResponse.data.contracts.length > 0) {
          setSelectedContractId(contractResponse.data.contracts[0].id);
        } else {
          setSelectedContractId(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  }, [employeeId, location]); // This is where useEffect should e

    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const handleContractSelection = (e) => {
  setSelectedContractId(e.target.value);
};

const handleTerminationDateChange = (e) => {
    setTerminationDate(e.target.value);
  };

  const handleSubmitTermination = async () => {
    // Logic to submit termination
    // Make sure to validate termination conditions
  };

// Convert selectedContractId to a number for comparison if contract IDs are numbers
const selectedContract = contracts.find(contract => contract.id === Number(selectedContractId));


return (
  <div className="contract">
    <div className="header">Umowa o pracę</div>
    {/* Dropdown for selecting a contract */}
    <select onChange={handleContractSelection} value={selectedContractId}>
      {contracts.map((contract) => (
        <option key={contract.id} value={contract.id}>
          Contract from {new Date(contract.contract_from_date).toLocaleDateString()} to {new Date(contract.contract_to_date).toLocaleDateString()}
        </option>
      ))}
    </select>

    {/* Contract details */}
    {selectedContract ? (
      <div className="contract-details">
        <div className="employee-info">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Surname:</strong> {employee.surname}</p>
          {/* Add more employee information here */}
        </div>
        <div className="contract-terms">
          <h2>Warunki umowy</h2>
          <p>This employment contract ("Contract") is entered into on 
          {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} 
          na umowę o pracę na: {selectedContract ? selectedContract.typ_umowy : "N/A"} 
          od {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} 
          do {selectedContract && selectedContract.contract_to_date ? new Date(selectedContract.contract_to_date).toLocaleDateString() : "N/A"} 
          </p>
          <p><strong>stanowisko: </strong> {selectedContract?.stanowisko}</p>
          <p><strong>etat: </strong> {selectedContract?.etat}</p>
          <p><strong>okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {selectedContract?.period_próbny} miesiące</p>
          <p><strong>Pracodawca:</strong> Your Company Name, located at Your Company Address</p>
          <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.city}</p>
        </div>
        <div className="signatures">
          <p>______________________________</p>
          <p>Employer's Signature</p>
          <p>______________________________</p>
          <p>Employee's Signature</p>
        </div>
      </div>
    ) : (
      <p>No contract selected.</p>
    )}
    <p><button onClick={handleBackClick}>Back</button></p>
  </div>
);
};

export default TerminateContract;
