import React, { useState, useEffect,useRef } from 'react'; // Add useEffect here

import { useLocation } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';

import DatePicker from 'react-datepicker'; // Import DatePicker for handling dates
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

function MedicalExaminationView() {
  const location = useLocation();
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const user = useRequireAuth();
  const [physicalFactors, setPhysicalFactors] = useState([]);
const [dusts, setDusts] = useState([]);
const [chemicalFactors, setChemicalFactors] = useState([]);
const [biologicalFactors, setBiologicalFactors] = useState([]);
const [otherFactors, setOtherFactors] = useState([]);
const [stanowisko, setStanowisko] = useState([]);


  const [employee, setEmployee] = useState({});;
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState('');
    const [userInput, setUserInput] = useState(''); // State to hold the user input
    const hasErrorBeenShown = useRef(false); // Ref to track if the error toast has been shown
    const inputRef = useRef(null);
    const [date, setDate] = useState(new Date());
    const [month, setMonth] = useState(date.getMonth() + 1);
    const [year, setYear] = useState(date.getFullYear());
    
    const [badania, setBadania] = useState([]);
  const [newBadanie, setNewBadanie] = useState({ type: '', issue_date: '', termination_date: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingBadanieId, setEditingBadanieId] = useState(null);
  const [showForm, setShowForm] = useState(false);


console.log('Location:', location);
  // Initial state for employeeData
  const [employeeData, setEmployeeData] = useState(location.state?.employee || null);

  
    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

useEffect(() => {
  if(inputRef.current) {
    inputRef.current.focus();
  }
}, [userInput]);  // Re-focus every time userInput changes, though typically you might not need this unless there are specific reasons for refocusing.

const fetchEmployeeData = async () => {
  
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
};


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
const handleContractSelection = (e) => {
  setSelectedContractId(e.target.value);
};



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
useEffect(() => {
  fetchCompanyData();
  return () => { hasErrorBeenShown.current = false; }; // Reset on unmount
}, []);  // Dependency array is empty to ensure this runs only once on mount
const handleInputChange = (event) => {
  setUserInput(event.target.value); // Update the state when the input changes
};

const physicalOptions = [
  { value: 'brak', label: 'Brak' },
  { value: 'faktor_1', label: 'Faktor 1' },
  { value: 'faktor_2', label: 'Faktor 2' },
  // Add more options as needed
];

const dustOptions = [
  { value: 'pyl_1', label: 'Pył 1' },
  { value: 'pyl_2', label: 'Pył 2' },
  { value: 'pyl_3', label: 'Pył 3' },
  // Add more options as needed
];

const chemicalOptions = [
  { value: 'brak', label: 'Brak' },
  { value: 'chemikalia_1', label: 'Chemikalia 1' },
  { value: 'chemikalia_2', label: 'Chemikalia 2' },
  // Add more options as needed
];

const biologicalOptions = [
  { value: 'biologiczny_1', label: 'Biologiczny 1' },
  { value: 'biologiczny_2', label: 'Biologiczny 2' },
  // Add more options as needed
];

const otherOptions = [
  { value: 'inne_1', label: 'Inne 1' },
  { value: 'inne_2', label: 'Inne 2' },
  // Add more options as needed
];

const opisstanowiska = [
  { value: 'praca przy komputerze', label: 'praca przy komputerze  powyżej 4h' },
  { value: 'inne_2', label: 'Inne 2' },
  // Add more options as needed
];

const fetchBadaniaData = async () => {
  try {
    const response = await axiosInstance.get(`http://localhost:3001/api/badania/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'x-schema-name': user.schemaName,
      }
    });
    setBadania(response.data);
  } catch (error) {
    console.error('Error fetching badania data:', error);
  }
};

useEffect(() => {
  fetchCompanyData();
  fetchEmployeeData();
  fetchBadaniaData();
}, [employeeId, user]);

const handleBadanieChange = (e) => {
  setNewBadanie({ ...newBadanie, [e.target.name]: e.target.value });
};

const handleBadanieDateChange = (date, name) => {
  setNewBadanie({ ...newBadanie, [name]: date });
};

const handleBadanieSubmit = async (e) => {
  e.preventDefault();
  try {
    const url = isEditing
      ? `http://localhost:3001/api/badania/${editingBadanieId}`
      : 'http://localhost:3001/api/badania';
    const method = isEditing ? 'put' : 'post';
    await axiosInstance[method](url, { ...newBadanie, employee_id: employeeId }, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'x-schema-name': user.schemaName,
      },
    });
    setIsEditing(false);
    setEditingBadanieId(null);
    setNewBadanie({ type: '', issue_date: '', termination_date: '' });
    toast.success('Badanie saved successfully');
    fetchBadaniaData(); // Re-fetch badania data
    setShowForm(false); // Hide form after submit
  } catch (error) {
    console.error('Error saving badanie:', error);
    toast.error('Failed to save badanie');
  }
};


const handleEditBadanie = (badanie) => {
  setNewBadanie({
    type: badanie.type,
    issue_date: new Date(badanie.issue_date),
    termination_date: new Date(badanie.termination_date),
  });
  setIsEditing(true);
  setEditingBadanieId(badanie.id);
  setShowForm(true);
};

const handleDeleteBadanie = async (id) => {
  try {
    await axiosInstance.delete(`http://localhost:3001/api/badania/${id}`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'x-schema-name': user.schemaName,
      },
    });
    toast.success('Badanie deleted successfully');
    fetchBadaniaData(); // Re-fetch badania data
  } catch (error) {
    console.error('Error deleting badanie:', error);
    toast.error('Failed to delete badanie');
  }
};

const onDateChange = (date) => {
  setDate(date);
};


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
      
      <div className="bg-white p-8">
        <div className="max-w-2xl mx-auto">
          {/* Form for adding/editing badania */}
          {showForm && (
            <form onSubmit={handleBadanieSubmit} className="mb-4">
              <h3 className="text-l font-semibold">{isEditing ? 'Edytuj badanie' : 'Dodaj badanie'}</h3>
              <table className="min-w-full bg-white table-auto text-xs">
                <thead>
                  <tr>
                    <th className="py-1 px-2 border-b">Typ badania</th>
                    <th className="py-1 px-2 border-b">Data od</th>
                    <th className="py-1 px-2 border-b">Data do</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2 border-b">
                      <select
                        name="type"
                        value={newBadanie.type}
                        onChange={handleBadanieChange}
                        className="text-xs p-1 rounded border-gray-300 w-full"
                      >
                        <option value="">wybierz</option>
                        <option value="wstępne">wstępne</option>
                        <option value="okresowe">okresowe</option>
                        <option value="kontrolne">kontrolne</option>
                      </select>
                    </td>
                    <td className="py-1 px-2 border-b">
                      <DatePicker
                        selected={newBadanie.issue_date}
                        onChange={(date) => handleBadanieDateChange(date, 'issue_date')}
                        className="text-xs p-1 rounded border-gray-300 w-full"
                      />
                    </td>
                    <td className="py-1 px-2 border-b">
                      <DatePicker
                        selected={newBadanie.termination_date}
                        onChange={(date) => handleBadanieDateChange(date, 'termination_date')}
                        className="text-xs p-1 rounded border-gray-300 w-full"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex space-x-2 mt-2">
                <button type="submit" className="bg-blue-500 text-white text-xs p-2 rounded">
                  {isEditing ? 'Update Badanie' : 'Add Badanie'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setNewBadanie({ type: '', issue_date: '', termination_date: '' });
                  }}
                  className="bg-gray-500 text-white text-xs p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
    
          
          {/* List of badania */}
          <h2 className="text-xl font-semibold mb-2">Badania for Employee {employeeId}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white table-auto text-xs">
              <thead>
                <tr>
                  <th className="py-1 px-2 border-b">Data od</th>
                  <th className="py-1 px-2 border-b">Data do</th>
                  <th className="py-1 px-2 border-b">Typ badania</th>
                  <th className="py-1 px-2 border-b">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {badania.map((badanie) => (
                  <tr key={badanie.id}>
                    <td className="py-1 px-2 border-b">{new Date(badanie.issue_date).toLocaleDateString()}</td>
                    <td className="py-1 px-2 border-b">{new Date(badanie.termination_date).toLocaleDateString()}</td>
                    <td className="py-1 px-2 border-b">{badanie.type}</td>
                    <td className="py-1 px-2 border-b">
                      <button onClick={() => handleEditBadanie(badanie)} className="text-blue-500">Edit</button>
                      <button onClick={() => handleDeleteBadanie(badanie.id)} className="text-red-500 ml-2">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white text-xs p-1 rounded mt-4"
            >
              Dodaj badanie
            </button>
          )}
            </table>
           
    
          </div>
          {/* Dropdown for selecting a contract */}
          <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">wybierz umowę</h2>
            <select
              className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              onChange={handleContractSelection}
              value={selectedContractId}
            >
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  Umowa od {new Date(contract.contract_from_date).toLocaleDateString()} do {new Date(contract.contract_to_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
    
          <div className="printable-section bg-white p-8 text-xs">
            <div className="contract-container bg-100 p-4 rounded-lg shadow">
              {/* Contract details */}
              {selectedContract ? (
                <div className="border border-gray-300 p-4">
                  <header className="header mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>{companyData.company_name}</p>
                        <p>
                          <strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}
                        </p>
                        <p>
                          <strong>NIP:</strong> {companyData.taxid}
                        </p>
                      </div>
                      <div>
                        <p>{companyData.city}, dnia {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </header>
    
                  <section className="contract-section mb-4">
                    <div className="text-center mb-2">
                      <h1 className="text-lg font-bold">SKIEROWANIE NA BADANIA LEKARSKIE</h1>
                      <select className="form-select block w-1/5 mx-auto mt-1 text-xs font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
                        <option value="okresowe">wstępne</option>
                        <option value="wstepne">okresowe</option>
                        <option value="kontrolne">kontrolne</option>
                      </select>
                    </div>
    
                    <div className="h-8"></div>
                    <p>
                      Działając na podstawie art.229 § 4a ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy (Dz.U. z 2020 r. poz. 1320 z późn. zm.), kieruję na badania lekarskie:
                    </p>
                    <div className="h-4"></div>
                    <p>
                      <strong>Panią/Panem: {employee.name} {employee.surname}</strong>
                    </p>
                    <p>
                      <strong>nr PESEL:</strong> zam. ul. {employee.pesel} {employee.number} {employee.postcode} {employee.city}
                    </p>
                    <p>
                      <strong>zamieszkałego:</strong>ul. {employee.street} {employee.number}, {employee.postcode}, {employee.city}
                    </p>
                    <div className="h-4"></div>
                    <p>
                      zatrudnionego/zatrudnioną(*) lub podejmującego/podejmującą(*) pracę na stanowisku lub stanowiskach pracy: {selectedContract?.stanowisko}
                    </p>
                    <div className="h-4"></div>
                    <p>określenie stanowiska/stanowisk(*) pracy(***):</p>
                    <div className="flex-1">
                      <td className="border px-4 py-2">
                        <CreatableSelect
                          isMulti
                          options={opisstanowiska}
                          value={stanowisko}
                          onChange={setStanowisko}
                          placeholder="dodaj opis......"
                        />
                      </td>
                    </div>
                    <div className="h-4"></div>
                    <p>
                      Opis warunków pracy uwzględniający informacje o występowaniu na stanowisku lub stanowiskach pracy czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych i innych wynikających ze sposobu wykonywania pracy, z podaniem wielkości narażenia oraz aktualnych wyników badań i pomiarów czynników szkodliwych dla zdrowia, wykonanych na tym stanowisku/stanowiskach – należy wpisać nazwę czynnika/czynników i wielkość/wielkości narażenia(****):
                    </p>
                    <div className="h-2"></div>
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full text-left">
                        <tbody>
                          <tr>
                            <td className="border px-4 py-2"><strong>I. Czynniki fizyczne:</strong></td>
                            <td className="border px-4 py-2">
                              <CreatableSelect
                                isMulti
                                options={physicalOptions}
                                value={physicalFactors}
                                onChange={setPhysicalFactors}
                                placeholder="brak lub dodaj czynnik..."
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2"><strong>II. Pyły:</strong></td>
                            <td className="border px-4 py-2">
                              <CreatableSelect
                                isMulti
                                options={dustOptions}
                                value={dusts}
                                onChange={setDusts}
                                placeholder="brak lub dodaj pyły......"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2"><strong>III.Czynniki chemiczne:</strong></td>
                            <td className="border px-4 py-2">
                              <CreatableSelect
                                isMulti
                                options={chemicalOptions}
                                value={chemicalFactors}
                                onChange={setChemicalFactors}
                                placeholder="brak lub dodaj czynnik......"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2"><strong>IV. Czynniki biologiczne:</strong></td>
                            <td className="border px-4 py-2">
                              <CreatableSelect
                                isMulti
                                options={biologicalOptions}
                                value={biologicalFactors}
                                onChange={setBiologicalFactors}
                                placeholder="brak lub dodaj czynnik......"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2"><strong>V. Inne czynniki, w tym niebezpieczne:</strong></td>
                            <td className="border px-4 py-2">
                              <CreatableSelect
                                isMulti
                                options={otherOptions}
                                value={otherFactors}
                                onChange={setOtherFactors}
                                placeholder="brak lub dodaj czynnik......"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="h-2"></div>
                    <p>Łączna liczba czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych i innych wynikających ze sposobu wykonywania pracy wskazanych w skierowaniu:</p>
                    <select className="form-select block w-full mt-1">
                      <option value="0">Brak</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </section>
                  <div className="h-10"></div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p>Podpis osoby reprezentującej firmę</p>
                      <div className="signature-line w-full border-t border-gray-400"></div>
                    </div>
                  </div>
                  <div className="text-xs mt-4">
                    <h2 className="font-bold mb-2">Objaśnienia:</h2>
                    <p>(*) Niepotrzebne skreślić.</p>
                    <p>
                      (**) W przypadku osoby, której nie nadano numeru PESEL – seria, numer i nazwa dokumentu potwierdzającego tożsamość, a w przypadku osoby przyjmowanej do pracy - data urodzenia
                    </p>
                    <p>(***) Opisać: rodzaj pracy, podstawowe czynności, sposób i czas ich wykonywania</p>
                    <p>(****) Opis warunków pracy uwzględniający w szczególności przepisy:</p>
                    <ul>
                      <li>a) art. 222 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu substancji chemicznych, ich mieszanin, czynników lub procesów technologicznych o działaniu rakotwórczym lub mutagennym</li>
                      <li>b) art. 2221 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu szkodliwych czynników biologicznych,</li>
                      <li>c) art. 227 § 2 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące badań i pomiarów czynników szkodliwych dla zdrowia,</li>
                      <li>d) art. 228 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu najwyższych dopuszczalnych stężeń i natężeń czynników szkodliwych dla zdrowia w środowisku pracy,</li>
                      <li>e) art. 25 pkt 1 ustawy z dnia 29 listopada 2000 r. – Prawo atomowe (Dz. U. z 2021 r. poz. 1941 oraz z 2022 r. poz. 974) dotyczące wskaźników pozwalających na wyznaczenie dawek promieniowania jonizującego stosowanych przy ocenie narażenia na promieniowanie jonizujące;</li>
                    </ul>
                    <p>2) załącznika nr 1 do rozporządzenia Ministra Zdrowia i Opieki Społecznej z dnia 30 maja 1996 r. w sprawie przeprowadzania badań lekarskich pracowników, zakresu profilaktycznej opieki zdrowotnej nad pracownikami oraz orzeczeń lekarskich wydawanych do celów przewidzianych w Kodeksie pracy (Dz. U. z 2023 r. poz. 607)</p>
                    <div className="h-2"></div>
                    <p>Skierowanie na badania lekarskie jest wydawane w dwóch egzemplarzach, z których jeden otrzymuje osoba kierowana na badania.</p>
                  </div>
                </div>
              ) : (
                <p>No contract selected.</p>
              )}
            </div>
          </div>
    
          
    
          {/* Other existing content */}
          <div className="mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleBackClick}>Back</button>
            <button onClick={() => window.print()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Print or Save as PDF
            </button>
            <button onClick={handleDownloadPDFClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
    
}

export default MedicalExaminationView;
