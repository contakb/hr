import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EmployeeContract from './EmployeeContract';
import html2pdf from 'html2pdf.js';

// Employee component
function Employee({ employee }) {
  const { id, name, surname, street, number, postcode, city, country, tax_office, pesel } = employee;
  const [showDetails, setShowDetails] = useState(false);
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [generateContractVisible, setGenerateContractVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPDF, setShowPDF] = useState(false); // Add this line
  const navigate = useNavigate();

  const handleAddContract = () => {
    navigate(`/add-contract/${id}`);
  };

  const handleGenerateContractPage = () => {
    navigate('/EmployeeContractPage', { state: { employeeData: employee, contract: selectedContract } });

  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleGenerateContract = () => {
    setGenerateContractVisible(!generateContractVisible);
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
      const contracts = contractResponse.data.contracts;
  
      if (contracts.length === 0) {
        console.error('No contracts found.');
        return;
      }
  
      if (contracts.length === 1) {
        // If there's only one contract, select it
        setSelectedContract(contracts[0]);
        setGenerateContractVisible(true);
        toggleGenerateContract();
      } else {
        // If there are multiple contracts, you can provide a way for the user to select one
        // For example, display a dropdown or modal for contract selection
        // You'll need to implement the contract selection logic here
      }
    } catch (error) {
      console.error('Error generating contract:', error);
    }
  };
  
  
  

  const generatePDF = () => {
    const contractContent = document.getElementById('contract-content');
    if (contractContent) {
      html2canvas(contractContent)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF();
          pdf.addImage(imgData, 'PNG', 10, 10, 190, 260);
          pdf.save('employment_contract.pdf');
          setShowPDF(true); // Show the PDF content
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  };

  useEffect(() => {
    // Register the click event for the button after component mount
    const pdfButton = document.getElementById('pdf-button');
    if (pdfButton) {
      pdfButton.addEventListener('click', generatePDF);
    }

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      if (pdfButton) {
        pdfButton.removeEventListener('click', generatePDF);
      }
    };
  }, []); // Empty dependency array to run this effect once after component

  return (
    <div>
      <p>Name: {name}</p>
      <p>Surname: {surname}</p>
      <button onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</button>
      <button onClick={handleAddContract}>Add Contract</button>
      <button onClick={toggleContracts}>{contractsVisible ? 'Hide Contracts' : 'Show Contracts'}</button>
      <button onClick={handleGenerateContract}>{generateContractVisible ? 'Hide Contract' : 'Show Contract'}</button>
      <button onClick={handleGenerateContractPage}>Generuj</button> {/* Add this button */}

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
          {showPDF ? (
            <div>
              <button onClick={() => setShowPDF(false)}>Close PDF</button>
            </div>
          ) : (
            <div>
              <button id="pdf-button">Download PDF</button>
              <button onClick={handleGenerateContractPage}>Generuj</button> {/* Add this button */}
            </div>
          )}
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
