import React from 'react';

const EmployeeContract = ({ employeeData, contract }) => {
  // Replace placeholders with actual data from the employeeData object
  const { name, surname } = employeeData;
  const { contract_from_date, contract_to_date } = contract;
  

  
  

  return (
    <div className="contract">
      <div className="header">Umowa o pracę</div>
      <div className="employee-info">
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Surname:</strong> {surname}</p>
        {/* Add more employee information here */}
      </div>
      <div className="contract-terms">
        <h2>Waruni umowy</h2>
        <p>This employment contract ("Contract") is entered into on {new Date(contract_from_date).toLocaleDateString()}
        od {new Date(contract_from_date).toLocaleDateString()} do {new Date(contract_to_date).toLocaleDateString()} </p>
         pomiędzy:
        <p><strong>Pracodawca:</strong> Your Company Name, located at Your Company Address</p>
        <p><strong>Pracownik:</strong> {name} {surname}</p>
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
