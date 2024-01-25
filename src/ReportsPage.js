import React, { useState, useEffect } from 'react';
import axios from 'axios';

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








  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 2051 - 1990 }, (_, i) => i + 1990);

  const calculateSum = (data, field) => {
    return data.reduce((sum, record) => sum + parseFloat(record[field]), 0);
  };

  const handleGenerateReport = async () => {
    setIsReportGenerated(false); // Reset the flag before generating a new report
  
    if (reportType === 'earnings-certificate' && selectedEmployee) {
      const range = parseInt(selectedRange); // Convert the selected range to an integer

    // Calculate the period for the last three months
     // Calculate the period for the last three completed months
     const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Note: January is 0

    // Calculate end month and year
    const endYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const endMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    // Calculate start month and year based on the selected range
    const startYear = (endMonth - range + 1) >= 0 ? endYear : endYear - 1;
    const startMonth = (endMonth - range + 1) >= 0 ? endMonth - range + 1 : 12 + (endMonth - range + 1);

    const periodStart = `${startMonth + 1}/${startYear}`;
    const periodEnd = `${endMonth + 1}/${endYear}`;

    setPeriodStart(periodStart);
    setPeriodEnd(periodEnd);
     

      try {
        // Split the period into start and end parts
      const [startMonth, startYear] = periodStart.split('/');
      const [endMonth, endYear] = periodEnd.split('/');

      const response = await axios.get(`http://localhost:3001/api/salary/recent/${selectedEmployee}?startYear=${startYear}&startMonth=${startMonth}&endYear=${endYear}&endMonth=${endMonth}`);

        const recentData = response.data;
  
        // Calculate averages or other necessary details for the report
        const totalGross = recentData.reduce((acc, curr) => acc + curr.gross_total, 0);
        const totalNet = recentData.reduce((acc, curr) => acc + curr.net_amount, 0);
        setTotalGrossAmount(totalGross / recentData.length);
        setTotalNetAmount(totalNet / recentData.length);
  
        setReportData(recentData); // Store the fetched data
        setIsReportGenerated(true);
      } catch (error) {
        console.error('Error fetching recent salary data:', error);
        setReportData([]);
      }
    } else {
      // Existing logic for other report types
      try {
        const response = await axios.get(`http://localhost:3001/reports?month=${month}&year=${year}`);
        setReportData(response.data);
  
        if (reportType === 'total-gross-amount') {
          setTotalGrossAmount(calculateSum(response.data, 'gross_total'));
        } else if (reportType === 'total-net-amount') {
          setTotalNetAmount(calculateSum(response.data, 'net_amount'));
        }
        setIsReportGenerated(true);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setReportData([]);
      }
    }
  };
  
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

  const renderReportTable = () => {
    const monthName = month ? new Date(year, month - 1).toLocaleString('default', { month: 'long' }) : '';
    if (!isReportGenerated) return null; // Do not render if the report has not been generated
    const getEmployeeName = (employeeId) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee ? `${employee.name} ${employee.surname}` : 'Unknown';
    };
    if (reportType === 'earnings-certificate') {
      console.log("Selected Employee ID:", selectedEmployee); // Debugging
    console.log("Employees Array:", employees); // Debugging
    const selectedEmployeeData = employees.find(emp => emp.id === Number(selectedEmployee));
      console.log("Selected Employee Data:", selectedEmployeeData); // Debugging
      return (
        <>
          <h3>Zaświadczenie o Zarobkach for {selectedEmployeeData ? `${selectedEmployeeData.name} ${selectedEmployeeData.surname}` : 'Unknown'}</h3>
          {selectedEmployeeData && (
            <div>
              <p>Pesel: {selectedEmployeeData.pesel}</p>
              <p>Adres: {selectedEmployeeData.city}</p>
              {/* Add more details as needed */}
            </div>
          )}
  <div>
    <h3>Contracts:</h3>
    {contracts.map(({ original, aneks }) => (
      <div key={original.id}>
        {/* Render Original Contract Details */}
        <p>Original Contract ID: {original.id}</p>
        <p>Gross Amount: {original.gross_amount}</p>
              <p>Contract From: {new Date(original.contract_from_date).toLocaleDateString()}</p>
              <p>Contract To: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
              <p>Typ Umowy: {original.typ_umowy}</p>
              <p>Stanowisko: {original.stanowisko}</p>
              <p>Etat: {original.etat}</p>
              <p>Rozpoczęcie pracy: {new Date(original.workstart_date).toLocaleDateString()}</p>
        {/* ...other original contract details... */}
        
        {/* Render Aneks Contracts */}
        {aneks.map(aneksContract => (
          <AneksView key={aneksContract.id} contract={aneksContract} originalContract={original} />
        ))}

        {/* Add buttons for editing contracts, creating aneks, etc. */}
        {/* ... */}
      </div>
    ))}
  </div>
          <p>Average Gross Amount (last {selectedRange} months): {totalGrossAmount.toFixed(2)}</p>
          <p>Average Net Amount (last {selectedRange} months): {totalNetAmount.toFixed(2)}</p>
          {/* Optionally, list individual salary entries here */}
        </>
      );
    }
    if (reportType === 'total-gross-amount') {
      return (
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
      );
    } else if (reportType === 'total-net-amount') {
      return (
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
      );
    }
    return null;
  };

  return (
    <div>
      <h2>Generate Report</h2>
      <div>
        <label>
          Report Type:
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="">Select Report Type</option>
            <option value="total-gross-amount">Total Gross Amount by Month and Year</option>
            <option value="total-net-amount">Total Net Amount by Month and Year</option>
            <option value="earnings-certificate">Zaświadczenie o Zarobkach</option>
          </select>
        </label>
        {renderFormFields()}
        {reportType !== 'earnings-certificate' && (
          <>
            <label>
              Month:
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Year:
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button onClick={handleGenerateReport}>Generate</button>
      </div>
  
      <h2>Report Data</h2>
      {isReportGenerated && renderReportTable()}
    </div>
  );
}

export default ReportsPage;
