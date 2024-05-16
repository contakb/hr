import React, { useState, useEffect,useRef } from 'react'; // Add useEffect here

import { useLocation } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useRequireAuth } from './useRequireAuth';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';

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
}, [employeeId, location, employeeData]); // This is where useEffect should e

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
                Umowa od {new Date(contract.contract_from_date).toLocaleDateString()} do {new Date(contract.contract_to_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div className="printable-section bg-white p-8 text-xs"> {/* Makes all text within smaller */}
        <div class="contract-container bg-100 p-4 rounded-lg shadow">
        {/* Contract details */}
        {selectedContract ? (
          <div class="border border-gray-300 p-4">
            <header class="header mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p>{companyData.company_name}</p>
                  <p><strong>ul:</strong> {companyData.street} {companyData.number}, {companyData.post_code}, {companyData.city}</p>
                  <p><strong>NIP:</strong> {companyData.taxid}</p>
                </div>
                <div>
                  <p>{companyData.city}, dnia {selectedContract && selectedContract.contract_from_date ? new Date(selectedContract.contract_from_date).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </header>
    
            <section class="contract-section mb-4">
              
            <div class="text-center mb-2">
    <h1 class="text-lg font-bold">SKIEROWANIE NA BADANIA LEKARSKIE</h1>
    <select class="form-select block w-1/5 mx-auto mt-1 text-xs font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none">
        <option value="okresowe">wstępne</option>
        <option value="wstepne">okresowe</option>
        <option value="kontrolne">kontrolne</option>
    </select>
</div>

            <div class="h-8"></div> 
              <p>Działając na podstawie art.229 § 4a ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy (Dz.U. z 2020 r. poz. 1320 z późn. zm.), kieruję na badania lekarskie:</p>
              
              <div class="h-4"></div> 
              <p><strong>Panią/Panem: {employee.name} {employee.surname}</strong></p>
              <p><strong>nr PESEL:</strong>  zam. ul. {employee.pesel} {employee.number} {employee.postcode} {employee.city}</p>
              <p><strong>zamieszkałego:</strong>ul. {employee.street} {employee.number},  {employee.postcode}, {employee.city}</p>
              
              <div class="h-4"></div> 
              <p>zatrudnionego/zatrudnioną(*) lub podejmującego/podejmującą(*) pracę na stanowisku lub stanowiskach pracy: {selectedContract?.stanowisko}</p>
              
              <div class="h-4"></div> 
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
      <div class="h-4"></div> 
              <p>Opis warunków pracy uwzględniający informacje o występowaniu na stanowisku lub
stanowiskach  pracy  czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników
uciążliwych i innych wynikających ze sposobu wykonywania pracy, z podaniem wielkości
narażenia oraz aktualnych wyników badań i pomiarów czynników szkodliwych dla zdrowia,
wykonanych  na  tym  stanowisku/stanowiskach  – należy wpisać nazwę czynnika/czynników
i wielkość/wielkości narażenia(****): </p>
              <div class="h-2"></div> 
              <div class="overflow-x-auto">
      <table class="table-auto w-full text-left">
        
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
            <td class="border px-4 py-2"><strong>III.Czynniki chemiczne:
</strong></td>
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
            <td class="border px-4 py-2"><strong>IV. Czynniki biologiczne:</strong></td>
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
            <td class="border px-4 py-2"><strong>V. Inne czynniki, w tym niebezpieczne:</strong></td>
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
    <div class="h-2"></div> 
    <p>Łączna liczba czynników niebezpiecznych, szkodliwych dla zdrowia lub czynników uciążliwych i innych wynikających ze sposobu wykonywania pracy wskazanych w skierowaniu:</p>
<select className="form-select block w-full mt-1">
  <option value="0">Brak</option>
  {Array.from({ length: 10 }, (_, i) => (
    <option key={i + 1} value={i + 1}>{i + 1}</option>
  ))}
</select>
            </section>
            <div class="h-10"></div> 
            <div class="grid grid-cols-2 gap-2 text-center">
              <div>
                <p>Podpis osoby reprezentującej firmę</p>
                <div class="signature-line w-full border-t border-gray-400"></div>
              </div>
            </div>
            <div className="text-xs mt-4"> {/* Using text-xs to make the font smaller */}
            <h2 className="font-bold mb-2">Objaśnienia:</h2>
            <p>(*) Niepotrzebne skreślić.</p>
            <p>(**) W przypadku osoby, której nie nadano numeru PESEL – seria, numer i nazwa dokumentu potwierdzającego
tożsamość, a w przypadku osoby przyjmowanej do pracy - data urodzenia</p>
<p>(***) Opisać: rodzaj pracy, podstawowe czynności, sposób i czas ich wykonywania</p>
<p>(****) Opis warunków pracy uwzględniający w szczególności przepisy:</p>
<ul>1) wydane na podstawie:
        <li>a) art. 222 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu substancji
chemicznych, ich mieszanin, czynników lub procesów technologicznych o działaniu
rakotwórczym lub mutagennym</li>
<li>a) art. 222 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu substancji
chemicznych, ich mieszanin, czynników lub procesów technologicznych o działaniu
rakotwórczym lub mutagennym</li>
<li>b) art. 2221 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu szkodliwych
czynników biologicznych,</li>
<li>c) art. 227 § 2 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące badań i pomiarów
czynników szkodliwych dla zdrowia,</li>
<li>d) art. 228 § 3 ustawy z dnia 26 czerwca 1974 r. – Kodeks pracy dotyczące wykazu najwyższych
dopuszczalnych stężeń i natężeń czynników szkodliwych dla zdrowia w środowisku pracy,</li>
<li>e) art. 25 pkt 1 ustawy z dnia 29 listopada 2000 r. – Prawo atomowe (Dz. U. z 2021 r. poz. 1941 oraz
z 2022 r. poz. 974) dotyczące wskaźników pozwalających na wyznaczenie dawek
promieniowania jonizującego stosowanych przy ocenie narażenia na promieniowanie jonizujące;</li>
<p>2) załącznika nr 1 do rozporządzenia Ministra Zdrowia i Opieki Społecznej  z  dnia  30  maja  1996  r.
w sprawie przeprowadzania badań lekarskich pracowników, zakresu profilaktycznej opieki zdrowotnej
nad pracownikami oraz orzeczeń lekarskich wydawanych do celów przewidzianych w Kodeksie pracy
(Dz. U. z 2023 r. poz. 607)</p>
</ul>
<div class="h-2"></div>
<p>Skierowanie na badania lekarskie jest wydawane w dwóch egzemplarzach, z których jeden otrzymuje osoba kierowana
na badania.</p>
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
}

export default MedicalExaminationView;
