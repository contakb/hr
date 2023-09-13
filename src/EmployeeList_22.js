import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddContractForm from './AddContractForm';

function Employee({ employee, handleEmployeeClick, selectedEmployee }) {
  const { id, name, surname } = employee;
  const navigate = useNavigate();

  const handleAddContract = () => {
    navigate(`/add-contract/${id}`);
  };

  return (
    <div>
      <p>Name: {name}</p>
      <p>Surname: {surname}</p>
      <p>ID: {id}</p> {/* Display the employee ID */}
      <button onClick={handleAddContract}>Add Contract</button>
        <div>
          <p>Street: {employee.street} {employee.number}</p>
          <p>Postcode: {employee.postcode}</p>
          <p>City: {employee.city}</p>
          <p>Country: {employee.country}</p>
          <p>Tax Office: {employee.tax_office}</p>
          <p>PESEL: {employee.pesel}</p>
          <AddContractForm employeeId={id} /> {/* Pass the employee ID to AddContractForm */}
        </div>
      )}
    </div>
  );
}

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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


  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Employee List</h1>
      {employees.map((employee) => (
        <Employee
          key={employee.id}
          employee={employee}
          handleEmployeeClick={handleEmployeeClick}
          selectedEmployee={selectedEmployee}
		  employeeId={employee.id}
        />
      ))}
    </div>
  );
}

export default EmployeeList;
