import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function EmployeeReportsPage() {
  const currentYear = new Date().getFullYear();
  const [reportType, setReportType] = useState('');
  const [year, setYear] = useState(currentYear.toString()); // Initialize to current year
  const [reportData, setReportData] = useState([]);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [totalGrossAmount, setTotalGrossAmount] = useState(0);
  const [totalNetAmount, setTotalNetAmount] = useState(0);
  const { user } = useUser();
  const { employeeId } = useParams(); // Get employeeId from URL parameters
  const navigate = useNavigate();
  const reportRef = useRef();
  const [showBreakDetails, setShowBreakDetails] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [selectedRange, setSelectedRange] = useState(3); // Default to 3 months
  const [companyData, setCompanyData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [error, setError] = useState(null);
  const [contracts, setContracts] = useState([]);

  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:3001/employees/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };
  

  const toggleContracts = async (employeeIdToUse) => {
    try {
      const response = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeIdToUse}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      const combinedContracts = combineContracts(response.data.contracts);
      setContracts(combinedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    }
  };

  const combineContracts = (contracts) => {
    contracts.sort((a, b) => new Date(a.contract_from_date) - new Date(b.contract_from_date));
    let contractMap = new Map();

    contracts.forEach(contract => {
      const originalId = contract.kontynuacja || contract.id;

      if (!contractMap.has(originalId)) {
        contractMap.set(originalId, { original: null, aneks: [] });
      }

      const contractData = contractMap.get(originalId);

      if (!contract.kontynuacja) {
        contractData.original = contract;
      } else {
        contractData.aneks.push(contract);
      }
    });

    return Array.from(contractMap.values());
  };


  const handleGenerateReport = async () => {
    setIsReportGenerated(false); // Reset the flag before generating a new report
  
    try {
      let responseData;
      const employeeIdToUse = employeeId; // Use employeeId from URL parameters
  
      if (reportType === 'earnings-certificate') {
        const range = selectedRange; // Use selected range
  
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
  
        setPeriodStart(periodStart);
        setPeriodEnd(periodEnd);
  
        // Split the period into start and end parts
        const [splitStartMonth, splitStartYear] = periodStart.split('/');
        const [splitEndMonth, splitEndYear] = periodEnd.split('/');
  
        const response = await axiosInstance.get(`http://localhost:3001/api/salary/recent/${employeeIdToUse}?startYear=${splitStartYear}&startMonth=${splitStartMonth}&endYear=${splitEndYear}&endMonth=${splitEndMonth}`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`, // Use the access token
            'X-Schema-Name': user.schemaName, // Send the schema name as a header
          }
        });
  
        responseData = response.data;
  
        // Calculate averages or other necessary details for the report
        const totalGross = responseData.reduce((acc, curr) => acc + curr.gross_total, 0);
        const totalNet = responseData.reduce((acc, curr) => acc + curr.net_amount, 0);
        setTotalGrossAmount(totalGross / responseData.length);
        setTotalNetAmount(totalNet / responseData.length);
  
        setReportData(responseData); // Store the fetched data
        setIsReportGenerated(true);
      } else if (reportType === 'available-holiday-days') {
        const contractsResponse = await axiosInstance.get(`http://localhost:3001/api/contracts/${employeeIdToUse}`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
  
        const contracts = contractsResponse.data.contracts;
        if (contracts.length === 0) {
          throw new Error('No contracts found for the selected employee');
        }
  
        // Fetch holiday base data
        let holidayBase = 0;
        try {
          const holidayBaseResponse = await axiosInstance.get(`http://localhost:3001/employees/${employeeIdToUse}/holiday-base`, {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              'x-schema-name': user.schemaName,
            }
          });
  
          if (holidayBaseResponse.data.data && holidayBaseResponse.data.data.length > 0) {
            holidayBase = holidayBaseResponse.data.data[0].holiday_base;
          } else {
            setReportData([{ noHolidayBase: true }]);
            setIsReportGenerated(true);
            return;
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setReportData([{ noHolidayBase: true }]);
            setIsReportGenerated(true);
            return;
          } else {
            throw error;
          }
        }
  
        const selectedYear = parseInt(year);
        const previousYear = selectedYear - 1;
        const currentDate = new Date();
  
        let totalWorkedMonths = 0;
        let workedMonthsTillNow = 0;
        let workedMonthsTillEndOfYear = 0;
        let firstContractStartDate = null;
        let lastContractEndDate = null;
  
        contracts.forEach(contract => {
          const contractStartDate = new Date(contract.contract_from_date);
          const contractEndDate = contract.contract_to_date ? new Date(contract.contract_to_date) : new Date(selectedYear, 11, 31); // Default to end of the year if no end date
  
          if (contractStartDate.getFullYear() <= selectedYear && contractEndDate.getFullYear() >= selectedYear) {
            const startMonth = (contractStartDate.getFullYear() === selectedYear) ? contractStartDate.getMonth() + 1 : 1;
            const endMonth = (contractEndDate.getFullYear() === selectedYear) ? contractEndDate.getMonth() + 1 : 12;
  
            const contractWorkedMonths = endMonth - startMonth + 1;
            totalWorkedMonths += contractWorkedMonths;
  
            if (currentDate >= contractStartDate && currentDate <= contractEndDate) {
              workedMonthsTillNow += Math.min(currentDate.getMonth() + 1, endMonth) - startMonth + 1;
            }
  
            workedMonthsTillEndOfYear += endMonth - startMonth + 1;
  
            if (!firstContractStartDate || contractStartDate < firstContractStartDate) {
              firstContractStartDate = contractStartDate;
            }
  
            if (!lastContractEndDate || contractEndDate > lastContractEndDate) {
              lastContractEndDate = contractEndDate;
            }
          }
        });
  
        const totalHolidayDays = Math.ceil((holidayBase / 12) * totalWorkedMonths);
        const holidayDaysTillNow = Math.ceil((holidayBase / 12) * workedMonthsTillNow);
        const holidayDaysTillEndOfYear = Math.ceil((holidayBase / 12) * workedMonthsTillEndOfYear);
  
        // Fetch breaks taken by the employee
        const breaksResponse = await axiosInstance.get('/api/get-health-breaks', {
          params: { employee_id: employeeIdToUse },
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
  
        const breaks = breaksResponse.data;
        const usedHolidayDaysCurrentYear = breaks.filter(brk => brk.break_type === 'urlop' && new Date(brk.break_start_date).getFullYear() === selectedYear)
          .reduce((acc, brk) => acc + brk.break_days, 0);
  
        const availableHolidayDays = holidayDaysTillNow - usedHolidayDaysCurrentYear;
  
        // Fetch breaks taken by the employee within the previous year
        const usedHolidayDaysPreviousYear = breaks.filter(brk => brk.break_type === 'urlop' && new Date(brk.break_start_date).getFullYear() === previousYear)
          .reduce((acc, brk) => acc + brk.break_days, 0);
  
        // Calculate available holiday days for the previous year
        let totalWorkedMonthsPreviousYear = 0;
        contracts.forEach(contract => {
          const contractStartDate = new Date(contract.contract_from_date);
          const contractEndDate = contract.contract_to_date ? new Date(contract.contract_to_date) : new Date(previousYear, 11, 31); // Default to end of the year if no end date
  
          if (contractStartDate.getFullYear() <= previousYear && contractEndDate.getFullYear() >= previousYear) {
            const startMonth = (contractStartDate.getFullYear() === previousYear) ? contractStartDate.getMonth() + 1 : 1;
            const endMonth = (contractEndDate.getFullYear() === previousYear) ? contractEndDate.getMonth() + 1 : 12;
  
            const contractWorkedMonths = endMonth - startMonth + 1;
            totalWorkedMonthsPreviousYear += contractWorkedMonths;
          }
        });
        const totalHolidayDaysPreviousYear = Math.ceil((holidayBase / 12) * totalWorkedMonthsPreviousYear);
  
        setReportData([{
          holidayBase,
          holidayDaysTillNow,
          availableHolidayDays,
          totalHolidayDays,
          holidayDaysTillEndOfYear: totalHolidayDays - usedHolidayDaysCurrentYear,
          usedHolidayDaysCurrentYear,
          availableHolidayDaysPreviousYear: totalHolidayDaysPreviousYear - usedHolidayDaysPreviousYear,
          usedHolidayDaysPreviousYear,
          lastContractEndDate: lastContractEndDate ? lastContractEndDate.toLocaleDateString() : 'N/A',
          firstContractStartDate: firstContractStartDate ? firstContractStartDate.toLocaleDateString() : 'N/A',
          reportDate: currentDate.toLocaleDateString(),
          breakDetails: breaks.filter(brk => brk.break_type === 'urlop' && new Date(brk.break_start_date).getFullYear() === selectedYear) // Add break details for the current year
        }]); // Store the calculated available holiday days
        setIsReportGenerated(true);
      }
    } catch (error) {
      console.error(`Error fetching ${reportType} data:`, error);
      setReportData([]);
      toast.error('Error generating report.');
    }
  };
  

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
    try {
      const response = await axiosInstance.get('http://localhost:3001/api/created_company', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName,
        }
      });
      const company = response.data.length > 0 ? response.data[0] : null;
      if (company && company.company_id) {
        setCompanyData(company);
        setError('');
      } else {
        setCompanyData(null);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError('Failed to fetch company data.');
      setCompanyData(null);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (employeeId) {
      (async () => {
        await fetchEmployeeDetails(employeeId);
        await toggleContracts(employeeId);
      })();
    }
  }, [employeeId]);
  

  const renderCompanyData = () => {
    if (companyData) {
      return (
        <div>
          <h3>Dane firmy:</h3>
          <p>Name: {companyData.company_name}</p>
          <p>Address: {companyData.street} {companyData.number}, {companyData.post_code} {companyData.city}</p>
        </div>
      );
    } else {
      return <p>Brak danych firmy. Proszę uzupełnić dane w ustawieniach konta.</p>;
    }
  };


  const renderReportTable = () => {
    if (!isReportGenerated) return null; // Do not render if the report has not been generated

    return (
      
        <div ref={reportRef}>
        {reportType === 'earnings-certificate' && (
          <>
            <div className="signature-area">
              <div className="signature">
                <p>{renderCompanyData()}</p>
              </div>
            </div>
            <h1>Zaświadczenie</h1>
            {employeeDetails && (
              <div>
                <p>Zaświadcza się, że Pan/Pani: {employeeDetails.name} {employeeDetails.surname}</p>
                <p>Pesel: {employeeDetails.pesel}</p>
                <p>zam. adres: {employeeDetails.city}</p>
                <p>jest zatrudniony w {companyData?.company_name ?? "Brak danych firmy"}</p>
              </div>
            )}
            <div>
              {contracts.map(({ original, aneks }) => (
                <div key={original.id}>
                  <p>na umowę na czas: {original.typ_umowy}</p>
                  <p>od dnia {new Date(original.contract_from_date).toLocaleDateString()} do dnia: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
                  <p>na stanowisku: {original.stanowisko}</p>
                  <p>w wymiarze etatu: {original.etat}</p>
                  <p>Data zatrudnienia: {new Date(original.workstart_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <h3>Średnie wynagrodzenie z ostatnich: ({selectedRange}) miesięcy za okres od {periodStart} do {periodEnd}</h3>
            <p>Average Gross Amount : {totalGrossAmount.toFixed(2)}</p>
            <p>Average Net Amount : {totalNetAmount.toFixed(2)}</p>
            <p>Pracownik nie jest w okresie wypowiedzenia.</p>
            <p>Firma nie znajduje się w stanie likwidacji ani upadłości.</p>
            <p>Zaświadczenie zachowuje ważność przez okres 1 miesiąca od daty wystawienia.</p>
            <div className="signature-area">
              <div className="signature">
                <p>Company Representative Signature</p>
                <div className="signature-line"></div>
                <p>Name: [Company Representative Name]</p>
              </div>
            </div>
          </>
        )}
        {reportType === 'available-holiday-days' && (
          <>
            <h1>Available Holiday Days</h1>
            {reportData[0]?.noHolidayBase ? (
              <p className="text-red-500">No holiday base data found. Please add the details in the employee settings.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Report Date</td>
                    <td>{reportData[0]?.reportDate}</td>
                  </tr>
                  <tr>
                    <td>Holiday Base</td>
                    <td>{reportData[0]?.holidayBase} days</td>
                  </tr>
                  <tr>
                    <td>Holiday Days Till Now</td>
                    <td>{reportData[0]?.holidayDaysTillNow} days</td>
                  </tr>
                  <tr>
                    <td>Available Holiday Days</td>
                    <td>{reportData[0]?.availableHolidayDays} days</td>
                  </tr>
                  <tr>
                    <td>Total Holiday Days</td>
                    <td>{reportData[0]?.totalHolidayDays} days</td>
                  </tr>
                  <tr>
                    <td>Holiday Days Till End of Year</td>
                    <td>{reportData[0]?.holidayDaysTillEndOfYear} days</td>
                  </tr>
                  <tr>
                    <td>Used Holiday Days This Year</td>
                    <td>{reportData[0]?.usedHolidayDaysCurrentYear} days</td>
                  </tr>
                  <tr>
                    <td>Available Holiday Days Previous Year</td>
                    <td>{reportData[0]?.availableHolidayDaysPreviousYear} days</td>
                  </tr>
                  <tr>
                    <td>Used Holiday Days Previous Year</td>
                    <td>{reportData[0]?.usedHolidayDaysPreviousYear} days</td>
                  </tr>
                  <tr>
                    <td>First Contract Start Date</td>
                    <td>{reportData[0]?.firstContractStartDate}</td>
                  </tr>
                  <tr>
                    <td>Last Contract End Date</td>
                    <td>{reportData[0]?.lastContractEndDate}</td>
                  </tr>
                  <tr>
                    <td>
                      Holiday Breaks
                      <button
                        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
                        onClick={() => setShowBreakDetails(!showBreakDetails)}
                      >
                        {showBreakDetails ? 'Close' : 'Details'}
                      </button>
                    </td>
                    <td>
                      {showBreakDetails && (
                        <table>
                          <thead>
                            <tr>
                              <th>Break Type</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Days</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData[0]?.breakDetails?.map((breakDetail) => (
                              <tr key={breakDetail.id}>
                                <td>{breakDetail.break_type}</td>
                                <td>{new Date(breakDetail.break_start_date).toLocaleDateString()}</td>
                                <td>{new Date(breakDetail.break_end_date).toLocaleDateString()}</td>
                                <td>{breakDetail.break_days}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Generate Report</h2>
        <div className="mb-8">
          <div className="mb-4">
            <label className="block mb-2 text-lg font-medium text-gray-700">
              Report Type:
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select Report Type</option>
                <option value="earnings-certificate">Earnings Certificate</option>
                <option value="available-holiday-days">Available Holiday Days</option>
                {/* Add other report types as necessary */}
              </select>
            </label>
          </div>
          {reportType === 'earnings-certificate' && (
            <div>
              <label>
                Period Range (Months):
                <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                </select>
              </label>
            </div>
          )}
          {reportType === 'available-holiday-days' && (
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
          )}
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Print
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Generated Report</h2>
          {isReportGenerated && renderReportTable()}
        </div>
      </div>
    </div>
  );
}

export default EmployeeReportsPage;
