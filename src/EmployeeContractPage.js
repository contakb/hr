import React from 'react';
import EmployeeContract from './EmployeeContract';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function EmployeeContractPage() {
  const location = useLocation();
  const { employeeData, contract } = location.state;

  const navigate = useNavigate();

  return (
    <div>
      <EmployeeContract employeeData={employeeData} contract={contract} />
      <button onClick={() => navigate('/employeeList')}>Back to Employee List</button>
    </div>
  );
}

export default EmployeeContractPage;
