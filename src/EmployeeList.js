import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EmployeeContract from './EmployeeContract';
import html2pdf from 'html2pdf.js';
import { useLocation } from 'react-router-dom';
import './Login.css';
import Select from 'react-select';
import { useSetup } from './SetupContext'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct pat
import { useRequireAuth } from './useRequireAuth';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary

// Employee component
function Employee({ employee, updateEmployeeInList, taxOffices, detailView,  setSelectedEmployee }) {
  const { id, name, surname, street, number, postcode, city, country, tax_office, pesel } = employee;
  const [showDetails, setShowDetails] = useState(false);
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [generateContractVisible, setGenerateContractVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPDF, setShowPDF] = useState(false); // Add this line
  const navigate = useNavigate();
  const [medicalFormVisible, setMedicalFormVisible] = useState(false);
  const [parametersVisible, setParametersVisible] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editEmployeeDetailsMode, setEditEmployeeDetailsMode] = useState(false);
  const [editParametersMode, setEditParametersMode] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editContractsMode, setEditContractsMode] = useState(false);
  const [editingContractId, setEditingContractId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [taxOffice, setTaxOffice] = useState(employee.tax_office); // Assuming 'tax_office' is the property
  const [taxOfficeName, setTaxOfficeName] = useState(''); // You might need to adjust this based on how you handle tax office names
  const user = useRequireAuth();
  // State to track the selected employee for displaying details


  
  
  
  

const location = useLocation(); // Correct usage of useLocation

const handleFullEdit = (contractId) => {
  navigate(`/add-contract/${id}/${contractId}`);
};

const handleAneks = (originalContractId, latestAneksId = null) => {
  // If a latest aneks ID is provided, use it; otherwise, use the original contract ID
  const contractIdToUse = latestAneksId || originalContractId;
  navigate(`/aneks/${id}/${contractIdToUse}`);
};



  const handleAddContract = () => {
    navigate(`/add-contract/${id}`);
  };

  const handleGenerateContractPage = (id) => {
    navigate(`/EmployeeContract/${id}`);
};

    


  const handleMedicalExamination = () => {
    navigate(`/medical-examination/${id}`, {
      state: {
        employee:employee, contracts:contracts
      },
    });
  };
  const handleAddParameters = () => {
    navigate(`/employee-param/${id}`); // Replace with your actual path to the add parameters page
  };

  const handleEditParameters = () => {
    navigate(`/employee-param/${id}`, { state: { hasParams: !!parameters } });
  };
  
  const handleTerminateContractPage = (id) => {
    navigate(`/TerminateContract/${id}`);
  };
  
  
  

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  

  const toggleContracts = async () => {
    if (!contractsVisible) {
      try {
        const response = await axiosInstance.get(`http://localhost:3001/api/contracts/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`, // Use the access token
            'X-Schema-Name': user.schemaName, // Send the schema name as a header
          }
        });
        console.log("Fetched contracts:", response.data.contracts);
        const combinedContracts = combineContracts(response.data.contracts);
        setContracts(combinedContracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      }
    }

    setContractsVisible(!contractsVisible);
  };

  function combineContracts(contracts) {
    // Sort contracts by contract_from_date in ascending order
    contracts.sort((a, b) => new Date(a.contract_from_date) - new Date(b.contract_from_date));
    
    let contractMap = new Map();
  
    contracts.forEach(contract => {
      const originalId = contract.kontynuacja || contract.id;
  
      if (!contractMap.has(originalId)) {
        contractMap.set(originalId, { original: null, aneks: [] });
      }
  
      const contractData = contractMap.get(originalId);
  
      if (!contract.kontynuacja) {
        // This is the original contract
        contractData.original = contract;
      } else {
        // This is an aneks
        contractData.aneks.push(contract);
      }
    });
  
    return Array.from(contractMap.values());
  }
  


  function getOriginalContract(originalContractId, allContracts) {
    const originalContract = allContracts.find(contract => contract.id === originalContractId);
    console.log("Found original contract for aneks:", originalContract);
    return originalContract;
  }
  
  
  
  const AneksView = ({ contract, originalContract }) => {
    
    const changes = [];
    
    
    // You may want to ensure that you're comparing numbers, as different types (string vs number) could cause issues.
    const originalGrossAmount = Number(originalContract.gross_amount);
    const aneksGrossAmount = Number(contract.gross_amount);

    console.log("Aneks contract data:", contract);
    console.log("Original contract data:", originalContract);

    if (!originalContract) {
      console.error('Original contract not found for aneks:', contract);
      return <p>Original contract data missing!</p>;
    }

    if (aneksGrossAmount !== originalGrossAmount) {
      changes.push(`Gross Amount changed from ${originalGrossAmount} to ${aneksGrossAmount}`);
    }
  
    // Log the data to see if they are being passed correctly and to confirm the change is detected.
    console.log("Original contract gross amount:", originalGrossAmount);
    console.log("Aneks contract gross amount:", aneksGrossAmount);
    console.log("Detected changes:", changes);
  
    return (
      <div>
        <p>Aneks details (debug):</p>
        <p>Original Gross Amount: {originalContract.gross_amount}</p>
        <p>New Gross Amount: {contract.gross_amount}</p>
        {/* Render detected changes or a message if none */}
        {changes.length > 0 ? (
          <ul>{changes.map((change, index) => <li key={index}>{change}</li>)}</ul>
        ) : (
          <p>No changes were made in this aneks.</p>
        )}
      </div>
    );
  };


  

  const toggleParameters = async () => {
    if (!parametersVisible) {
      try {
        const response = await axiosInstance.get(`http://localhost:3001/api/employee-params/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`, // Use the access token
            'X-Schema-Name': user.schemaName, // Send the schema name as a header
          }
        });
        const hasParameters = response.data.parameters.length > 0;
        setParameters(hasParameters ? response.data.parameters[0] : null);
  
        // Use hasParameters to decide which button to show
        if (hasParameters) {
          // Logic for when parameters exist
        } else {
          // Logic for when parameters don't exist
        }
  
      } catch (error) {
        console.error('Error fetching parameters:', error);
        setParameters(null);
      }
    }
    setParametersVisible(!parametersVisible);
  };
  
  // Toggle detail editor for an employee
  const toggleDetailEditor = (employeeId) => {
    setEditingEmployeeId(editingEmployeeId === employeeId ? null : employeeId);
  };

  // Toggle function for employee details edit mode
  const toggleEditEmployeeDetailsMode = () => {
    setEditEmployeeDetailsMode(!editEmployeeDetailsMode);
    // Ensure that editing parameters is turned off when editing employee details
    setEditParametersMode(false);
  };
   // Toggle function for parameters edit mode
   const toggleEditParametersMode = () => {
    setEditParametersMode(!editParametersMode);
    // Ensure that editing employee details is turned off when editing parameters
    setEditEmployeeDetailsMode(false);
  };

  const toggleEditContractsMode = (contractId) => {
    setEditContractsMode(!editContractsMode);
    setEditingContractId(contractId);
  };
  
  const handleUpdateContract = async (e, contractId) => {
    e.preventDefault();
  
    const updatedContractData = {
      gross_amount: e.target.gross_amount.value,
      contract_from_date: e.target.contract_from_date.value,
      contract_to_date: e.target.contract_to_date.value,
      typ_umowy: e.target.typ_umowy.value,
      stanowisko: e.target.stanowisko.value,
      etat: e.target.etat.value,
      workstart_date: e.target.workstart_date.value,
      
    };
  
    try {
      const response = await axios.put(`http://localhost:3001/api/contracts/${contractId}`, updatedContractData);
      // Handle success
      setEditContractsMode(false);
      setEditingContractId(null);
      setUpdateMessage('Contract data updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
    } catch (error) {
      console.error('Error updating contract:', error);
      // Handle error appropriately
    }
  };
  

  
  
  const handleUpdateParameters = async (e) => {
    e.preventDefault();
  
    const updatedParameters = {
      koszty: e.target.koszty.value,
      ulga: e.target.ulga.value,
      kod_ub: e.target.kod_ub.value,
      valid_from: e.target.valid_from.value,
    };
  
    try {
      const response = await axiosInstance.put(`http://localhost:3001/api/employee-params/${id}`, updatedParameters, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });
      if (response.data.updatedParameters.length > 0) {
        setParameters(response.data.updatedParameters[0]);
        setEditMode(false);
        setEditParametersMode(false); // Set the specific edit mode to false
        setUpdateMessage('Parameters updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
      }
    } catch (error) {
      console.error('Error updating parameters:', error);
      setUpdateMessage('Failed to update parameters.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };



  const handleUpdateDetails = async (e) => {
    e.preventDefault();
  
    const updatedDetails = {
      name: e.target.name.value,
      surname: e.target.surname.value,
      pesel: e.target.pesel.value,
      street: e.target.street.value,
      number: e.target.number.value,
      postcode: e.target.postcode.value,
      city: e.target.city.value,
      country: e.target.country.value,
      tax_office: taxOffice,
    };
  
    try {
      const response = await axiosInstance.put(`http://localhost:3001/update-employee/${id}`, updatedDetails, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`, // Use the access token
          'X-Schema-Name': user.schemaName, // Send the schema name as a header
        }
      });
      if (response.data.updatedEmployee) {
        updateEmployeeInList(id, response.data.updatedEmployee);
        setEditMode(false);
        setEditEmployeeDetailsMode(false); // Set the specific edit mode to false
        setUpdateMessage('Employee data updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
      }
    } catch (error) {
      console.error('Error updating details:', error);
      setUpdateMessage('Failed to update employee data.');
      setTimeout(() => setUpdateMessage(''), 3000);
      // Handle error appropriately
    }
  };
  
  
  

  

  useEffect(() => {
    if (updateMessage) {
      console.log('Update message:', updateMessage);
    }
  }, [updateMessage]);

  // Check if taxOffices is available and not undefined
  const taxOfficeOptions = taxOffices ? taxOffices.map(office => ({
  value: office.tax_office,
  label: office.tax_office
  })) : [];

  const handleTaxOfficeChange = (selectedOption) => {
    if (selectedOption) {
        setTaxOffice(selectedOption.value);
        
        // This sets the name as well
        setTaxOfficeName(selectedOption.label);
    } else {
        setTaxOffice('');
        setTaxOfficeName('');
    }
  };

  const isContractTerminated = (endDate) => {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return contractEndDate < today;
};
  const contractStatus = isContractTerminated(employee.contractEndDate) ? 'Nieaktywny' : 'Aktywny';
  const statusColor = contractStatus === 'Terminated' ? 'red' : 'green';

   // If user is null, component will show a loading message or a minimal UI instead of immediately returning null
   if (!user) {
    return (
      <div>Loading... If you are not redirected, <a href="/loginUser">click here to login</a>.</div>
    );
  }
 
  if (detailView) {
    // Render the detailed view of the selected employee
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Dane szczegółowe</h3>
        <span style={{ color: statusColor }}>{contractStatus}</span>
      </div>
      
      <div className="mb-4">
        <p><strong>Imię:</strong> {name}</p>
        <p><strong>Nazwisko:</strong> {surname}</p>
      </div>

      <div className="flex gap-2 mb-4">
  <button 
    className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={toggleDetails}
  >
    {showDetails ? 'Ukryj detale' : 'detale'}
  </button>
  <button 
    className="bg-green-500 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={toggleContracts}
  >
    {contractsVisible ? 'Ukryj umowy' : 'umowy'}
  </button>
  <button 
    className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={() => handleGenerateContractPage(id)}
  >
    Generuj umowe
  </button>
  <button 
    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={handleMedicalExamination}
  >
    Badania lekarskie
  </button>
  <button 
    className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={() => handleTerminateContractPage(id)}
  >
    Zakończ umowę
  </button>

      </div>


      {showDetails && (
  <div className="border-t pt-4">
    {editEmployeeDetailsMode ? (
      <form onSubmit={handleUpdateDetails}>
      <label htmlFor="name">Imię:</label>
      <input type="text" name="name" id="name" defaultValue={name} placeholder="Name" className="form-input" />
  
      <label htmlFor="surname">Nazwisko:</label>
      <input type="text" name="surname" id="surname" defaultValue={surname} placeholder="Surname"className="form-input" />
  
      <label htmlFor="street">Ulica:</label>
      <input type="text" name="street" id="street" defaultValue={street} placeholder="Street"className="form-input" />
  
      <label htmlFor="number">Numer:</label>
      <input type="text" name="number" id="number" defaultValue={number} placeholder="Number"className="form-input" />
  
      <label htmlFor="postcode">Kod pocztowy:</label>
      <input type="text" name="postcode" id="postcode" defaultValue={postcode} placeholder="Postcode"className="form-input" />
  
      <label htmlFor="city">Miasto:</label>
      <input type="text" name="city" id="city" defaultValue={city} placeholder="City" className="form-input"/>
  
      <label htmlFor="country">Państwo:</label>
      <input type="text" name="country" id="country" defaultValue={country} placeholder="Country"className="form-input" />
  
      <label>Urząd Skarbowy:</label>
          <Select 
            options={taxOfficeOptions} 
            onChange={handleTaxOfficeChange}
            isSearchable={true}
            placeholder="Wybierz US"
            value={taxOfficeOptions.find(option => option.value === employee.tax_office)} // Make sure this matches the current tax office of the employee
          />
      <label htmlFor="pesel">PESEL:</label>
      <input type="text" name="pesel" id="pesel" defaultValue={pesel} placeholder="PESEL"className="form-input" />
      <div className="flex gap-2 mb-4">
      <button
       className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded text-xs"
      type="submit">Zapisz zmiany</button>
      <button
    className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded text-xs"
       onClick={toggleEditMode}>Anuluj</button>
       </div>
      </form>
    ) : (
      <div>
        {updateMessage && <div className="update-message">{updateMessage}</div>}
        
        <div className="mb-4">
        <p><strong>Ulica:</strong> {street} {number}</p>
        <p><strong>Kod pocztowy:</strong> {postcode}</p>
        <p><strong>Miasto:</strong> {city}</p>
        <p><strong>Państwo:</strong> {country}</p>
        <p><strong>Urząd Skarbowy:</strong> {tax_office}</p>
        <p><strong>PESEL:</strong> {pesel}</p>
        <p></p>
        </div>
        
        <div className="flex gap-2 mb-2">
        <button 
         
    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
        onClick={toggleParameters}>{parametersVisible ? 'Zamknij parametry' : 'Parametry ZUS/Podatkowe'}</button>
        <button 
         
    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
        onClick={toggleEditEmployeeDetailsMode}>Edycja danych osobowych</button>
        </div>
        </div>
        )}
          {parametersVisible && (
            <div className="border-t pt-4">
  <div>
    <h3 className="text-lg font-semibold">Parametetry podatkowe i ZUS</h3>
    {updateMessage && <div className="update-message">{updateMessage}</div>}
    {editParametersMode ? (
      <form onSubmit={handleUpdateParameters}>
        <label htmlFor="koszty">Koszty:</label>
        <input type="text" name="koszty" defaultValue={parameters.koszty} placeholder="koszty" className="form-input"/>

        <label htmlFor="ulga">Ulga podatkowa:</label>
        <input type="text" name="ulga" defaultValue={parameters.ulga} placeholder="ulga" className="form-input"/>

        <label htmlFor="kod_ub">Kod ubezpieczenia:</label>
        <input type="text" name="kod_ub" defaultValue={parameters.kod_ub} placeholder="kod_ub" className="form-input" />

        <label htmlFor="valid_from">Dane ważne od:</label>
        <input type="date" name="valid_from" defaultValue={parameters.valid_from} placeholder="valid_from" className="form-input"/>

        <div className="flex gap-2 mb-2">
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
         type="submit">Zapisz zmiany</button>
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
         onClick={toggleEditParametersMode}>Anuluj</button>
         </div>
      </form>
    ) : parameters ? (
      <div>
        <div className="mb-4">
        <p><strong>Koszty:</strong> {parameters.koszty}</p>
        <p><strong>Ulga:</strong> {parameters.ulga}</p>
        <p><strong>Kod UB:</strong> {parameters.kod_ub}</p>
        <p><strong>Dane ważne od:</strong> {parameters.valid_from && new Date(parameters.valid_from).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2 mb-2">
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
        onClick={toggleEditParametersMode}>Szybka edycja</button>
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
        onClick={handleEditParameters}>
  {parameters ? 'Edytuj paramatry' : 'Dodaj parametry'}
</button>
</div>
      </div>
    ) : (
      <div>
        <div className="mb-4">
        <p>Brak parametrów ZUS i podatkowych, dodaj proszę.</p>
        </div>
        <div className="flex gap-2 mb-2">
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
         onClick={handleAddParameters}>Dodaj parametry</button>
        </div>
      </div>
    )}
          </div>
          </div>
        )}
      </div>
    )}


{contractsVisible && (
  <div className="border-t pt-4">
    <h3 className="text-lg font-semibold">Umowy o pracę:</h3>
    {contracts.length === 0 ? (
      <div>
        <div className="mb-4">
        <p>Nie znaleziono umów..</p>
        </div>
        <div className="flex gap-2 mb-2">
        <button
        className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
        onClick={handleAddContract}>Dodaj umowę</button>
        </div>
      </div>
    ) : (
      contracts.map(({ original, aneks }) => (
        <div key={original.id}>
          {/* Render Original Contract Details */}
          <p>Original Contract ID: {original.id}</p>
          
          {updateMessage && <div className="update-message">{updateMessage}</div>}
          {editContractsMode && editingContractId === original.id ? (
            // Render the form for editing the original contract
            <form onSubmit={(e) => handleUpdateContract(e, original.id)}>
              {/* Add all form fields for editing the original contract */}
              <label htmlFor="gross_amount">Gross Amount:</label>
              <input type="number" name="gross_amount" defaultValue={original.gross_amount} />
              <label htmlFor="contract_from_date">Contract From:</label>
              <input type="date" name="contract_from_date" defaultValue={original.contract_from_date} />
              <label htmlFor="contract_to_date">Contract To:</label>
              <input type="date" name="contract_to_date" defaultValue={original.contract_to_date} />
              <label htmlFor="typ_umowy">Typ Umowy:</label>
              <input type="text" name="typ_umowy" defaultValue={original.typ_umowy} />
              <label htmlFor="stanowisko">Stanowisko:</label>
              <input type="text" name="stanowisko" defaultValue={original.stanowisko} />
              <label htmlFor="etat">Etat:</label>
              <input type="text" name="etat" defaultValue={original.etat} />
              <label htmlFor="Rozpoczęcie pracy">Rozpoczęcie pracy:</label>
              <input type="date" name="workstart_date" defaultValue={original.workstart_date} />
              <button type="submit">Save Changes</button>
              <button onClick={() => toggleEditContractsMode(null)}>Cancel</button>
            </form>
          ) : (
            // Render the normal view of the original contract
            <div>
              <p>Gross Amount: {original.gross_amount}</p>
              <p>Contract From: {new Date(original.contract_from_date).toLocaleDateString()}</p>
              <p>Contract To: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
              <p>Typ Umowy: {original.typ_umowy}</p>
              <p>Stanowisko: {original.stanowisko}</p>
              <p>Etat: {original.etat}</p>
              <p>Rozpoczęcie pracy: {new Date(original.workstart_date).toLocaleDateString()}</p>
              <p>typ rozwiązania umowy: {original.termination_type}</p>
               {/* New row for Contract Termination Status */}
               <p>
            Contract Status: 
            {isContractTerminated(aneks.length > 0 ? aneks[aneks.length - 1].contract_to_date : original.contract_to_date)
              ? <span style={{ color: 'red' }}> Terminated</span>
              : <span style={{ color: 'green' }}> Active</span>}
          </p>
              {aneks.length === 0 ? (
      <button 
      className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
      onClick={() => toggleEditContractsMode(original.id)}>Quick edit</button>
    ) : (
      <p>Do umowy istnieje aneks. Zmiany w umowie poprzez aneks</p>
    )}
              <button
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
              onClick={() => handleFullEdit(original.id)}>Edycja umowy</button>
              {aneks.length === 0 ? (
    <button
    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={() => handleAneks(original.id)}>Stwórz aneks do umowy</button>
  ) : (
    <button
    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
    onClick={() => handleAneks(original.id, aneks[aneks.length - 1].id)}>Zmień aneks</button>
  )
}
              <button
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
              onClick={handleAddContract}>Dodaj nową umowę</button>
            </div>
          )}

          {/* Render Aneks Contracts */}
          {aneks && aneks.length > 0 && (
            <div>
              <h4>Aneks:</h4>
              {aneks.map(aneksContract => (
                <div key={aneksContract.id}>
                  <p>Aneks Contract ID: {aneksContract.id}</p>
                  <AneksView contract={aneksContract} originalContract={original} />
                  {/* Display details of aneks contract */}
                  <div>
                    {/* Display details of aneks contract */}
                    <p>Gross Amount: {aneksContract.gross_amount}</p>
                    <p>Contract From: {new Date(aneksContract.contract_from_date).toLocaleDateString()}</p>
                    <button
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
                    onClick={() => handleAneks(original.id, aneks[aneks.length - 1].id)}>Zmień aneks</button>
                    
                    {/* Add more fields if needed */}
                  </div>
                  <hr /> {/* Horizontal line divider */}
                </div>
                
              ))}
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}
<button 
         
    className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs"
          onClick={() => setSelectedEmployee(null)}
        >
          Zamknij okno
        </button>


    </div>
      )
}else {
  // Render the summary view
  return (
    <div className="flex flex-col md:flex-row items-center bg-white shadow rounded-lg p-4 ">
      <div className="flex-grow">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}> 
          {contractStatus}
        </span>
        <span className="ml-2 text-sm">Id: {id}</span>
      </div>
  
      <div className="flex-grow">
        <p className="text-sm font-medium"><strong>Imię:</strong> {name}</p>
        <p className="text-sm font-medium"><strong>Nazwisko:</strong> {surname}</p>
      </div>
      
      <button
        className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded transition duration-300 ease-in-out"
        onClick={() => setSelectedEmployee(employee)}
      >
        More
      </button>
    </div>
  );
  
}
}

// EmployeeList component
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // State for sorting order
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [taxOffices, setTaxOffices] = useState([]); // New state for tax offices
  const [filterStatus, setFilterStatus] = useState('all'); // new state for filtering by contract status
  const { setIsInSetupProcess } = useSetup(); // Use the hook to access context methods
  const user = useRequireAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const updateEmployeeInList = (employeeId, newDetails) => {
    setEmployees(currentEmployees => {
      const updated = currentEmployees.map(employee => 
        employee.id === employeeId ? { ...employee, ...newDetails } : employee
      );
      console.log("Updated Employees Order: ", updated);
      return updated;
    });
  };

  useEffect(() => {
    fetchEmployees();
    // New logic to fetch tax offices
    axios.get('http://localhost:3001/tax-offices')
      .then((response) => {
        setTaxOffices(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tax offices:', error);
      });
  }, []);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const isContractTerminated = (endDate) => {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return contractEndDate < today;
  };
  
  const filteredAndSortedEmployees = employees
    .filter(employee => {
      // Apply surname filter
      const surnameMatch = employee.surname.toLowerCase().includes(filter.toLowerCase());
  
      // Apply contract status filter
      const isTerminated = isContractTerminated(employee.contractEndDate);
      const statusMatch = filterStatus === 'all' || 
                          (filterStatus === 'active' && !isTerminated) || 
                          (filterStatus === 'terminated' && isTerminated);
  
      return surnameMatch && statusMatch;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortOrder === 'asc') {
        return a.surname.localeCompare(b.surname);
      } else {
        return b.surname.localeCompare(a.surname);
      }
    });
  

    const fetchEmployees = async () => {
      try {
          const response = await axiosInstance.get('http://localhost:3001/employees', {
              headers: {
                  'Authorization': `Bearer ${user.access_token}`,
                  'X-Schema-Name': user.schemaName // Include the schema name in the request headers
              }
          });
          const updatedEmployees = response.data.employees.map(employee => {
              // Adapt this logic based on your actual data structure
              return { ...employee, hasParams: Boolean(employee.params) };
          });
          setEmployees(response.data.employees);
      } catch (error) {
          console.error('Error fetching employees:', error);
          setError('Error fetching employees. Please try again later.');
      } finally {
          setLoading(false);
      }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleCreateEmployeeClick = () => {
    setIsInSetupProcess(false); // Set to false to indicate not in setup process
    navigate('/createEmployee');
  };

 


  return (
    <div className="min-h-screen bg-gray-100 p-4">
  <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
    {/* Filters and Create Employee Button */}
    <div className="mb-4">
        <div className="flex flex-wrap gap-4 mb-4 justify-between">
          <input
            type="text"
            placeholder="Filtruj po nazwisku..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 shadow-sm w-full md:w-auto flex-1"
          />
          <select onChange={handleSortChange} className="border border-gray-300 rounded-md p-2 shadow-sm">
            <option value="asc">Sortuj A-Z</option>
            <option value="desc">Sortuj Z-A</option>
          </select>
          <select onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md p-2 shadow-sm">
            <option value="all">Wszyscy pracownicy</option>
            <option value="active">Aktywni</option>
            <option value="terminated">Nieaktywni</option>
          </select>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateEmployeeClick}
          >
            Wprowadź pracownika
          </button>
        </div>
        </div>
        {/* Main Content Area */}
    <div className="flex flex-col bg-white p-1 shadow rounded-lg lg:flex-row gap-4">
      {/* Employee List Section */}
      
      <div className="flex-1 bg-white p-4 shadow rounded-lg">
      <h1 className="text-1xl font-semibold">Wybierz pracownika:</h1>
      {loading ? (
        <div>Ładowanie...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-1">
            {/* Map over your employees to render the list */}
          {filteredAndSortedEmployees.map((employee) => (
            <div
            className="cursor-pointer p-2 hover:bg-gray-200 border-t pt-4"
            onClick={() => handleEmployeeSelect(employee)}
            key={employee.id}
          >
            
            <Employee
              employee={employee}
              updateEmployeeInList={updateEmployeeInList}
              taxOffices={taxOffices}
              detailView={false} // pass false to show summary view
              setSelectedEmployee={setSelectedEmployee} // pass function to unset the selected employee
            />
          </div>
          ))}
        </div>
      )}
      </div>
      {selectedEmployee && (
            <div className="lg:w-1/2 bg-white p-4 shadow rounded-lg">
              {/* Display selected employee details */}
              
              <Employee
                employee={selectedEmployee}
                updateEmployeeInList={updateEmployeeInList}
                taxOffices={taxOffices}
                detailView={true} // pass true to show detailed view
                setSelectedEmployee={setSelectedEmployee} // pass function to unset the selected employee
              />
            </div>
          )}
          </div>
          </div>
        </div>
  );
}

export default EmployeeList;
