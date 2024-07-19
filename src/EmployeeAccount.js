import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';
import CalendarPage from './CalendarPage';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import EmployeeBreaksCalendar from './EmployeeBreaksCalendar'; // Import the calendar component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [holidayBaseVisible, setHolidayBaseVisible] = useState(false);
const [holidayBase, setHolidayBase] = useState(null);
const [editHolidayBaseMode, setEditHolidayBaseMode] = useState(false);
const [editingBadanie, setEditingBadanie] = useState(null);
const [badania, setBadania] = useState([]);
const [badaniaVisible, setBadaniaVisible] = useState(false);
const [editBadanieMode, setEditBadanieMode] = useState(false);
  


  console.log(user); // Check if user data is available
  // If useRequireAuth redirects non-authenticated users, authUser will always be defined here
  console.log('User from context:', user);

  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

const toggleCalendarSize = () => {
  setIsCalendarExpanded(!isCalendarExpanded);
};

const fetchHolidayBase = async () => {
  try {
    const response = await axiosInstance.get(`http://localhost:3001/employees/${employeeDetails.id}/holiday-base`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'X-Schema-Name': user.schemaName,
      }
    });

    if (response.data && response.data.data.length > 0) {
      setHolidayBase(response.data.data[0]);
    } else {
      setHolidayBase(null); // No data found
    }
  } catch (error) {
    console.error('Error fetching holiday base data:', error);
    setHolidayBase(null);
  }
};

const toggleHolidayBase = async () => {
  if (!holidayBaseVisible) {
    await fetchHolidayBase();
  }
  setHolidayBaseVisible(!holidayBaseVisible);
};

const handleQuickEditHolidayBase = async (e) => {
  e.preventDefault();
  const updatedHolidayBase = {
    holiday_base: holidayBase.holiday_base === 20 ? 26 : 20, // Toggle between 20 and 26
  };

  try {
    const response = await axiosInstance.put(`http://localhost:3001/employees/${employeeDetails.id}/holiday-base`, updatedHolidayBase, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'X-Schema-Name': user.schemaName,
      }
    });

    if (response.data) {
      setHolidayBase(prev => ({ ...prev, holiday_base: updatedHolidayBase.holiday_base }));
      setEditHolidayBaseMode(false);
      toast.success('Holiday base updated successfully!');
    }
  } catch (error) {
    console.error('Error updating holiday base:', error);
    toast.error('Failed to update holiday base.');
  }
};

const toggleEditHolidayBaseMode = () => {
  setEditHolidayBaseMode(!editHolidayBaseMode);
};

const handleHolidayBasePage = () => {
  navigate(`/holidaybase/${employeeDetails.id}`);
};

const handleViewReport = () => {
  navigate(`/employee-reports/${employeeDetails.id}`);
};



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

  // Add function to fetch badania
const fetchBadania = async () => {
  try {
    const response = await axiosInstance.get(`http://localhost:3001/api/badania/${employeeDetails.id}`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'x-schema-name': user.schemaName,
      },
    });
    setBadania(response.data);
  } catch (error) {
    console.error('Error fetching badania:', error);
    toast.error('Failed to fetch badania.');
  }
};

  // Toggle function for badania visibility
  const toggleBadania = async () => {
    if (!badaniaVisible) {
      await fetchBadania();
    }
    setBadaniaVisible(!badaniaVisible);
    setEditBadanieMode(false); // Ensure edit mode is off when toggling visibility
  };
  

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

  const handleBadanieChange = (e) => {
    const { name, value } = e.target;
    setEditingBadanie((prevBadanie) => ({
      ...prevBadanie,
      [name]: value,
    }));
  };

  const handleBadanieDateChange = (date, name) => {
    setEditingBadanie((prevBadanie) => ({
      ...prevBadanie,
      [name]: date,
    }));
  };

  const handleBadanieSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:3001/api/badania/${editingBadanie.id}`;
      await axiosInstance.put(url, editingBadanie, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        },
      });
      toast.success('Badanie updated successfully');
      fetchBadania(); // Re-fetch badania data
      setEditingBadanie(null); // Clear form
      
    setEditBadanieMode(false); // Exit edit mode
    } catch (error) {
      console.error('Error updating badanie:', error);
      toast.error('Failed to update badanie');
    }
  };

  const handleEditBadanie = (badanie) => {
    setEditingBadanie({
      ...badanie,
      issue_date: new Date(badanie.issue_date),
      termination_date: new Date(badanie.termination_date),
    });
    setEditBadanieMode(true);
  };

  const handleCancelEditBadanie = () => {
    setEditingBadanie(null);
    setEditBadanieMode(false);
  };
  

  const handleRedirectToMedicalExamination = (id) => {
  window.location.href = `http://localhost:3000/medical-examination/${employeeDetails.id}`;
};


  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="bg-gray-100 p-4">
      <div className="flex flex-col lg:flex-row gap-8 justify-center lg:items-start">
        <div className="bg-white shadow rounded-lg p-6 w-full lg:max-w-md">
          <h1 className="font-bold text-xl mb-4">Konto Pracownika</h1>
          {employeeDetails && (
            <div>
              <p className="mb-3">Twoje dane:</p>
              <p className="mb-3">Imię: {employeeDetails.name}</p>
              <p className="mb-3">Nazwisko: {employeeDetails.surname}</p>
              <button
                type="button"
                onClick={toggleDetails}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showDetails ? 'Ukryj detale':'Dane szczegółowe'}
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
              onClick={toggleContracts}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {contractsVisible ?  'Zamknij umowy':'Moje umowy' }
            </button>
            <button
  onClick={toggleHolidayBase}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
>
  {holidayBaseVisible ? 'Zamknij urlop' : 'Podstawa urlopu'}
</button>
<button
                type="button"
                onClick={handleViewReport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              >
                Raporty i zaświadcznia
              </button>
              <button
  onClick={toggleBadania}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
>
  {badaniaVisible ? 'Zamknij badania' : 'Moje badania'}
</button>
            <button
                type="button"
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Wyloguj
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
                          <p className="font-medium">Numer id umowy podstawowej: {original.id}</p>
                        </div>
                        <div>
                          <p>Kwota brutto: {original.gross_amount}</p>
                          <p>Umowa od: {new Date(original.contract_from_date).toLocaleDateString()}</p>
                          <p>do: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
                          <p>Typ Umowy: {original.typ_umowy}</p>
                          <p>Stanowisko: {original.stanowisko}</p>
                          <p>Etat: {original.etat}</p>
                          <p>Rozpoczęcie pracy: {new Date(original.workstart_date).toLocaleDateString()}</p>
                          <p>typ rozwiązania umowy: {aneks.length > 0 ? aneks[aneks.length - 1].termination_type : original.termination_type}</p>
                          {/* New row for Contract Termination Status */}
                          <p>
                            Status umowy:
                            {new Date(aneks.length > 0 ? aneks[aneks.length - 1].contract_to_date : original.contract_to_date) < new Date()
                              ? <span style={{ color: 'red' }}> Zakończona</span>
                              : <span style={{ color: 'green' }}> Aktywna</span>}
                          </p>
                          <button 
              type="button"
              onClick={handleGenerateContractPage}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Zobacz umowę
            </button>
                        </div>
    
                        {/* Render Aneks Contracts */}
                        {aneks && aneks.length > 0 && (
                          <div>
                            <h4>Aneks:</h4>
                            {aneks.map(aneksContract => (
                              <div key={aneksContract.id}>
                                <p>Numer id aneksu: {aneksContract.id}</p>
                                <AneksView contract={aneksContract} originalContract={original} />
                                <div>
                                  <p>Kwota brutto: {aneksContract.gross_amount}</p>
                                  <p>Gross Amount: {aneksContract.termination_type}</p>
                                  <p>Aneks ważny od: {new Date(aneksContract.contract_from_date).toLocaleDateString()}</p>
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
               {badaniaVisible && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold">Badania Lekarskie</h3>
            {editBadanieMode ? (
              <form onSubmit={handleBadanieSubmit}>
                <label htmlFor="type">Typ badania:</label>
                <select
                  name="type"
                  value={editingBadanie.type}
                  onChange={handleBadanieChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="wstępne">wstępne</option>
                  <option value="okresowe">okresowe</option>
                  <option value="kontrolne">kontrolne</option>
                </select>
                <label htmlFor="issue_date" className="mt-4">Data od:</label>
                <DatePicker
                  selected={editingBadanie.issue_date}
                  onChange={(date) => handleBadanieDateChange(date, 'issue_date')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label htmlFor="termination_date" className="mt-4">Data do:</label>
                <DatePicker
                  selected={editingBadanie.termination_date}
                  onChange={(date) => handleBadanieDateChange(date, 'termination_date')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditBadanie}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <table className="min-w-full bg-white table-auto text-xs mt-4">
                  <thead>
                    <tr>
                      <th className="py-1 px-2 border-b">Data od</th>
                      <th className="py-1 px-2 border-b">Data do</th>
                      <th className="py-1 px-2 border-b">Typ badania</th>
                      <th className="py-1 px-2 border-b">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badania.length > 0 ? (
                      badania.map((badanie) => (
                        <tr key={badanie.id}>
                          <td className="py-1 px-2 border-b">{new Date(badanie.issue_date).toLocaleDateString()}</td>
                          <td className="py-1 px-2 border-b">{new Date(badanie.termination_date).toLocaleDateString()}</td>
                          <td className="py-1 px-2 border-b">{badanie.type}</td>
                          <td className="py-1 px-2 border-b flex gap-2">
                            <button onClick={() => handleEditBadanie(badanie)} className="text-blue-500">
                              Edytuj
                            </button>
                            <button onClick={() => handleRedirectToMedicalExamination(badanie.id)} className="text-green-500">
                              Zobacz
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-1 px-2 border-b" colSpan="4">
                          No badania available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

              {holidayBaseVisible && (
  <div className="border-t pt-4 mt-4">
    <h3 className="text-lg font-semibold">Podstawa urlopu</h3>
    {holidayBase ? (
      <div>
        {editHolidayBaseMode ? (
          <form onSubmit={handleQuickEditHolidayBase}>
            <label htmlFor="holiday_base">Holiday Base:</label>
            <select
              name="holiday_base"
              defaultValue={holidayBase.holiday_base}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={20}>20 days</option>
              <option value={26}>26 days</option>
            </select>
            <div className="flex gap-2 mb-2">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={toggleEditHolidayBaseMode}
                className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-2 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p><strong>Education Level:</strong> {holidayBase.education_level}</p>
            <p><strong>Education End Date:</strong> {holidayBase.education_end_date}</p>
            <p><strong>Total Staż:</strong> {holidayBase.total_staz_years} years, {holidayBase.total_staz_months} months, {holidayBase.total_staz_days} days</p>
            <p><strong>Holiday Base:</strong> {holidayBase.holiday_base} days</p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={toggleEditHolidayBaseMode}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
              >
                Quick Edit
              </button>
              <button
                onClick={handleHolidayBasePage}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
              >
                Edytuj Parametry
              </button>
            </div>
          </div>
        )}
      </div>
    ) : (
      <div>
        <p>Brak podstawy urlopu, dodaj proszę.</p>
        <button
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
          onClick={handleHolidayBasePage}
        >
          Dodaj podstawę
        </button>
      </div>
    )}
  </div>
)}

        </div>
        <div className={`bg-white shadow rounded-lg p-6 ${isCalendarExpanded ? 'w-full' : 'lg:max-w-md'}`}>
  <div className="flex justify-between items-center mb-4">
    <h2 className="font-bold text-xl">Kalendarz:</h2>
    <button
      type="button"
      onClick={toggleCalendarSize}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
    >
      {isCalendarExpanded ? 'Zmień na mniejszy' : 'Powiększ kalendarz'}
    </button>
  </div>
  <EmployeeBreaksCalendar employeeId={employeeDetails.id} /> {/* Pass the employeeId here */}
</div>

      </div>
      

      
    </div>
   
  );
}

export default EmployeeAccount;
