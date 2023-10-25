import React from 'react';
import EmployeeContract from './EmployeeContract';
import { useLocation } from 'react-router-dom';

function EmployeeContractPage() {
  const location = useLocation();
  const { employeeData, contract } = location.state;

  return <EmployeeContract employeeData={employeeData} contract={contract} />;
}

export default EmployeeContractPage;
