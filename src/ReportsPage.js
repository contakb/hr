import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path
import { useRequireAuth } from './useRequireAuth';

function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  const [reportType, setReportType] = useState('');
  const [month, setMonth] = useState(currentMonth.toString()); // Initialize to current month
  const [year, setYear] = useState(currentYear.toString()); // Initialize to current year
  const [reportData, setReportData] = useState([]);
  const [totalGrossAmount, setTotalGrossAmount] = useState(0);
  const [totalNetAmount, setTotalNetAmount] = useState(0);
  const [isReportGenerated, setIsReportGenerated] = useState(false); // New state variable
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [periodStart, setPeriodStart] = useState('');
const [periodEnd, setPeriodEnd] = useState('');
const [selectedRange, setSelectedRange] = useState(3); // Default to 3 months
const [contracts, setContracts] = useState([]);
const [companyData, setCompanyData] = useState(null);
const [error, setError] = useState(null);
const user = useRequireAuth();
  const userEmail = user?.email; // Safely access the email property






// Assuming month and year are selected by the user
const selectedYear = parseInt(year); // Make sure to parse the year to an integer
const selectedMonth = parseInt(month); // Parse the month to an integer

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 2051 - 1990 }, (_, i) => i + 1990);


// Calculate the end date
const endDate = new Date(selectedYear, selectedMonth - 1, 0); // Subtract 1 from the month


console.log(endDate.toISOString().split('T')[0]); // Logs the correct last day of the selected month


  const calculateSum = (data, field) => {
    return data.reduce((sum, record) => sum + parseFloat(record[field]), 0);
  };

  // Function to calculate the sum of a specific field in the data array
const calculateTotal = (data, field) => {
  return data.reduce((acc, item) => acc + (item[field] || 0), 0);
};

// Function to process social insurance data
const processSocialInsuranceData = (data) => {
  const totalEmrytUb = calculateTotal(data, 'emeryt_ub');
  const totalEmerytPr = calculateTotal(data, 'emeryt_pr');
  const totalRentUb = calculateTotal(data, 'rent_ub');
  const totalRentPr = calculateTotal(data, 'rent_pr');
  const totalChorobowe = calculateTotal(data, 'chorobowe');
  const totalWypadkowe = calculateTotal(data, 'wypadkowe');
  const totalFp = calculateTotal(data, 'fp');
  const totalFgsp = calculateTotal(data, 'fgsp');
  const totalHealthAmount = calculateTotal(data, 'heath_amount');

  const totalSpołeczne = totalEmrytUb + totalEmerytPr + totalRentUb + totalRentPr + totalChorobowe + totalWypadkowe;
  const totalemeryt = totalEmrytUb + totalEmerytPr;
  const totalrentowe = totalRentUb + totalRentPr;
  const totalSpołeczneUb = totalEmrytUb +  totalRentUb + totalChorobowe;
  const totalSpołecznePr = totalEmerytPr + totalRentPr + totalWypadkowe;

  const totalFPFGŚP = totalFp + totalFgsp;
  const grandTotal = totalSpołeczne + totalFPFGŚP + totalHealthAmount;
  const totalEmployeeContribution = totalEmrytUb + totalRentUb + totalChorobowe + totalHealthAmount;
  const totalEmployerContribution = totalEmerytPr + totalRentPr + totalWypadkowe + totalFp + totalFgsp;

  return {
    totalEmrytUb, totalEmerytPr, totalRentUb, totalRentPr, totalChorobowe, totalWypadkowe,
    totalFp, totalFgsp, totalHealthAmount, totalSpołeczne, totalFPFGŚP, grandTotal, totalEmployeeContribution, totalEmployerContribution, totalSpołeczneUb, totalSpołecznePr,  totalemeryt,  totalrentowe,
  };
};


const handleGenerateReport = async () => {
  setIsReportGenerated(false); // Reset the flag before generating a new report

  try {
    let responseData;

    if (reportType === 'earnings-certificate' && selectedEmployee) {
      const range = parseInt(selectedRange); // Convert the selected range to an integer

      // Calculate the period for the last three completed months
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // Note: January is 0

      // Calculate end month and year
      const calculatedEndYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const calculatedEndMonth = currentMonth === 0 ? 11 : currentMonth - 1;

      // Calculate start month and year based on the selected range
      const calculatedStartYear = (calculatedEndMonth - range + 1) >= 0 ? calculatedEndYear : calculatedEndYear - 1;
      const calculatedStartMonth = (calculatedEndMonth - range + 1) >= 0 ? calculatedEndMonth - range + 1 : 12 + (calculatedEndMonth - range + 1);

      const periodStart = `${calculatedStartMonth + 1}/${calculatedStartYear}`;
      const periodEnd = `${calculatedEndMonth + 1}/${calculatedEndYear}`;

      console.log(`Period Start: ${periodStart}`); // Log the start of the period
      console.log(`Period End: ${periodEnd}`); // Log the end of the period

      setPeriodStart(periodStart);
      setPeriodEnd(periodEnd);

      // Split the period into start and end parts
      const [splitStartMonth, splitStartYear] = periodStart.split('/');
      const [splitEndMonth, splitEndYear] = periodEnd.split('/');

      const response = await axios.get(`http://localhost:3001/api/salary/recent/${selectedEmployee}?startYear=${splitStartYear}&startMonth=${splitStartMonth}&endYear=${splitEndYear}&endMonth=${splitEndMonth}`);
      
      const recentData = response.data;
  
      // Calculate averages or other necessary details for the report
      const totalGross = recentData.reduce((acc, curr) => acc + curr.gross_total, 0);
      const totalNet = recentData.reduce((acc, curr) => acc + curr.net_amount, 0);
      setTotalGrossAmount(totalGross / recentData.length);
      setTotalNetAmount(totalNet / recentData.length);
  
      setReportData(recentData); // Store the fetched data
      setIsReportGenerated(true);
    } else if (reportType === 'social-insurance') {
      // Logic for fetching social insurance data
      const response = await axios.get(`http://localhost:3001/reports/social-insurance?month=${month}&year=${year}`);
      responseData = processSocialInsuranceData(response.data);
      setReportData(responseData); // Set the processed data
      setIsReportGenerated(true);
    } else {
      // Existing logic for other report types
      const response = await axios.get(`http://localhost:3001/reports?month=${month}&year=${year}`);
      responseData = response.data;

      if (reportType === 'total-gross-amount') {
        setTotalGrossAmount(calculateSum(responseData, 'gross_total'));
      } else if (reportType === 'total-net-amount') {
        setTotalNetAmount(calculateSum(responseData, 'net_amount'));
      }
      setReportData(responseData); // Set the response data
      setIsReportGenerated(true);
    }
  } catch (error) {
    console.error(`Error fetching ${reportType} data:`, error);
    setReportData([]);
  }
};


  const reportRef = useRef();

const handlePrint = () => {
  const printContent = reportRef.current;
  const windowPrint = window.open('', '', 'height=600,width=800');
  windowPrint.document.write(printContent.innerHTML);
  windowPrint.document.close();
  windowPrint.focus();
  windowPrint.print();
  windowPrint.close();
};
  

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
    });
};

useEffect(() => {
  fetchCompanyData();
}, []);
  
  const toggleContracts = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/contracts/${selectedEmployee}`);
        console.log("Fetched contracts:", response.data.contracts);
        const combinedContracts = combineContracts(response.data.contracts);
        console.log("Combined contracts:", combinedContracts);
        setContracts(combinedContracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      }
  };

  useEffect(() => {
    if (selectedEmployee) {
      toggleContracts();
    }
  }, [selectedEmployee]);  // Depend on selectedEmployee

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
  

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/employees');
      // Check if the response contains the 'employees' key and it's an array
      if (response.data && Array.isArray(response.data.employees)) {
        setEmployees(response.data.employees);
      } else {
        console.error('Unexpected response structure:', response.data);
        // Handle the unexpected structure appropriately
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Handle the error appropriately
    }
  };

  
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const renderFormFields = () => {
    if (reportType === 'earnings-certificate') {
      return (
        <>
        <label>
          Employee:
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name} {employee.surname}</option>
            ))}
          </select>
        </label>
        <label>
          Period Range (Months):
          <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
            <option value="1">1 Month</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months</option>
            {/* Add more options if needed */}
          </select>
        </label>
      </>
      );
    } 
  };

  const renderCompanyData = () => {
    if (companyData) {
      return (
        <div>
          <h3>Dane firmy:</h3>
          <p>Name: {companyData.company_name}</p>
          <p>Address: {companyData.street} {companyData.number},{companyData.post_code} {companyData.city}</p>
          {/* Render other company data as needed */}
        </div>
      );
    } else {
      return <p>No company data available.</p>;
    }
  };

  const renderReportTable = () => {
    const monthName = month ? new Date(year, month - 1).toLocaleString('default', { month: 'long' }) : '';
    if (!isReportGenerated) return null; // Do not render if the report has not been generated
  
    const getEmployeeName = (employeeId) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee ? `${employee.name} ${employee.surname}` : 'Unknown';
    };
  
    // Console logs should be outside of the return statement
    console.log("Selected Employee ID:", selectedEmployee);
    console.log("Employees Array:", employees);
  
    const selectedEmployeeData = employees.find(emp => emp.id === Number(selectedEmployee));
    console.log("Selected Employee Data:", selectedEmployeeData);
  
    // Now return the JSX
    return (
      <div ref={reportRef}>
       {reportType === 'earnings-certificate' && (
        <>
        <div class="signature-area">

<div className="signature" >
  <p>{renderCompanyData()} {/* Render company data */}</p>
</div>
</div>
          <h1>Zaświadczenie</h1>
          
          
          {selectedEmployeeData && (
            
            <div>
              <p>Zaświadcza się, że Pan/Pani: {selectedEmployeeData ? `${selectedEmployeeData.name} ${selectedEmployeeData.surname}` : 'Unknown'}</p>
              <p>Pesel: {selectedEmployeeData.pesel}</p>
              <p>zam. adres: {selectedEmployeeData.city}</p>
             

              jest zatrudniony w {companyData.company_name}
              {/* Add more details as needed */}
            </div>
          )}
  <div>
    {contracts.map(({ original, aneks }) => (
      <div key={original.id}>
        {/* Render Original Contract Details */}
        <p>na umowę na czas: {original.typ_umowy}</p>
              <p>od dnia {new Date(original.contract_from_date).toLocaleDateString()} do dnia: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
              <p>na stanowisku: {original.stanowisko}</p>
              <p>w wymiarze etatu: {original.etat}</p>
              <p>Data zatrudnienia: {new Date(original.workstart_date).toLocaleDateString()}</p>
        {/* ...other original contract details... */}
      </div>
    ))}
  </div>
  <h3>Średnie wynagrodzenie z ostanich: ({selectedRange}) miesięcy za okres od {periodStart} to {periodEnd}</h3>
          <p>Average Gross Amount : {totalGrossAmount.toFixed(2)}</p>
          <p>Average Net Amount : {totalNetAmount.toFixed(2)}</p>

          <p>Pracownik nie jest w okresie wypowiedzenia.</p>
          <p>Firma nie znajduje się w stanie likwidacji ani upadłości.</p>
          <p>Zaświadczenie zachowuje ważność przez okres 1 miesiąca od daty wystawienia.</p>

{/* Signature Block */}
<div class="signature-area">

      <div className="signature" >
        <p>Company Representative Signature</p>
        <div class="signature-line"></div>
        <p>Name: [Company Representative Name]</p>
      </div>
      </div>
          
        </>
      )}
      {reportType === 'total-gross-amount'&& (
        <>
          <h3>Total Gross Amount for {monthName} {year}: {totalGrossAmount.toFixed(2)}</h3>
          <table>
            <thead>
              <tr>
                <th>Name and surname</th>
                <th>Gross Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((report, index) => (
                <tr key={index}>
                  <td>{getEmployeeName(report.employee_id)}</td>
                  <td>{report.gross_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {reportType === 'total-net-amount'&& (
        <>
          <h3>Total Net Amount for {monthName} {year}: {totalNetAmount.toFixed(2)}</h3>
          <table>
            <thead>
              <tr>
                <th>Name and surname</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((report, index) => (
                <tr key={index}>
                  <td>{getEmployeeName(report.employee_id)}</td>
                  <td>{report.net_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
       )}
       <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
       {reportType === 'social-insurance' && (
  <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
    <>
  <h3 className="text-xl font-semibold mb-4">Składki ZUS za {month}/{year}</h3>
  <div className="overflow-x-auto mb-6">
    <table className="min-w-full bg-white divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suma ubezpieczenia</th>
          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kwota:</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
          {/* Map through each type of insurance and its total */}
          {/* Repeat for other insurance types */}
          {/* ... */}
          <tr>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Społecznego</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">{reportData.totalSpołeczne.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">FP+FGŚP</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">{reportData.totalFPFGŚP.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Zdrowotnego</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">{reportData.totalHealthAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Łącznie</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-right text-gray-900">{reportData.grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      </div>

      <div className="my-10 w-full">
  <div className="overflow-x-auto">
    <table className="w-full bg-white divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
        <th className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Składa na:</th>
        <th className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Pracownik</th>
        <th className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Pracodawca</th>
        <th className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Razem</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
        {/* Example row for pension insurance */}
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Emerytalne</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500">{reportData.totalEmrytUb.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500">{reportData.totalEmerytPr.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500">{reportData.totalemeryt.toFixed(2)}</td>
        </tr>
        {/* Similar rows for other types of insurance */}
        {/* ... */}
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Rentowe</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalRentUb.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalRentPr.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalrentowe.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">wypadkowe</td>
          <td>-</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalWypadkowe.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalWypadkowe.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Chorobowe</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalChorobowe.toFixed(2)}</td>
          <td>-</td> {/* Assuming employer doesn't contribute */}
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-500 uppercase tracking-wider">{reportData.totalChorobowe.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Suma społeczne:</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalSpołeczneUb.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalSpołecznePr.toFixed(2)}</td> {/* Assuming employer doesn't contribute */}
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalSpołeczne.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">FP </td>
          <td>-</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totalFp.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totalFp.toFixed(2)}</td>
        </tr>

        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">FGSP</td>
          <td>-</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totalFgsp.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totalFgsp.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">FP i FGŚP łącznie</td>
          <td>-</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalFPFGŚP.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalFPFGŚP.toFixed(2)}</td>
        </tr>
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Zdrowotne</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalHealthAmount.toFixed(2)}</td>
          <td>-</td> {/* Assuming employer doesn't contribute */}
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalHealthAmount.toFixed(2)}</td>
        </tr>
        {/* ... */}
        <tr className="bg-gray-100">
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">Łącznie</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalEmployeeContribution.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.totalEmployerContribution.toFixed(2)}</td>
          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">{reportData.grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    </div>
</div>
  </>
  </div>
  )}
  </div>
  </div>
  )
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl"> {/* Adjusted max-w-full */}
      <h2 className="text-2xl font-bold mb-4">Generuj raport</h2>
      <div className="mb-8">
      <div className="mb-4">
        <label className="block mb-2 text-lg font-medium text-gray-700">
          Rodzaj raportu:
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Wybierz rodzaj raportu</option>
            <option value="total-gross-amount">Total Gross Amount by Month and Year</option>
            <option value="total-net-amount">Total Net Amount by Month and Year</option>
            <option value="earnings-certificate">Zaświadczenie o Zarobkach</option>
            <option value="social-insurance">Social Insurance Report</option>
          </select>
        </label>
      </div>
        {renderFormFields()}
        {reportType !== 'earnings-certificate' && (
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-lg font-medium text-gray-700">
            Miesiąc:
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block text-lg font-medium text-gray-700">
            Rok:
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleGenerateReport}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generuj
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Drukuj
        </button>
      </div>
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-4">Dane wybranego raportu</h2>
      {isReportGenerated && renderReportTable()}
    </div>
  </div>
  </div>
);

}

export default ReportsPage;
