import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalaryCalculationPage({ month, year }) {
  const [validEmployees, setValidEmployees] = useState([]);
  const [salaryResults, setSalaryResults] = useState([]);
  const [contracts, setContracts] = useState([]);


  useEffect(() => {
  const fetchContracts = async () => {
    try {
      const response = await axios.get('/api/valid-employees');
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  fetchContracts();
}, [validEmployees]);


  const calculateSalary = async (employeeId) => {
    try {
      const response = await axios.post('http://localhost:3001/api/calculate-salary', { employeeId, month, year });
      setSalaryResults((prevResults) => [...prevResults, response.data]);
    } catch (error) {
      console.error('Error calculating salary:', error);
    }
  };

  return (
    <div>
      <h2>Salary Calculation</h2>
      <p>Selected Month: {month}</p>
      <p>Selected Year: {year}</p>

      <h3>Valid Employees:</h3>
{validEmployees.length === 0 ? (
  <p>No valid employees found for the selected period.</p>
) : (
  <ul>
    {validEmployees.map((employee) => {
      const employeeContracts = contracts.filter((contract) => {
        const contractToDate = new Date(contract.contract_to_date);
        const contractMonth = contractToDate.getMonth() + 1;
        const contractYear = contractToDate.getFullYear();
        return contractMonth === parseInt(month, 10) && contractYear === parseInt(year, 10);
      });

      return (
        <li key={employee.id} onClick={() => calculateSalary(employee.id)}>
          {employee.name} {employee.surname} ({employeeContracts.length} contracts)
        </li>
      );
    })}
  </ul>
)}


      <h3>Salary Calculation Results:</h3>
      {salaryResults.length === 0 ? (
        <p>No salary calculation results available.</p>
      ) : (
        <ul>
          {salaryResults.map((result, index) => (
            <li key={index}>
              <strong>Employee ID:</strong> {result.employeeId}
              <br />
              <strong>Employee Name:</strong> {result.employeeName}
              <br />
              <strong>Salary:</strong> {result.salaryAmount}
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SalaryCalculationPage;
