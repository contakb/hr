import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const EmployeeContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
  
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

  const fetchCompanyData = () => {
    axios.get('http://localhost:3001/api/created_company')
      .then(response => {
        if (response.data && response.data.company_id) {
          setCompanyData(response.data);
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
          setError('No existing company data found. Please fill out the form to create a new company.');
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
          <p><strong>wynagrodzenie brutto: </strong> {selectedContract?.gross_amount}</p>
          <p><strong>okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {selectedContract?.period_próbny} miesiące</p>
          <p><strong>Pracodawca: </strong>{companyData.company_name}  <p><strong>ul:</strong> {companyData.street} {companyData.number} {companyData.post_code} {companyData.city} {companyData.country} </p></p>,
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

export default EmployeeContract;
