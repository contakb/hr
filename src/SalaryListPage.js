import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct path



function SalaryListPage() {
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [selectedSalaryDate, setSelectedSalaryDate] = useState('');
  const [selectedSalaryList, setSelectedSalaryList] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const user = useUser();
 



  useEffect(() => {
    fetchSalaryList();
  }, []);

  const fetchSalaryList = async () => {
    setIsLoading(true);
  setError(null);
    try {
      const response = await axios.get('http://localhost:3001/salary-list');
      let salaryData = response.data;
  
      for (let salary of salaryData) {
        // Define selectedMonthStart and selectedMonthEnd for each salary
        const selectedMonthStart = new Date(salary.salary_year, salary.salary_month - 1, 1);
        const selectedMonthEnd = new Date(salary.salary_year, salary.salary_month, 0);
  
        // Fetch and filter health breaks
        const healthBreaksResponse = await axios.get(`http://localhost:3001/api/get-health-breaks?employee_id=${salary.employee_id}`);
        salary.healthBreaks = healthBreaksResponse.data.filter(hb => {
          const breakStart = new Date(hb.break_start_date);
          const breakEnd = new Date(hb.break_end_date);
          return (breakStart <= selectedMonthEnd && breakEnd >= selectedMonthStart);
        });
  
        // Fetch and filter contracts
        const contractsResponse = await axios.get(`http://localhost:3001/api/contracts/${salary.employee_id}`);
        salary.contracts = contractsResponse.data.contracts.filter(contract => {
          const contractStart = new Date(contract.contract_from_date);
          const contractEnd = contract.contract_to_date ? new Date(contract.contract_to_date) : new Date();
          return (contractStart <= selectedMonthEnd && contractEnd >= selectedMonthStart);
        });

        // Fetch employee parameters
      try {
        const paramsResponse = await axios.get(`http://localhost:3001/api/employee-params/${salary.employee_id}`);
        if (paramsResponse.data && paramsResponse.data.parameters) {
          salary.employeeParams = paramsResponse.data.parameters;
        } else {
          salary.employeeParams = []; // Ensure employeeParams is always defined
        }
      } catch (paramsError) {
        console.error('Error fetching employee parameters:', paramsError);
        salary.employeeParams = []; // Handle error case by setting employeeParams to an empty array
      }
      }
  
      setSalaryList(salaryData);
      console.log("Data fetched, setting loading to false");
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching salary list:', error);
      setError('Error fetching salary list. Please try again later.');
      setIsLoading(false);
    }
  };
  
  


  
  
  const handleCreateNewSalaryList = () => {
    navigate('/salary-selection');
  };

  // Function to get unique combinations of month/year
  const getUniqueMonthYearCombinations = () => {
    const uniqueCombinations = [];
    salaryList.forEach((salary) => {
      const combination = `${salary.salary_month}/${salary.salary_year}`;
      if (!uniqueCombinations.includes(combination)) {
        uniqueCombinations.push(combination);
      }
    });
    return uniqueCombinations;
  };

  // Use the function to get unique combinations
  const uniqueMonthYearCombinations = getUniqueMonthYearCombinations();

  const handleViewDetails = (monthYear) => {
    setSelectedMonthYear(monthYear);
    const selectedSalaryList = salaryList.filter(
      (salary) => `${salary.salary_month}/${salary.salary_year}` === monthYear
    );
    // Assuming the salary date is the same for all entries in selectedSalaryList
  const salaryDate = selectedSalaryList.length > 0 ? selectedSalaryList[0].salary_date : null;
    setSelectedSalaryList(selectedSalaryList);
    setSelectedSalaryDate(salaryDate); // You'll need to manage this state
  };

  const handleEditSalary = (salaryListByMonthYear) => {
    console.log("Navigating to edit mode with data:", salaryListByMonthYear);

    const formattedData = salaryListByMonthYear.map(salary => {
      return {
        employee_id: salary.employee_id,
        salary_id: salary.id,
        name: salary.employees.name,
        surname: salary.employees.surname,
        employee_koszty: salary.koszty,
        employee_ulga: salary.ulga,
        gross_amount: salary.gross_total,
        
        contract_details: salary.contracts.map(contract => {
          return {
            gross_amount: contract.gross_amount,
            contract_from_date: contract.contract_from_date,
            contract_to_date: contract.contract_to_date,
            etat: contract.etat,
            // Add other contract details if necessary
          };
        }),
        allBreaks: (() => {
          const breaks = [];
          salary.healthBreaks.forEach((hb, index) => {
            const breakDetails = {
              endDate: new Date(hb.break_end_date).toISOString(),
              startDate: new Date(hb.break_start_date).toISOString(),
              type: hb.break_type,
              id: hb.id,
              employee_id: salary.employee_id,
              isEdited: false

              // Add other break details if necessary
            };
            if (index === 0) {
              breakDetails.days = hb.break_days;
            } else {
              breakDetails.additionalDays = hb.break_days;
            }
            breaks.push(breakDetails);
          });
          return breaks;
        })()
      };
    });

    console.log("Formatted Data for Edit:", formattedData);

    navigate('/salary-selection', {
      state: {
        isEditMode: true,
        editableData: formattedData,
        editYear: salaryListByMonthYear[0].salary_year,
        editMonth: salaryListByMonthYear[0].salary_month,
        editSalary_date: salaryListByMonthYear[0].salary_date
      }
    });
};

const handleDeleteSalaryByMonthYear = async (monthYear) => {
  if (window.confirm(`Are you sure you want to delete all salary records for ${monthYear}?`)) {
    try {
      setIsLoading(true);
      const [month, year] = monthYear.split('/');
      // Filter health breaks for the specified month/year
      const healthBreakIdsToDelete = salaryList.reduce((ids, salary) => {
        if (`${salary.salary_month}/${salary.salary_year}` === monthYear) {
          const breakIds = salary.healthBreaks.map(hb => hb.id);
          return ids.concat(breakIds);
        }
        return ids;
      }, []);

      // Delete health breaks if any
      if (healthBreakIdsToDelete.length > 0) {
        await axios.delete('http://localhost:3001/api/delete-health-breaks', { data: { breakIds: healthBreakIdsToDelete } });
      }
       // Delete salary records
      await axios.delete(`http://localhost:3001/api/delete-salary-by-month?month=${month}&year=${year}`);
      fetchSalaryList();
      toast.success(`Salary records and associated health breaks for ${monthYear} successfully deleted.`);
    } catch (error) {
      console.error('Error deleting salary records:', error);
      setError('Error deleting salary records. Please try again later.');
      toast.error('Error deleting salary records.');
    } finally {
      setIsLoading(false);
    }
  }
};


const handleDeleteIndividualSalary = async (salaryId) => {
  if (window.confirm('Are you sure you want to delete this salary entry?')) {
    try {
      setIsLoading(true);

      // Find the salary record and extract employee ID, month, and year
      const salaryRecord = salaryList.find(salary => salary.id === salaryId);
      const { employee_id, salary_month, salary_year } = salaryRecord;

      // Filter health breaks for the employee for the specific month/year
      const healthBreakIdsToDelete = salaryRecord.healthBreaks.map(hb => hb.id);

      // Delete health breaks if any
      if (healthBreakIdsToDelete.length > 0) {
        await axios.delete('http://localhost:3001/api/delete-health-breaks', { data: { breakIds: healthBreakIdsToDelete } });
      }

      // Delete the individual salary record
      
      await axios.delete(`http://localhost:3001/api/delete-salary/${salaryId}`);
      toast.success('Salary entry successfully deleted.');

      // Refresh the details list to reflect the deletion
      const updatedSalaryList = salaryList.filter(salary => salary.id !== salaryId);
      setSelectedSalaryList(updatedSalaryList);
    } catch (error) {
      console.error('Error deleting salary entry:', error);
      setError('Error deleting salary entry. Please try again later.');
      toast.error('Error deleting salary entry.');
    } finally {
      setIsLoading(false);
    }
  }
};


  

  

  return (
    <div className="salary-list-container">
      

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleCreateNewSalaryList}>Create New Salary List</button>
      </div>

      <div className="salary-list-title">
  <h1>Salary List</h1>
  <div>
        <label>
          Filter by Month/Year:
          <select
            value={selectedMonthYear}
            onChange={(e) => {
              setSelectedMonthYear(e.target.value);
              setSelectedSalaryList(null); // Clear selected salary list on filter change
            }}
          >
            <option value="">All</option>
            {uniqueMonthYearCombinations.map((combination) => (
              <option key={combination} value={combination}>
                {combination}
              </option>
            ))}
          </select>
        </label>
      </div>
</div>

{isLoading ? (
  <div>Loading data...</div> // Loading indicator inside your component
) : (
  <table>
    <thead>
      <tr>
        <th>Month</th>
        <th>Year</th>
        <th>Salary Date</th>
        <th>Więcej</th>
      </tr>
    </thead>
    <tbody>
      {uniqueMonthYearCombinations.map((combination) => {
        const salaryListByMonthYear = salaryList.filter(
          (salary) => `${salary.salary_month}/${salary.salary_year}` === combination
        );
        return (
          <tr key={combination}>
            <td>{salaryListByMonthYear[0].salary_month}</td>
            <td>{salaryListByMonthYear[0].salary_year}</td>
            <td>{new Date(salaryListByMonthYear[0].salary_date).toLocaleDateString()}</td>
            <td>
              <button onClick={() => handleViewDetails(combination)}>Szczegóły</button>
              <button onClick={() => handleEditSalary(salaryListByMonthYear)}>Edit</button>
              <button onClick={() => handleDeleteSalaryByMonthYear(combination)}>Delete Month/Year</button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
)}

{selectedSalaryList && (
  <SalaryListDetails salaryList={selectedSalaryList}  monthYear={selectedMonthYear} salaryDate={selectedSalaryDate} handleDeleteIndividualSalary={handleDeleteIndividualSalary}/>
)}

    </div>
  );
}

function SalaryListDetails({ salaryList, monthYear, salaryDate, handleDeleteIndividualSalary }) {
  // Split the monthYear string to get month and year
  const [month, year] = monthYear ? monthYear.split('/') : ['-', '-'];
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportCount, setExportCount] = useState(0);
  // Format the current date as YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().substring(0, 10); // Converts to "YYYY-MM-DD"

   // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:3001/api/created_company');
        setCompanyData(response.data.length > 0 ? response.data[0] : null);
      } catch (error) {
        console.error('Error fetching company data:', error);
        setError('Failed to fetch company data.');
      } 
    };

    fetchCompanyData();
  }, []); // Empty dependency array ensures this effect runs once on mount

  const generateDocumentId = () => {
    // Generate a random number between 1000000000 (inclusive) and 9999999999 (inclusive)
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  // Calculate sums
  const totals = salaryList.reduce((acc, salary) => {
    acc.gross_total += salary.gross_total;
    acc.social_base_total += salary.social_base;
    acc.emeryt_ub += salary.emeryt_ub;
    acc.rent_ub += salary.rent_ub;
    // Add more fields as necessary
    return acc;
  }, { gross_total: 0, social_base_total: 0, emeryt_ub: 0, rent_ub: 0 /* Initialize other fields here */ });

  // Function to generate XML string
  const generateXML = () => {
    // Example starts the XML string, more complex logic needed for full implementation
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<KEDU wersja_schematu="1" xsi:schemaLocation="http://www.zus.pl/2021/KEDU_5_4 kedu_5_4.xsd" xmlns="http://www.zus.pl/2021/KEDU_5_4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
  xmlContent += `\t<naglowek.KEDU>\n`;
  xmlContent += `\t\t<program>\n`;
  xmlContent += `\t\t\t<producent>Asseco Poland SA</producent>\n`;
  xmlContent += `\t\t\t<symbol>Płatnik</symbol>\n`;
  xmlContent += `\t\t\t<wersja>1002002</wersja>\n`;
  xmlContent += `\t\t</program>\n`;
  xmlContent += `\t</naglowek.KEDU>\n`;
  // Construct the document ID using month and year for simplicity
  // This example concatenates year, month, and a unique identifier like a timestamp
  // Increment the export declaration number
  const declarationNumber = exportCount + 1;
  
  const documentId = generateDocumentId();
  xmlContent += `\t<ZUSRCA id_dokumentu="${documentId}">\n`;
  xmlContent += `\t\t<I>\n`;
  xmlContent += `\t\t\t<p1>\n`;
  xmlContent += `\t\t\t\t<p1>${declarationNumber.toString().padStart(2, '0')}</p1>\n`; // Format as two digits
  xmlContent += `\t\t\t\t<p2>${year}-${month}</p2>\n`;
  xmlContent += `\t\t\t</p1>\n`;
  xmlContent += `\t\t</I>\n`;

      xmlContent += `\t\t<II>\n`;
      xmlContent += `\t\t\t<p1>Regon</p1>\n`; // Do uzupełnienia w danych firmy
      xmlContent += `\t\t\t<p2>${companyData.taxid}</p2>\n`;
      xmlContent += `\t\t\t<p6>${companyData.company_name}</p6>\n`;
      xmlContent += `\t\t</II>\n`;
  
    // Assuming salaryList contains all the necessary information
    salaryList.forEach((salary, index) => {
      // Assuming `kod_ub` is a string like '011000' and needs to be split into '0110' and '00'
  const kodUb = salary.employeeParams.length > 0 ? salary.employeeParams[0].kod_ub : 'N/A';
  const kodUbPart1 = kodUb !== 'N/A' ? kodUb.substring(0, 4) : '0';
  const kodUbPart2 = kodUb !== 'N/A' ? kodUb.substring(4, 5) : '0';
  const kodUbPart3 = kodUb !== 'N/A' ? kodUb.substring(5, 6) : '0';
  // Calculate the sum of specified components
  const sumSocial = salary.emeryt_ub + salary.rent_ub + salary.rent_pr +
  salary.emeryt_pr + salary.wypadkowe + salary.chorobowe;
      // Construct XML segments for each salary entry
      // This is a simplified example. Adapt it based on your actual data structure and requirements.
      // Start the XML with company data if available
    
      xmlContent += `\t\t<III id_bloku="${index + 1}">\n`;
      xmlContent += `\t\t\t<A>\n`;
      xmlContent += `\t\t\t\t<p1>${salary.employees.surname}</p1>\n`;
      xmlContent += `\t\t\t\t<p2>${salary.employees.name}</p2>\n`;
      xmlContent += `\t\t\t\t<p3>P</p3>\n`;
      xmlContent += `\t\t\t\t<p4>${salary.employees.pesel}</p4>\n`;
      // Continue building the XML content...
      xmlContent += `\t\t\t</A>\n`;
      xmlContent += `\t\t\t<B>\n`;
  xmlContent += `\t\t\t\t<p1>\n`; // Start nested p1
  xmlContent += `\t\t\t\t\t<p1>${kodUbPart1}</p1>\n`;
  xmlContent += `\t\t\t\t\t<p2>${kodUbPart2}</p2>\n`;
  xmlContent += `\t\t\t\t\t<p3>${kodUbPart3}</p3>\n`; // Assuming '0' is a placeholder; adjust as necessary
  xmlContent += `\t\t\t\t</p1>\n`; // Close nested p1
  xmlContent += `\t\t\t\t<p3>\n`; // Start nested p1
  xmlContent += `\t\t\t\t\t<p1>0</p1>\n`;// etat
  xmlContent += `\t\t\t\t\t<p2>0</p2>\n`;// etat do uzupełnienia z contractu
  xmlContent += `\t\t\t\t</p3>\n`; // Start nested p1
  xmlContent += `\t\t\t\t<p4>${salary.social_base.toFixed(2)}</p4>\n`;
  xmlContent += `\t\t\t\t<p5>${salary.social_base.toFixed(2)}</p5>\n`;
  xmlContent += `\t\t\t\t<p6>${salary.social_base.toFixed(2)}</p6>\n`;
  xmlContent += `\t\t\t\t<p7>${salary.emeryt_ub.toFixed(2)}</p7>\n`;
  xmlContent += `\t\t\t\t<p8>${salary.rent_ub.toFixed(2)}</p8>\n`;
  xmlContent += `\t\t\t\t<p9>${salary.chorobowe.toFixed(2)}</p9>\n`;
  xmlContent += `\t\t\t\t<p10>0.00</p10>\n`;
  xmlContent += `\t\t\t\t<p11>${salary.emeryt_pr.toFixed(2)}</p11>\n`;
  xmlContent += `\t\t\t\t<p12>${salary.rent_pr.toFixed(2)}</p12>\n`;
  xmlContent += `\t\t\t\t<p13>0.00</p13>\n`;
  xmlContent += `\t\t\t\t<p14>${salary.wypadkowe.toFixed(2)}</p14>\n`;
  xmlContent += `\t\t\t\t<p27>0.00</p27>\n`;
  xmlContent += `\t\t\t\t<p28>0.00</p28>\n`;
  xmlContent += `\t\t\t\t<p29>${sumSocial.toFixed(2)}</p29>\n`;//Suma społecznego
  // Include additional elements (<p2>, <p3>, etc.) as necessary
  xmlContent += `\t\t\t</B>\n`;
  xmlContent += `\t\t\t<C>\n`;
      xmlContent += `\t\t\t\t<p1>${salary.health_base.toFixed(2)}</p1>\n`;
      xmlContent += `\t\t\t\t<p2>0.00</p2>\n`;
      xmlContent += `\t\t\t\t<p4>${salary.heath_amount.toFixed(2)}</p4>\n`;
      // Continue building the XML content...
      xmlContent += `\t\t\t</C>\n`;
      xmlContent += `\t\t\t<E>\n`;
      xmlContent += `\t\t\t\t<p1>0</p1>\n`;
      xmlContent += `\t\t\t\t<p5>0</p5>\n`;
      xmlContent += `\t\t\t\t<p9>0</p9>\n`;
      xmlContent += `\t\t\t\t<p12>0</p12>\n`;
      xmlContent += `\t\t\t\t<p14>0</p14>\n`;
      xmlContent += `\t\t\t\t<p18>0</p18>\n`;
      // Continue building the XML content...
      xmlContent += `\t\t\t</E>\n`;
      xmlContent += `\t\t\t<F/>\n`;
      xmlContent += `\t\t</III>\n`;
      
    });
    // Append the current date in the specified format
    xmlContent += `\t\t<IV>\n`;
    xmlContent += `\t\t\t<p1>${formattedDate}</p1>\n`;
    xmlContent += `\t\t</IV>\n`;

    // Close the XML structure
    xmlContent += `\t</ZUSRCA>\n`;
    xmlContent += `</KEDU>`;

    return xmlContent;
  };

  // Function to trigger the download of the XML file
  const downloadXMLFile = () => {
    const xmlContent = generateXML();
    const fileName = `Deklaracja_ZUS_RCA_${companyData.company_name}_${monthYear}.xml`; // Customize file name as needed
    downloadXML(xmlContent, fileName);
    setExportCount(exportCount + 1); // Increment export counter
  };


  return (
    <div className="salary-details-container">
      <h2>Salary List Details for {month}/{year}, Salary Date: {salaryDate ? new Date(salaryDate).toLocaleDateString() : 'N/A'}</h2>
      <button onClick={downloadXMLFile}>Export plik RCA do ZUS</button>
      <table>
        <thead>
          <tr>
          <th>Month</th>
            <th>Year</th>
            <th>EMP.ID</th>
            <th>Pesel</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Salary Date</th>
			<th>Brutto</th>
      <th>Podstawa zus</th>
      <th>Bonus</th>
			<th>Ub.emeryt</th>
			<th>Ub.rentowe</th>
			<th>Ub.chorobowe</th>
			<th>ub.zdrowotne</th>
			<th>Koszty</th>
      <th>Ulga</th>
			<th>Podatek</th>
			<th>Netto</th>
      <th>wyn.chorobowe</th>
      <th>przerwy</th>
      <th>kodUb</th>

          </tr>
        </thead>
        <tbody>
          {salaryList.map((salary) => (
            <tr key={salary.id}>
              <td>{salary.salary_month}</td>
              <td>{salary.salary_year}</td>
              <td>{salary.employee_id}</td>
              <td>{salary.employees.pesel}</td>
              <td>{salary.employees.name}</td> {/* Display employee name */}
              <td>{salary.employees.surname}</td> {/* Display employee surname */}  
              <td>{new Date(salary.salary_date).toLocaleDateString()}</td>
			  <td>{salary.gross_total}</td>
        <td>{salary.social_base}</td> 
        <td>{salary.bonus}</td>
			  <td>{salary.emeryt_ub}</td>
			  <td>{salary.rent_ub}</td>
			  <td>{salary.chorobowe}</td>
			  <td>{salary.heath_amount}</td>
			  <td>{salary.koszty}</td>
        <td>{salary.ulga}</td>
			  <td>{salary.tax}</td>
			  <td>{salary.net_amount}</td>
        <td>{salary.wyn_chorobowe}</td>
        <td>
                {salary.healthBreaks.map(breakItem => 
                  `${breakItem.break_type} (${breakItem.break_start_date} - ${breakItem.break_end_date}, Days: ${breakItem.break_days}`).join('\n')}
              </td>
              {salary.employeeParams.length > 0 ? salary.employeeParams[0].kod_ub : 'N/A'}
              <td>
              <button onClick={() => handleDeleteIndividualSalary(salary.id)}>Delete</button>
              </td>
              
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6">Total</td> {/* Adjust colSpan as needed */}
            <td>{totals.gross_total.toFixed(2)}</td> {/* Assuming these are numbers and need to be formatted */}
            <td>{totals.social_base_total.toFixed(2)}</td> {/* Placeholder for other columns */}
            <td></td> {/* Placeholder for other columns */}
            <td>{totals.emeryt_ub.toFixed(2)}</td>
            <td>{totals.rent_ub.toFixed(2)}</td>
            {/* Render other totals similarly */}
          </tr>
        </tfoot>
      </table>
    </div>
    
  );
}
// Reuse the downloadXML function provided earlier or define it here again
function downloadXML(xmlContent, fileName) {
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default SalaryListPage;
