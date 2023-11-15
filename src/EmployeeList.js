import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EmployeeContract from './EmployeeContract';
import html2pdf from 'html2pdf.js';
import { useLocation } from 'react-router-dom';
import './Login.css';
import Select from 'react-select';

// Employee component
function Employee({ employee, updateEmployeeInList, taxOffices }) {
  const { id, name, surname, street, number, postcode, city, country, tax_office, pesel } = employee;
  const [showDetails, setShowDetails] = useState(false);
  const [contractsVisible, setContractsVisible] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [generateContractVisible, setGenerateContractVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showPDF, setShowPDF] = useState(false); // Add this line
  const navigate = useNavigate();
  const [medicalFormVisible, setMedicalFormVisible] = useState(false);
  const [parametersVisible, setParametersVisible] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editEmployeeDetailsMode, setEditEmployeeDetailsMode] = useState(false);
  const [editParametersMode, setEditParametersMode] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [taxOffice, setTaxOffice] = useState(employee.tax_office); // Assuming 'tax_office' is the property
  const [taxOfficeName, setTaxOfficeName] = useState(''); // You might need to adjust this based on how you handle tax office names
  

const location = useLocation(); // Correct usage of useLocation




  const handleAddContract = () => {
    navigate(`/add-contract/${id}`);
  };

  const handleGenerateContractPage = (id) => {
    navigate(`/EmployeeContract/${id}`);
};



  const handleMedicalExamination = () => {
    navigate(`/medical-examination/${id}`, {
      state: {
        employee:employee, contracts:contracts
      },
    });
  };
  const handleAddParameters = () => {
    navigate(`/employee-param/${id}`); // Replace with your actual path to the add parameters page
  };

  const handleEditParameters = () => {
    navigate(`/employee-param/${id}`, { state: { hasParams: !!parameters } });
  };
  
  
  
  

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
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
  const toggleParameters = async () => {
    if (!parametersVisible) {
      try {
        const response = await axios.get(`http://localhost:3001/api/employee-params/${id}`);
        const hasParameters = response.data.parameters.length > 0;
        setParameters(hasParameters ? response.data.parameters[0] : null);
  
        // Use hasParameters to decide which button to show
        if (hasParameters) {
          // Logic for when parameters exist
        } else {
          // Logic for when parameters don't exist
        }
  
      } catch (error) {
        console.error('Error fetching parameters:', error);
        setParameters(null);
      }
    }
    setParametersVisible(!parametersVisible);
  };
  
  // Toggle detail editor for an employee
  const toggleDetailEditor = (employeeId) => {
    setEditingEmployeeId(editingEmployeeId === employeeId ? null : employeeId);
  };

  // Toggle function for employee details edit mode
  const toggleEditEmployeeDetailsMode = () => {
    setEditEmployeeDetailsMode(!editEmployeeDetailsMode);
    // Ensure that editing parameters is turned off when editing employee details
    setEditParametersMode(false);
  };
   // Toggle function for parameters edit mode
   const toggleEditParametersMode = () => {
    setEditParametersMode(!editParametersMode);
    // Ensure that editing employee details is turned off when editing parameters
    setEditEmployeeDetailsMode(false);
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
  
  const handleUpdateParameters = async (e) => {
    e.preventDefault();
  
    const updatedParameters = {
      koszty: e.target.koszty.value,
      ulga: e.target.ulga.value,
      kod_ub: e.target.kod_ub.value,
      valid_from: e.target.valid_from.value,
    };
  
    try {
      const response = await axios.put(`http://localhost:3001/api/employee-params/${id}`, updatedParameters);
      if (response.data.updatedParameters.length > 0) {
        setParameters(response.data.updatedParameters[0]);
        setEditMode(false);
        setEditParametersMode(false); // Set the specific edit mode to false
        setUpdateMessage('Parameters updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
      }
    } catch (error) {
      console.error('Error updating parameters:', error);
      setUpdateMessage('Failed to update parameters.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };



  const handleUpdateDetails = async (e) => {
    e.preventDefault();
  
    const updatedDetails = {
      name: e.target.name.value,
      surname: e.target.surname.value,
      pesel: e.target.pesel.value,
      street: e.target.street.value,
      number: e.target.number.value,
      postcode: e.target.postcode.value,
      city: e.target.city.value,
      country: e.target.country.value,
      tax_office: taxOffice,
    };
  
    try {
      const response = await axios.put(`http://localhost:3001/update-employee/${id}`, updatedDetails);
      if (response.data.updatedEmployee) {
        updateEmployeeInList(id, response.data.updatedEmployee);
        setEditMode(false);
        setEditEmployeeDetailsMode(false); // Set the specific edit mode to false
        setUpdateMessage('Employee data updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
      }
    } catch (error) {
      console.error('Error updating details:', error);
      setUpdateMessage('Failed to update employee data.');
      setTimeout(() => setUpdateMessage(''), 3000);
      // Handle error appropriately
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

  useEffect(() => {
    if (updateMessage) {
      console.log('Update message:', updateMessage);
    }
  }, [updateMessage]);

  // Check if taxOffices is available and not undefined
  const taxOfficeOptions = taxOffices ? taxOffices.map(office => ({
  value: office.tax_office,
  label: office.tax_office
  })) : [];

  const handleTaxOfficeChange = (selectedOption) => {
    if (selectedOption) {
        setTaxOffice(selectedOption.value);
        
        // This sets the name as well
        setTaxOfficeName(selectedOption.label);
    } else {
        setTaxOffice('');
        setTaxOfficeName('');
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
      <button onClick={() => handleGenerateContractPage(id)}>Generuj</button>

      <button onClick={handleMedicalExamination}>Medical Examination</button>


      {showDetails && (
  <div>
    {editEmployeeDetailsMode ? (
      <form onSubmit={handleUpdateDetails}>
      <label htmlFor="name">Name:</label>
      <input type="text" name="name" id="name" defaultValue={name} placeholder="Name" className="form-input" />
  
      <label htmlFor="surname">Surname:</label>
      <input type="text" name="surname" id="surname" defaultValue={surname} placeholder="Surname"className="form-input" />
  
      <label htmlFor="street">Street:</label>
      <input type="text" name="street" id="street" defaultValue={street} placeholder="Street"className="form-input" />
  
      <label htmlFor="number">Number:</label>
      <input type="text" name="number" id="number" defaultValue={number} placeholder="Number"className="form-input" />
  
      <label htmlFor="postcode">Postcode:</label>
      <input type="text" name="postcode" id="postcode" defaultValue={postcode} placeholder="Postcode"className="form-input" />
  
      <label htmlFor="city">City:</label>
      <input type="text" name="city" id="city" defaultValue={city} placeholder="City" className="form-input"/>
  
      <label htmlFor="country">Country:</label>
      <input type="text" name="country" id="country" defaultValue={country} placeholder="Country"className="form-input" />
  
      <label>Tax Office:</label>
          <Select 
            options={taxOfficeOptions} 
            onChange={handleTaxOfficeChange}
            isSearchable={true}
            placeholder="Wybierz US"
            value={taxOfficeOptions.find(option => option.value === employee.tax_office)} // Make sure this matches the current tax office of the employee
          />
      <label htmlFor="pesel">PESEL:</label>
      <input type="text" name="pesel" id="pesel" defaultValue={pesel} placeholder="PESEL"className="form-input" />
  
      <button type="submit">Save Changes</button>
      <button onClick={toggleEditMode}>Cancel</button>
      </form>
    ) : (
      <div>
        {updateMessage && <div className="update-message">{updateMessage}</div>}
        <p>Name: {name}</p>
        <p>Surname: {surname}</p>
        <p>Street: {street} {number}</p>
        <p>Postcode: {postcode}</p>
        <p>City: {city}</p>
        <p>Country: {country}</p>
        <p>Tax Office: {tax_office}</p>
        <p>PESEL: {pesel}</p>
        <button onClick={toggleParameters}>{parametersVisible ? 'Hide Parameters' : 'Show Parameters'}</button>
        <button onClick={toggleEditEmployeeDetailsMode}>Quick edit</button>
        </div>)}
          {parametersVisible && (
  <div>
    
    <h3>Parameters:</h3>
    {updateMessage && <div className="update-message">{updateMessage}</div>}
    {editParametersMode ? (
      <form onSubmit={handleUpdateParameters}>
        
        <input type="text" name="koszty" defaultValue={parameters.koszty} />
        <input type="text" name="ulga" defaultValue={parameters.ulga} />
        <input type="text" name="kod_ub" defaultValue={parameters.kod_ub} />
        <input type="date" name="valid_from" defaultValue={parameters.valid_from} />
        <button type="submit">Save Changes</button>
        <button onClick={toggleEditMode}>Cancel</button>
      </form>
    ) : parameters ? (
      <div>
        <p>Koszty: {parameters.koszty}</p>
        <p>Ulga: {parameters.ulga}</p>
        <p>Kod UB: {parameters.kod_ub}</p>
        <p>Valid From: {parameters.valid_from && new Date(parameters.valid_from).toLocaleDateString()}</p>
        <button onClick={toggleEditParametersMode}>Quick edit</button>
        <button onClick={handleEditParameters}>
  {parameters ? 'Edit Parameters' : 'Add Parameters'}
</button>
      </div>
    ) : (
      <div>
        <p>No parameters, please add them.</p>
        <button onClick={handleAddParameters}>Add Parameters</button>
      </div>
    )}
          </div>
        )}
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
      )
}

// EmployeeList component
function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // State for sorting order
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [taxOffices, setTaxOffices] = useState([]); // New state for tax offices

  const updateEmployeeInList = (employeeId, newDetails) => {
    setEmployees(currentEmployees => {
      const updated = currentEmployees.map(employee => 
        employee.id === employeeId ? { ...employee, ...newDetails } : employee
      );
      console.log("Updated Employees Order: ", updated);
      return updated;
    });
  };

  useEffect(() => {
    fetchEmployees();
    // New logic to fetch tax offices
    axios.get('http://localhost:3001/tax-offices')
      .then((response) => {
        setTaxOffices(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tax offices:', error);
      });
  }, []);

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Sorting and filtering logic combined
  const filteredAndSortedEmployees = employees
    .filter(employee => employee.surname.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.surname.localeCompare(b.surname);
      } else {
        return b.surname.localeCompare(a.surname);
      }
    });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3001/employees');
      const updatedEmployees = response.data.employees.map(employee => {
        // Assuming the API returns a flag 'hasParams'
        // Or you can determine it here based on some logic
        return { ...employee, hasParams: employee.hasParams };
      });
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
        <input
          type="text"
          placeholder="Filter by surname..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select onChange={handleSortChange}>
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
        <button className="create-employee-button" onClick={() => navigate('/createEmployee')}>
          Create Employee
        </button>
      </div>
      <div className="employee-list">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          filteredAndSortedEmployees.map((employee) => (
            <Employee key={employee.id} employee={employee} updateEmployeeInList={updateEmployeeInList} taxOffices={taxOffices} />
          ))
        )}
      </div>
    </div>
  );
}

export default EmployeeList;
