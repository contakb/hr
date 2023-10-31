import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

const EmployeeContract = () => {
  const [employee, setEmployee] = useState({});
  const [contractData, setContractData] = useState({});

  const { employeeId } = useParams(); 

  useEffect(() => {
    async function fetchData() {
      const employeeResponse = await fetch(`/employees?id=${employeeId}`);
      const employeeResult = await employeeResponse.json();

      const contractResponse = await fetch(`/contract?employeeId=${employeeId}`);
      const contractResult = await contractResponse.json();

      setEmployee(employeeResult);
      setContractData(contractResult);
    }

    fetchData();
  }, [employeeId]);

  return (
    <div className="contract">
      <div className="header">Umowa o pracę</div>
      <div className="employee-info">
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Surname:</strong> {employee.surname}</p>
        {/* Add more employee information here */}
      </div>
      <div className="contract-terms">
        <h2>Warunki umowy</h2>
        <p>This employment contract ("Contract") is entered into on {new Date(contractData.contract_from_date).toLocaleDateString()} na umowę o pracę na: {contractData.typ_umowy} od {new Date(contractData.contract_from_date).toLocaleDateString()} do {new Date(contractData.contract_to_date).toLocaleDateString()} </p>
        
         <p><strong>dzień rozpoczęcia pracy: </strong> {new Date(contractData.workstart_date).toLocaleDateString()}</p>
         <p><strong>stanowisko: </strong> {contractData.stanowisko}</p>
         <p><strong>etat: </strong> {contractData.etat}</p>
         <p><strong>okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {contractData.period_próbny} miesiące</p>
         <p><strong>Pracodawca:</strong> Your Company Name, located at Your Company Address</p>
         <p><strong>Pracownik:</strong> {employee.name} {employee.surname} zam. ul. {employee.street} {employee.number} {employee.city}</p>
        {/* Add more contract terms here */}
      </div>
      <div className="signatures">
        <p>______________________________</p>
        <p>Employer's Signature</p>
        <p>______________________________</p>
        <p>Employee's Signature</p>
      </div>
    </div>
  );
};

export default EmployeeContract;
