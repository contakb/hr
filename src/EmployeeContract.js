import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Login.css';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
import { useRequireAuth } from './useRequireAuth';

const EmployeeContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [userInput, setUserInput] = useState(''); // State to hold the user input
  
  const navigate = useNavigate();

  const { employeeId } = useParams();

  const location = useLocation();
  const user = useRequireAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const employeeResponse = await axios.get(`http://localhost:3001/api/employees/${employeeId}`);
        const contractResponse = await axios.get(`http://localhost:3001/api/contracts/${employeeId}`);
  
        console.log("Contracts fetched:", contractResponse.data.contracts);
  
        setEmployee(employeeResponse.data.employee);
        setContracts(contractResponse.data.contracts);

          // Assuming contractResponse.data.contracts is an array of contracts
        const combinedContracts = combineContracts(contractResponse.data.contracts);
        setContracts(combinedContracts);
  
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

  const fetchCompanyData = async () => {
    axiosInstance.get('http://localhost:3001/api/created_company')
      .then(response => {
          const company = response.data.length > 0 ? response.data[0] : null;
          if (company && company.company_id) {
              setCompanyData(company);
              setError(''); // Clear any previous error messages
          } else {
              setCompanyData(null); // Set to null if no data is returned
          }
          setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching company data:', error);
        // Check if the error is due to no data found and set an appropriate message
        if (error.response && error.response.status === 404) {
          setError('Nie odnaleziono danych firmy. Proszę uzupełnić poniższe dane.');
        } else {
          setError('Failed to fetch company data.');
        }
  
        setCompanyData(null); // Set companyData to null when fetch fails
        setIsLoading(false);
      });
  };
  
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleInputChange = (event) => {
    setUserInput(event.target.value); // Update the state when the input changes
  };

    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

const handleContractSelection = (e) => {
  setSelectedContractId(e.target.value);
};

// Convert selectedContractId to a number for comparison if contract IDs are numbers
const selectedContract = contracts.find(contract => contract.id === Number(selectedContractId));

function combineContracts(contracts) {
  // Sort contracts by contract_from_date in ascending order
  contracts.sort((a, b) => new Date(a.contract_from_date) - new Date(b.contract_from_date));

  let contractMap = new Map();

  contracts.forEach(contract => {
    const originalId = contract.kontynuacja || contract.id;

    if (!contract.kontynuacja) {
      // Original contract
      contractMap.set(originalId, {
        ...contract,
        latestEndDate: contract.contract_to_date
      });
    } else {
      // Aneks
      const existing = contractMap.get(originalId);
      contractMap.set(originalId, {
        ...existing,
        latestEndDate: contract.contract_to_date,
        stanowisko: existing?.stanowisko || contract.stanowisko,
        etat: existing?.etat || contract.etat,
      });
    }
  });

  return Array.from(contractMap.values()).map(contract => ({
    ...contract,
    contract_to_date: contract.latestEndDate
  }));
}







return (
 
  <div class="contract-container">

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
      <header class="header">
         <div class="signature-area">
    <div class="signature">
        <p>{companyData.company_name}  <p><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country} </p></p>
          <p><strong>NIP: </strong> {companyData.taxid}</p>
         
          {/* Add more employee information here */}
        </div>
        <div class="signature">
      <p>{companyData.city}, dnia {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} </p>
    </div>
    </div>
    <div class="contract-section">
    <h1 class="contract-title">Umowa o pracę</h1>
          <p>Zawarta w dniu: {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}  
          <p><strong>pomiędzy: </strong></p>
          <p><strong>Pracodawca: </strong>{companyData.company_name}  <p><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country} </p></p>
          <p><strong>NIP: </strong> {companyData.taxid}</p>
          <p>                                          </p>
          <p><strong>reprezentowaną przez: 
      <input
        type="text"
        id="userInputField"
        value={userInput}
        onChange={handleInputChange}
        placeholder="wprowadz osobę reprezentującą firmę przy podpisaniu umowy"
      /> </strong></p>
          <p><strong>a Panią/Panem </strong></p>
          <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.postcode} {employee.city}</p>
          <div class="contract-terms">
          na umowę o pracę na: <strong>{selectedContract ? selectedContract.typ_umowy : "N/A"} </strong>
          od {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} do {selectedContract && selectedContract.contract_to_date ? new Date(selectedContract.contract_to_date).toLocaleDateString() : "N/A"} 
          </div></p>
          <p><strong>1. Strony ustalają następujące warunki zatrudnienia. </strong> </p>
          <p><strong>- rodzaj umówionej pracy (stanowisko): </strong> {selectedContract?.stanowisko}</p>
          <p><strong>- miejsce wykonywania pracy: </strong><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country} </p>
          <p><strong>- wymiar czasu pracy (etat): </strong> {selectedContract?.etat}</p>
          <p><strong>- miesięczne wynagrodzenie brutto: </strong> {selectedContract?.gross_amount} zł</p>
          <p><strong>- termin rozpoczęcia pracy: </strong> {selectedContract?.workstart_date}</p>
          <p><strong>- okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {selectedContract?.period_próbny} miesiące</p>
          
          </div>
          
          <div class="signature-area">
      <div class="signature">
        <p>Employee Signature</p>
        <div class="signature-line"></div>
        <p>Name: [Employee Name]</p>
      </div>
      <div className="signature" >
        <p>Company Representative Signature</p>
        <div class="signature-line"></div>
        <p>Name: [Company Representative Name]</p>
      </div>
      
    </div>
    </header>
    ) : (
      <p>No contract selected.</p>
    )}
    <p><button onClick={handleBackClick}>Back</button></p>
  </div>

);
};

export default EmployeeContract;
