import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';




function SalaryListPage() {
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [selectedSalaryList, setSelectedSalaryList] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalaryList();
  }, []);

  const fetchSalaryList = async () => {
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
      }
  
      setSalaryList(salaryData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching salary list:', error);
      setError('Error fetching salary list. Please try again later.');
      setLoading(false);
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
    setSelectedSalaryList(selectedSalaryList);
  };

  const handleEditSalary = (salaryListByMonthYear) => {
    console.log("Navigating to edit mode with data:", salaryListByMonthYear);

    const formattedData = salaryListByMonthYear.map(salary => {
      return {
        employee_id: salary.employee_id,
        name: salary.employees.name,
        surname: salary.employees.surname,
        gross_amount: salary.gross_total,
        contract_details: salary.contracts.map(contract => {
          return {
            gross_amount: contract.gross_amount,
            contract_from_date: contract.contract_from_date,
            contract_to_date: contract.contract_to_date
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
        editMonth: salaryListByMonthYear[0].salary_month
      }
    });
};

  
  

  

  return (
    <div className="salary-list-container">
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

      <div style={{ marginTop: '10px' }}>
        <button onClick={handleCreateNewSalaryList}>Create New Salary List</button>
      </div>

      <div className="salary-list-title">
        <h1>Salary List</h1>
      </div>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Salary Date</th>
            <th>Wiecej</th>
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

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedSalaryList && (
        <SalaryListDetails salaryList={selectedSalaryList} />
      )}
    </div>
  );
}

function SalaryListDetails({ salaryList }) {
  return (
    <div className="salary-details-container">
      <h2>Salary List Details</h2>
      <table>
        <thead>
          <tr>
            <th>EMP.ID</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Month</th>
            <th>Year</th>
            <th>Salary Date</th>
			<th>Brutto</th>
      <th>Podstawa zus</th>
      <th>Bonus</th>
			<th>Ub.emeryt</th>
			<th>Ub.rentowe</th>
			<th>Ub.zdrowotne</th>
			<th>ub.chorobowe</th>
			<th>Koszty</th>
			<th>Podatek</th>
			<th>Netto</th>
      <th>wyn.chorobowe</th>
      <th>przerwy</th>
            {/* Add additional details here if needed */}
          </tr>
        </thead>
        <tbody>
          {salaryList.map((salary) => (
            <tr key={salary.id}>
              <td>{salary.employee_id}</td>
              <td>{salary.employees.name}</td> {/* Display employee name */}
              <td>{salary.employees.surname}</td> {/* Display employee surname */}
              <td>{salary.salary_month}</td>
              <td>{salary.salary_year}</td>
              <td>{new Date(salary.salary_date).toLocaleDateString()}</td>
			  <td>{salary.gross_total}</td>
        <td>{salary.social_base}</td> 
        <td>{salary.bonus}</td>
			  <td>{salary.emeryt_ub}</td>
			  <td>{salary.rent_ub}</td>
			  <td>{salary.chorobowe}</td>
			  <td>{salary.heath_amount}</td>
			  <td>{salary.koszty}</td>
			  <td>{salary.tax}</td>
			  <td>{salary.net_amount}</td>
        <td>{salary.wyn_chorobowe}</td>
        <td>
                {salary.healthBreaks.map(breakItem => 
                  `${breakItem.break_type} (${breakItem.break_start_date} - ${breakItem.break_end_date}, Days: ${breakItem.break_days}`).join('\n')}
              </td>
              {/* Add additional details here if needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalaryListPage;
