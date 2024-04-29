import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Login.css';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
import { useRequireAuth } from './useRequireAuth';
import './print.css'; // Adjust the path to where you saved the CSS file
import jsPDF from 'jspdf';
import ReactDOMServer from 'react-dom/server';


const EmployeeContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [userInput, setUserInput] = useState(''); // State to hold the user input
    const hasErrorBeenShown = useRef(false); // Ref to track if the error toast has been shown
  
  const navigate = useNavigate();

  const { employeeId } = useParams();

  const location = useLocation();
  const user = useRequireAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const employeeResponse = await axiosInstance.get(`http://localhost:3001/api/employees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
            'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
          }
        });
        const contractResponse = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`, // Add the access token to the request
            'x-schema-name': user.schemaName, // Pass the schemaName as a custom header
          }
        });
  
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
    if (isLoading === false) return;  // Guard against unnecessary invocation
    setIsLoading(true);
    axiosInstance.get('http://localhost:3001/api/created_company', {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'x-schema-name': user.schemaName,
      }
    })
    .then(response => {
        const company = response.data.length > 0 ? response.data[0] : null;
        if (company && company.company_id) {
            setCompanyData(company);
            hasErrorBeenShown.current = false; // Reset the ref if data is successfully fetched
        } else {
            if (!hasErrorBeenShown.current) {
                toast.error("No company data found. Please complete the company setup.");
                hasErrorBeenShown.current = true;
            }
            setCompanyData(null);
        }
        setIsLoading(false);
    })
    .catch(error => {
        console.error('Error fetching company data:', error);
        if (!hasErrorBeenShown.current) {
            const errorMessage = (error.response && error.response.status === 404) 
                                 ? "Nie odnaleziono danych firmy. Proszę uzupełnić dane w ustawieniach konta."
                                 : "Brak danych.";
            toast.error(errorMessage);
            hasErrorBeenShown.current = true;
        }
        setCompanyData(null);
        setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchCompanyData();
    return () => { hasErrorBeenShown.current = false; }; // Reset on unmount
  }, []);  // Dependency array is empty to ensure this runs only once on mount
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

async function handleDownloadPDFClick() {
  // Assuming you have a way to reference the component's root DOM node
  const element = document.querySelector('.printable-section');
  const htmlContent = element.outerHTML;  // Captures the HTML including styles

  // Send a request to your server endpoint.
  const response = await fetch('http://localhost:3001/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ html: htmlContent })
  });

  if (response.ok) {
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'contract.pdf';
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  } else {
    // Handle any errors here
    console.error('Failed to generate PDF');
  }
}



if (isLoading) {
  return <div>Loading...</div>;
}

if (!companyData) {
  // Adjust this to handle both no company data and any other logical conditions that aren't technically errors
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10">
  <div className="ToDo bg-white shadow-md rounded px-3 py-6 max-w-xl sm:max-w-md w-full">

      <h1 className="text-2xl font-semibold mb-2">Generowanie umowy:</h1>
      <p className="text-red-500 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">Nie udało się pobrać danych firmy bądź dane te nie zostały wprowadzone.</p>
      <button onClick={() => navigate('/account-details')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
        Szczegóły konta
      </button>
    </div>
    </div>
   
  );
}

if (error) {
  // This should now be a catch-all for any other types of errors not handled by the specific checks above
  return (
    <div className="flex space-x-2 mt-4">
      <h1>Błąd:</h1>
      <p>{error}</p>
      <button onClick={() => navigate('/account-details')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        Przejdź do ustawień
      </button>
    </div>
  );
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
          <p>Strony ustalają następujące warunki zatrudnienia:</p>
          <div class="h-4"></div> 
          <div class="overflow-x-auto">
  <table class="table-auto w-full text-left">
    
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
            <p>Podpis pracownika</p>
            <div class="signature-line w-full border-t border-gray-400"></div>
            <p>{employee.name} {employee.surname}</p>
          </div>
          <div>
            <p>Podpis osoby reprezentującej firmę</p>
            <div class="signature-line w-full border-t border-gray-400"></div>
            <p>{userInput}</p>
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
<button onClick={handleDownloadPDFClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Download PDF
      </button>
    </div>
  </div>
  </div>
  
);

};

export default EmployeeContract;
