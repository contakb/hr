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
    const [showEmployeeInfo, setShowEmployeeInfo] = useState(false); // State to manage the visibility of employee info
    const [settlementPeriod, setSettlementPeriod] = useState('1-miesięczne'); // State for the settlement period
    const [urlop, setUrlop] = useState('20'); // Default to 20 days
    const [trainingDetails, setTrainingDetails] = useState(''); // Default to an empty string


  
  const navigate = useNavigate();

  const { employeeId } = useParams();

  const location = useLocation();
  const user = useRequireAuth();
  const employeeInfoRef = useRef(null);

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

const handleSettlementPeriodChange = (event) => {
  setSettlementPeriod(event.target.value);
};
const handleUrlopChange = (event) => {
  setUrlop(event.target.value);
};
const handleTrainingDetailsChange = (event) => {
  setTrainingDetails(event.target.value);
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

const scrollToEmployeeInfo = () => {
  setShowEmployeeInfo(true); // Show the employee info section
  employeeInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const closeEmployeeInfo = () => {
  setShowEmployeeInfo(false);
};

const calculateTerminationPeriod = (contract) => {
  const durationInDays = (new Date(contract.contract_to_date) - new Date(contract.contract_from_date)) / (1000 * 60 * 60 * 24);

  if (contract.typ_umowy === "próbny 1 miesiąc"|| contract.typ_umowy === "próbny 2 miesiące"|| contract.typ_umowy === "okres próbny 3 miesiące") {
    if (durationInDays <= 14) {
      return "3 dni robocze – jeżeli okres próbny nie przekracza 2 tygodni";
    } else if (durationInDays > 14 && durationInDays < 90) {
      return "1 tydzień – jeżeli okres próbny jest dłuższy niż 2 tygodnie";
    } else if (durationInDays === 90) {
      return "2 tygodnie – jeżeli okres próbny wynosi 3 miesiące";
    }
  } else if (contract.typ_umowy === "określony"|| contract.typ_umowy === "nieokreślony") {
    if (durationInDays <= 182) { // 6 months
      return "2 tygodnie – przy zatrudnieniu nieprzekraczającym 6 miesięcy";
    } else if (durationInDays > 182 && durationInDays < 1095) { // 3 years
      return "1 miesiąc – jeżeli zatrudnienie wynosi co najmniej 6 miesięcy";
    } else if (durationInDays >= 1095) {
      return "3 miesiące – gdy zatrudnienie trwa minimum 3 lata";
    }
  

}
  return "Nie dotyczy";
};

const calculateWorkingHours = (etat) => {
  // Ensure etat is a string
  const etatStr = String(etat);
  const [numerator, denominator] = etatStr.split('/').map(Number);
  const fraction = numerator / denominator;

  // Standard full-time hours
  const fullTimeDailyHours = 8;
  const fullTimeWeeklyHours = 40;

  // Calculate fractional hours
  const dailyHours = fullTimeDailyHours * fraction;
  const weeklyHours = fullTimeWeeklyHours * fraction;

  // Format hours to hours and minutes
  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} godz. ${m > 0 ? `${m} min.` : ''}`;
  };

  return {
    dailyHours: formatHours(dailyHours),
    weeklyHours: formatHours(weeklyHours)
  };
};

const workingHours = selectedContract ? calculateWorkingHours(selectedContract.etat) : { dailyHours: "N/A", weeklyHours: "N/A" };



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
    
    <div class="mt-4">
    <button onClick={scrollToEmployeeInfo} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Informacja dla Pracownika</button>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleBackClick}>Back</button>
      <button onClick={() => window.print()} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Print or Save as PDF
</button>
<button onClick={handleDownloadPDFClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Download PDF
      </button>
      
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
    {/* Add Employee Info Section here */}
    <div ref={employeeInfoRef} className="mt-8 break-before-page">
    <div class="contract-container bg-100 p-4 rounded-lg shadow">
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
          
          <h1 class="contract-title text-2xl font-bold mb-3 text-center">Informacja dla pacownika</h1>
            <p>Działając na podstawie art.29 § 3 KP informuję  <strong>Panią/Pana: {employee.name} {employee.surname}</strong> że:</p>
            <ol className="list-decimal list-inside mt-4 space-y-2">
            <li>Obowiązuje Panią:
                <ul className="list-disc list-inside ml-4">
                <li>{workingHours.dailyHours} norma dobowa</li>
                  <li>{workingHours.weeklyHours} norma tygodniowa</li>
                    czasu pracy w okresie rozliczeniowym wynoszącym
                    <select value={settlementPeriod} onChange={handleSettlementPeriodChange} className="ml-2 inline-block border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="1-miesięczne">1-miesięczne</option>
                      <option value="2-miesięczne">2-miesięczne</option>
                      <option value="3-miesięczne">3-miesięczne</option>
                      <option value="4-miesięczne">4-miesięczne</option>
                      <option value="12-miesięczne">12-miesięczne</option>
                    </select>
                  
                </ul>
              </li>
              <li>Obowiązujący Panią wymiar czasu pracy ustalany jest na podstawie art. 129 Kodeksu pracy i wynosi:
                <ul className="list-disc list-inside ml-4">
                  <li>dobowo – {workingHours.dailyHours}</li>
                  <li>tygodniowo – {workingHours.weeklyHours}</li>
                </ul>
              </li>
              <li>Przysługują Pani następujące przerwy w pracy wliczane do czasu pracy:
                <ul className="list-disc list-inside ml-4">
                  <li>jedna co najmniej 15 minutowa przerwa</li>
                </ul>
              </li>
              <li>Przysługują Pani odpoczynki dobowe i tygodniowe:
                <ul className="list-disc list-inside ml-4">
                  <li>11 godzin nieprzerwanego odpoczynku w każdej dobie pracowniczej</li>
                  <li>35 godzin nieprzerwanego odpoczynku w każdym tygodniu pracy</li>
                </ul>
              </li>
              <li>Obowiązują Panią następujące zasady dotyczące pracy w godzinach nadliczbowych i rekompensaty za nie: nie dotyczy</li>
              <li>Obowiązują Panią następujące zasady przechodzenia ze zmiany na zmianę: nie dotyczy</li>
              <li>Obowiązują Panią następujące zasady przemieszczania się między miejscami wykonywania pracy: nie dotyczy</li>
              <li>Przysługują Pani inne niż określone w umowie o pracę składniki wynagrodzenia oraz świadczenia pieniężne lub rzeczowe: nie dotyczy</li>
              <li>Przysługuje Pani następujący wymiar płatnego urlopu:
                <ul className="list-disc list-inside ml-4">

  <p>Z upływem każdego miesiąca pracy uzyskuje Pani prawo do urlopu wypoczynkowego w wymiarze 1/12 wymiaru całorocznego. Wymiar całoroczny wynosi
  <select value={urlop} onChange={handleUrlopChange} className="ml-2 inline-block border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
    <option value="20">20 dni</option>
    <option value="26">26 dni</option>
  </select>. Na dzień 01.04.2024 r. przysługuje 0 dni urlopu.</p>

                  <li>Urlop zaległy wynosi: 0 dni</li>
                  <li>Urlop wykorzystany: 0 dni</li>
                  <li>Pozostało do wykorzystania: 0 dni</li>
                </ul>
              </li>
              <li>Obowiązują Panią następujące zasady rozwiązania stosunku pracy:
                <ul className="list-disc list-inside ml-4">
                  <li>Umowa o pracę może zostać rozwiązana:</li>
                  <li>na mocy porozumienia stron</li>
                  <li>przez oświadczenie jednej ze stron z zachowaniem okresu wypowiedzenia</li>
                  <li>przez oświadczenie jednej ze stron bez zachowania okresu wypowiedzenia</li>
                  <li>z upływem czasu na który była zawarta</li>
                </ul>
                <p>Długość okresu wypowiedzenia umowy o pracę <strong>na czas: {selectedContract ? selectedContract.typ_umowy : "N/A"}</strong>  wynosi: {selectedContract ? calculateTerminationPeriod(selectedContract) : "N/A"}.</p>
                <p>Termin odwołania się do sądu pracy wynosi 21 dni od dnia doręczenia wypowiedzenia.</p>
              </li>
              <li>
  Przysługuje Pani prawo do szkoleń:
  <input 
    type="text" 
    value={trainingDetails} 
    onChange={handleTrainingDetailsChange} 
    className="ml-2 inline-block border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
    placeholder="nie dotyczy"
  />
</li>
              <li>Nie obejmuje Panią żaden zakładowy układ zbiorowy pracy.</li>
              <li>Dodatkowe zapisy:
                <ul className="list-disc list-inside ml-4">
                  <li>Wynagrodzenie za pracę wypłacane jest raz w miesiącu z dołu ostatniego dnia miesiąca kalendarzowego przelewem na podany nr rachunku bankowego lub po złożeniu przez Panią oświadczenia na piśmie – gotówką w siedzibie firmy.</li>
                  <li>Pora nocna obejmuje: godz.: 22 - 8</li>
                  <li>Obecność w pracy potwierdza się przez podpisanie listy obecności znajdującej się w siedzibie firmy. Każde wyjście poza siedzibę firmy wymaga zgody przełożonego.</li>
                  <li>Nieobecność w pracy usprawiedliwia się najpóźniej w drugim dniu jej trwania przez zgłoszenie tego faktu bezpośredniemu przełożonemu lub pracownikowi działu kadr.</li>
                </ul>
              </li>
              <li>Nazwa instytucji zabezpieczenia społecznego do której wpływają składki na ubezpieczenia społeczne związane ze stosunkiem pracy: Zakład Ubezpieczeń Społecznych</li>
              <li>Nazwa instytucji związanej z zabezpieczeniem społecznym zapewnianej przez pracodawcę: nie dotyczy</li>
            </ol>
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
          </div>
          </div>
    </div>
    
    
  </div>
  </div>
  
);

};

export default EmployeeContract;
