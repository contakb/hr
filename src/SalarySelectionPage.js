import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SalarySelectionPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [validContracts, setValidContracts] = useState([]);
  const navigate = useNavigate();
  
const handleCalculateSalary = () => {
  const employeeData = employees.map((employee) => ({
    name: employee.name,
    surname: employee.surname,
	id: employee.id,
    gross_amount: validContracts
      .filter(
        (contract) =>
          contract.name === employee.name && contract.surname === employee.surname
      )
      .map((contract) => contract.gross_amount),
  }));

  navigate('/calculate-salary', {
    state: { employeesData: employeeData,  month, year },
  });
};



  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/employees');
      setEmployees(response.data.employees);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Error fetching employees. Please try again later.');
      setLoading(false);
    }
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };


const fetchValidContracts = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/valid-employees', { month, year });
    setValidContracts(response.data.employees);
  } catch (error) {
    console.error('Error fetching valid contracts:', error);
    setValidContracts([]);
  }
};

const renderEmployeeList = () => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (employees.length === 0) {
    return <div>No employees found.</div>;
  }

  return (
    <div className="employee-list">
      {employees.map((employee, index) => {
        const employeeContracts = validContracts.filter(
          (contract) => contract.name === employee.name && contract.surname === employee.surname
        );

        if (employeeContracts.length === 0) {
          return null; // Skip employees without valid contracts
        }

        return (
          <div key={index}>
            <p>Name: {employee.name}</p>
            <p>Id: {employee.id}</p>
            <p>Surname: {employee.surname}</p>
            <div>
              <h4>Valid Contracts:</h4>
              {employeeContracts.map((contract, contractIndex) => (
                <p key={contractIndex}>Gross Amount: {contract.gross_amount}</p>
              ))}
            </div>
          </div>
        );
      })}
	  <button onClick={handleCalculateSalary}>Calculate Salary</button>
    </div>
  );
};

  return (
    <div className="salary-selection-page">
      <h1>Salary Selection</h1>
      <div className="filter-container">
        <label>
          Month:
          <input type="text" value={month} onChange={handleMonthChange} />
        </label>
        <label>
          Year:
          <input type="text" value={year} onChange={handleYearChange} />
        </label>
        <button onClick={fetchValidContracts}>Fetch Valid Contracts</button>
      </div>
      <div className="employee-list-container">{renderEmployeeList()}</div>
      
    </div>
  );
}

export default SalarySelectionPage;