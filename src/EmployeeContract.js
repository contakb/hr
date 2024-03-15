import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Login.css';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
import { useRequireAuth } from './useRequireAuth';
import './print.css'; // Adjust the path to where you saved the CSS file


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
  
  <div class="bg-white p-8">
 <div class="max-w-2xl mx-auto">
    {/* Dropdown for selecting a contract */}
    <div class="mb-4">
      <select class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              onChange={handleContractSelection} value={selectedContractId}>
        {contracts.map((contract) => (
          <option key={contract.id} value={contract.id}>
            Contract from {new Date(contract.contract_from_date).toLocaleDateString()} to {new Date(contract.contract_to_date).toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
    <div class="printable-section">
    <div class="contract-container bg-100 p-4 rounded-lg shadow">
    {/* Contract details */}
    {selectedContract ? (
      <div class="border border-gray-300 p-4">
        <header class="header mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p>{companyData.company_name}</p>
              <p><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country}</p>
              <p><strong>NIP:</strong> {companyData.taxid}</p>
            </div>
            <div>
              <p>{companyData.city}, dnia {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </header>

        <section class="contract-section mb-4">
        <h1 class="contract-title text-2xl font-bold mb-3 text-center">Umowa o pracę</h1>

          <p>Zawarta w dniu: {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}</p>
          <div class="h-4"></div> 
          <p><strong>pomiędzy:</strong></p>
          <p><strong>Pracodawca:</strong> {companyData.company_name}</p>
          <p><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country}</p>
          <p><strong>NIP:</strong> {companyData.taxid}</p>
          <div class="flex flex-col space-y-2 max-w-xs">
  <label for="userInputField" class="font-bold">reprezentowaną przez:</label>
  <input
    type="text"
    id="userInputField"
    class="form-input block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-grey-600 focus:outline-none"
    value={userInput}
    onChange={handleInputChange}
    placeholder="Wprowadz osobę reprezentującą firmę przy podpisaniu umowy"
  />
</div>
          <div class="h-4"></div> 
          <p><strong>a Panią/Panem</strong></p>
          <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.postcode} {employee.city}</p>
          <p><strong>na umowę o pracę na:</strong> {selectedContract ? selectedContract.typ_umowy : "N/A"}</p>
          <p>od {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"} do {selectedContract && selectedContract.contract_to_date ? new Date(selectedContract.contract_to_date).toLocaleDateString() : "N/A"}</p>
          <div class="h-4"></div> 
          <p><strong>Strony ustalają następujące warunki zatrudnienia:</strong></p>
          <div class="overflow-x-auto">
  <table class="table-auto w-full text-left">
    <thead>
      <tr>
        <th class="px-4 py-2">Warunek</th>
        <th class="px-4 py-2">Szczegóły</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border px-4 py-2"><strong>Rodzaj umówionej pracy (stanowisko):</strong></td>
        <td class="border px-4 py-2">{selectedContract?.stanowisko}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2"><strong>Miejsce wykonywania pracy:</strong></td>
        <td class="border px-4 py-2">{companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}, {companyData.country}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2"><strong>Wymiar czasu pracy (etat):</strong></td>
        <td class="border px-4 py-2">{selectedContract?.etat}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2"><strong>Miesięczne wynagrodzenie brutto:</strong></td>
        <td class="border px-4 py-2">{selectedContract?.gross_amount} zł</td>
      </tr>
      <tr>
        <td class="border px-4 py-2"><strong>Termin rozpoczęcia pracy:</strong></td>
        <td class="border px-4 py-2">{selectedContract?.workstart_date}</td>
      </tr>
      <tr>
        <td class="border px-4 py-2"><strong>Okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny:</strong></td>
        <td class="border px-4 py-2">{selectedContract?.period_próbny} miesiące</td>
      </tr>
    </tbody>
  </table>
</div>

        </section>
        <div class="h-8"></div> 
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <p>Employee Signature</p>
            <div class="signature-line w-full border-t border-gray-400"></div>
            <p>Name: [Employee Name]</p>
          </div>
          <div>
            <p>Company Representative Signature</p>
            <div class="signature-line w-full border-t border-gray-400"></div>
            <p>Name: [Company Representative Name]</p>
          </div>
        </div>
      </div>
    ) : (
      <p>No contract selected.</p>
    )}
    </div>
    </div>
    <div class="mt-4">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleBackClick}>Back</button>
      <button onClick={() => window.print()} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Print or Save as PDF
</button>
    </div>
  </div>
  </div>
  
);

};

export default EmployeeContract;
