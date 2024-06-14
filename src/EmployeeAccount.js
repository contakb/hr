import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import CalendarPage from './CalendarPage';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import EmployeeBreaksCalendar from './EmployeeBreaksCalendar'; // Import the calendar component

function EmployeeAccount() {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { user } = useUser();
  const [taxOffices, setTaxOffices] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [taxOffice, setTaxOffice] = useState('');
  const [taxOfficeName, setTaxOfficeName] = useState('');
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [contractsVisible, setContractsVisible] = useState(false);

  const fetchEmployeeDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('http://localhost:3001/employee', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName, // Include the schema name in the request headers
          'X-User-Email': user.email // Include the user email in the request headers
        },
        params: { user_email: user.email } // Add the user email as a query parameter
      });

      if (response.data) {
        setEmployeeDetails(response.data);
      } else {
        toast.error('Employee details not found.');
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('An error occurred while fetching employee details.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEmployeeDetails();
    }
    // New logic to fetch tax offices
    axios.get('http://localhost:3001/tax-offices')
      .then((response) => {
        setTaxOffices(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tax offices:', error);
      });
  }, [user, fetchEmployeeDetails]);

  const taxOfficeOptions = taxOffices ? taxOffices.map(office => ({
    value: office.tax_office,
    label: office.tax_office
  })) : [];

  const handleTaxOfficeChange = (e) => {
    const selectedOption = e.target.value;
    setTaxOffice(selectedOption);
    setTaxOfficeName(selectedOption);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`http://localhost:3001/update-employee/${employeeDetails.id}`, employeeDetails, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName // Include the schema name in the request headers
        }
      });

      if (response.data) {
        toast.success('Details updated successfully!');
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error updating employee details:', error);
      toast.error('An error occurred while updating employee details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (event) => {
    event.preventDefault();
    setIsEditMode(true);
  };
  
  const handleCancelEdit = () => {
    
    setIsEditMode(false);
  };
  
  

  const toggleDetails = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      console.log('Logged out successfully');
      navigate('/LoginUser'); // Adjust as necessary for your route setup
    } else {
      console.error('Error logging out:', error);
    }
  };

  const handleGenerateContractPage = () => {
    navigate(`/EmployeeContract/${employeeDetails.id}`);
  };

  const toggleContracts = async () => {
    if (!contractsVisible) {
      try {
        const response = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeDetails.id}`, {
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
  const AneksView = ({ contract, originalContract }) => {
    const changes = [];

    // You may want to ensure that you're comparing numbers, as different types (string vs number) could cause issues.
    const originalGrossAmount = Number(originalContract.gross_amount);
    const aneksGrossAmount = Number(contract.gross_amount);
    const terminationType = Number(contract.termination_type);

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
        <p>New Gross Amount: {contract.termination_type}</p>
        {/* Render detected changes or a message if none */}
        {changes.length > 0 ? (
          <ul>{changes.map((change, index) => <li key={index}>{change}</li>)}</ul>
        ) : (
          <p>No changes were made in this aneks.</p>
        )}
      </div>
    );
  };


  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="bg-gray-100 p-4">
      <div className="flex flex-col lg:flex-row gap-8 justify-center lg:items-start">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md">
          <h1 className="font-bold text-xl mb-4">Twoje dane:</h1>
          {employeeDetails && (
            <div>
              <p className="mb-3">Imię: {employeeDetails.name}</p>
              <p className="mb-3">Nazwisko: {employeeDetails.surname}</p>
              <button
                type="button"
                onClick={toggleDetails}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showDetails ? 'Pokaż detale' : 'Ukryj detale'}
              </button>
              {showDetails && (
                <form onSubmit={handleSave} className="space-y-4 mt-4">
                  <div className="flex flex-wrap -mx-2">
                  <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="surname" className="block text-gray-700 text-sm font-bold mb-2">Nazwisko:</label>
                      <input
                        id="surname"
                        name="surname"
                        type="text"
                        value={employeeDetails.surname}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="street" className="block text-gray-700 text-sm font-bold mb-2">Ulica:</label>
                      <input
                        id="street"
                        name="street"
                        type="text"
                        value={employeeDetails.street}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="number" className="block text-gray-700 text-sm font-bold mb-2">Numer:</label>
                      <input
                        id="number"
                        name="number"
                        type="text"
                        value={employeeDetails.number}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="postcode" className="block text-gray-700 text-sm font-bold mb-2">Kod pocztowy:</label>
                      <input
                        id="postcode"
                        name="postcode"
                        type="text"
                        value={employeeDetails.postcode}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">Miasto:</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={employeeDetails.city}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Państwo:</label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={employeeDetails.country}
                        onChange={handleInputChange}
                        readOnly={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label htmlFor="taxOffice" className="block text-gray-700 text-sm font-bold mb-2">Urząd Skarbowy:</label>
                      <select
                        id="taxOffice"
                        name="tax_office"
                        value={employeeDetails.tax_office}
                        onChange={handleInputChange}
                        disabled={!isEditMode}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        {taxOffices.map(office => (
                          <option key={office.id} value={office.tax_office}>{office.tax_office}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditMode ? (
                      <>
                        <button
                          type="submit"
                          disabled={isLoading} // Disable the button when isLoading is true
                          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading ? 'Procesowanie...' : 'Zapisz'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                          Anuluj
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditClick}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Edytuj
                      </button>
                    )}
                  </div>
                </form>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Wyloguj
              </button>
              <button 
              type="button"
              onClick={handleGenerateContractPage}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              View Contract
            </button>
            <button
              onClick={toggleContracts}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {contractsVisible ? 'Hide Contracts' : 'Show Contracts'}
            </button>
            </div>
          )}
            {contractsVisible && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold">Umowy o pracę:</h3>
                  {contracts.length === 0 ? (
                    <p>Nie znaleziono umów.</p>
                  ) : (
                    contracts.map(({ original, aneks }) => (
                      <div key={original.id} className="mb-6">
                        {/* Render Original Contract Details */}
                        <div className="mb-2">
                          <p className="font-medium">Original Contract ID: {original.id}</p>
                        </div>
                        <div>
                          <p>Gross Amount: {original.gross_amount}</p>
                          <p>Contract From: {new Date(original.contract_from_date).toLocaleDateString()}</p>
                          <p>Contract To: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
                          <p>Typ Umowy: {original.typ_umowy}</p>
                          <p>Stanowisko: {original.stanowisko}</p>
                          <p>Etat: {original.etat}</p>
                          <p>Rozpoczęcie pracy: {new Date(original.workstart_date).toLocaleDateString()}</p>
                          <p>typ rozwiązania umowy: {aneks.length > 0 ? aneks[aneks.length - 1].termination_type : original.termination_type}</p>
                          {/* New row for Contract Termination Status */}
                          <p>
                            Contract Status:
                            {new Date(aneks.length > 0 ? aneks[aneks.length - 1].contract_to_date : original.contract_to_date) < new Date()
                              ? <span style={{ color: 'red' }}> Terminated</span>
                              : <span style={{ color: 'green' }}> Active</span>}
                          </p>
                        </div>
    
                        {/* Render Aneks Contracts */}
                        {aneks && aneks.length > 0 && (
                          <div>
                            <h4>Aneks:</h4>
                            {aneks.map(aneksContract => (
                              <div key={aneksContract.id}>
                                <p>Aneks Contract ID: {aneksContract.id}</p>
                                <AneksView contract={aneksContract} originalContract={original} />
                                <div>
                                  <p>Gross Amount: {aneksContract.gross_amount}</p>
                                  <p>Gross Amount: {aneksContract.termination_type}</p>
                                  <p>Contract From: {new Date(aneksContract.contract_from_date).toLocaleDateString()}</p>
                                  <hr /> {/* Horizontal line divider */}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
        </div>
        <div className="flex flex-col lg:flex-col w-full lg:max-w-md lg:space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="font-bold text-xl mb-4">Kalendarz:</h2>
            <EmployeeBreaksCalendar employeeId={employeeDetails.id} /> {/* Pass the employeeId here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAccount;
