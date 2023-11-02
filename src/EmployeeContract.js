import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';

const EmployeeContract = () => {
  const [employee, setEmployee] = useState({});
  const [contracts, setContracts] = useState({});
  const navigate = useNavigate();

  const { employeeId } = useParams(); 

  useEffect(() => {
    async function fetchData() {
      try {
        const employeeResponse = await axios.get(`http://localhost:3001/api/employees/${employeeId}`);
        const contractResponse = await axios.get(`http://localhost:3001/api/contracts/${employeeId}`);

        console.log("Contracts fetched:", contractResponse.data.contracts);


        setEmployee(employeeResponse.data.employee);
        setContracts(contractResponse.data.contracts);


      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [employeeId]);

    // Add this function to handle the back button click
const handleBackClick = () => {
  navigate(-1); // This navigates to the previous page in history
  // or you can navigate to a specific route, e.g., navigate('/dashboard');
};

  const contract = contracts && contracts.length > 0 ? contracts[0] : null;

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
        <p>This employment contract ("Contract") is entered into on {contract && contract.contract_from_date ? new Date(contract.contract_from_date).toLocaleDateString() : "N/A"} na umowę o pracę na: {contract ? contract.typ_umowy : "N/A"} od {contract && contract.contract_from_date ? new Date(contract.contract_from_date).toLocaleDateString() : "N/A"} do {contract && contract.contract_to_date ? new Date(contract.contract_to_date).toLocaleDateString() : "N/A"} 
                </p>
                <p><strong>dzień rozpoczęcia pracy: </strong> 
    {contract && contract.workstart_date ? new Date(contract.workstart_date).toLocaleDateString() : 'N/A'}</p>

    <p><strong>stanowisko: </strong> {contract?.stanowisko}</p>


    <p><strong>etat: </strong> {contract?.etat}</p>


    <p><strong>okres, na który strony mają zawrzeć umowę na czas określony po umowie na okres próbny: </strong> {contract?.period_próbny} miesiące</p>

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
      <p><button onClick={handleBackClick}>Back</button></p>
    </div>
  );
};

export default EmployeeContract;
