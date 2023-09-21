import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EmployeeContract from './EmployeeContract';

// Employee component
function Employee({ employee }) {
  const { id, name, surname, street, number, postcode, city, country, tax_office, pesel } = employee;
  const [showDetails, setShowDetails] = useState(false);
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [generateContractVisible, setGenerateContractVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const navigate = useNavigate();

  const handleAddContract = () => {
    navigate(`/add-contract/${id}`);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleContracts = async () => {
    if (!contractsVisible) {
      try {
        const response = await axios.get(`http://localhost:3001/api/contracts/${id}`);
        setContracts(response.data.contracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      }
    }

    setContractsVisible(!contractsVisible);
  };

  const handleGenerateContract = async () => {
    try {
      const contractResponse = await axios.get(`http://localhost:3001/api/contracts/${id}`);
      setSelectedContract(contractResponse.data.contracts[0]); // Assuming your contract data is available here
      setGenerateContractVisible(true); // Show the contract template
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  };
  
  
  

  const generatePDF = () => {
    // Create a new instance of jsPDF
    const doc = new jsPDF();

    // Reference to the contract content element
    const contractContent = document.getElementById('contract-content');

    if (contractContent) {
      // Use html2canvas to capture the HTML content as an image
      html2canvas(contractContent)
        .then((canvas) => {
          // Convert the canvas to a data URL
          const imgData = canvas.toDataURL('image/png');

          // Add the image to the PDF
          doc.addImage(imgData, 'PNG', 10, 10, 190, 260);

          // Save or display the generated PDF
          doc.save('employment_contract.pdf');
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };

  return (
    <div>
      <p>Name: {name}</p>
      <p>Surname: {surname}</p>
      <button onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</button>
      <button onClick={handleAddContract}>Add Contract</button>
      <button onClick={toggleContracts}>{contractsVisible ? 'Hide Contracts' : 'Show Contracts'}</button>
      <button onClick={handleGenerateContract}>{generateContractVisible ? 'Hide Contract' : 'Show Contract'}</button>

      {showDetails && (
        <div>
          <p>Street: {street} {number}</p>
          <p>Postcode: {postcode}</p>
          <p>City: {city}</p>
          <p>Country: {country}</p>
          <p>Tax Office: {tax_office}</p>
          <p>PESEL: {pesel}</p>
        </div>
      )}

      {contractsVisible && (
        <div>
          <h3>Contracts:</h3>
          {contracts.length === 0 ? (
            <p>No contracts found.</p>
          ) : (
            contracts.map((contract) => (
              <div key={contract.id}>
                <p>Gross Amount: {contract.gross_amount}</p>
                <p>Contract From: {new Date(contract.contract_from_date).toLocaleDateString()}</p>
                <p>Contract To: {new Date(contract.contract_to_date).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {generateContractVisible && (
        <div>
          <h3>Generated Contract:</h3>
          {console.log('employeeData:', employee)} {/* Add this line */}
          <EmployeeContract employeeData={employee} contract={selectedContract} />
          <button onClick={generatePDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
}

// EmployeeList component
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="employee-list-container">
      <div className="employee-list-title">
        <h1>Employee List</h1>
        <button className="create-employee-button" onClick={() => navigate('/createEmployee')}>
          Create Employee
        </button>
      </div>
      <div className="employee-list">
        {employees.map((employee) => (
          <Employee key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}

export default EmployeeList;
