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
import { useSetup } from './SetupContext'; // Adjust the import path as necessary
import { useUser } from './UserContext'; // Ensure correct pat
import { useRequireAuth } from './useRequireAuth';

// Employee component
function Employee({ employee, updateEmployeeInList, taxOffices, detailView }) {
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
  const [editContractsMode, setEditContractsMode] = useState(false);
  const [editingContractId, setEditingContractId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [taxOffice, setTaxOffice] = useState(employee.tax_office); // Assuming 'tax_office' is the property
  const [taxOfficeName, setTaxOfficeName] = useState(''); // You might need to adjust this based on how you handle tax office names
  const user = useRequireAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // State to track the selected employee for displaying details


  
  
  
  

const location = useLocation(); // Correct usage of useLocation

const handleFullEdit = (contractId) => {
  navigate(`/add-contract/${id}/${contractId}`);
};

const handleAneks = (originalContractId, latestAneksId = null) => {
  // If a latest aneks ID is provided, use it; otherwise, use the original contract ID
  const contractIdToUse = latestAneksId || originalContractId;
  navigate(`/aneks/${id}/${contractIdToUse}`);
};



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
  
  const handleTerminateContractPage = (id) => {
    navigate(`/TerminateContract/${id}`);
  };
  
  
  

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  

  const toggleContracts = async () => {
    if (!contractsVisible) {
      try {
        const response = await axios.get(`http://localhost:3001/api/contracts/${id}`);
        console.log("Fetched contracts:", response.data.contracts);
        const combinedContracts = combineContracts(response.data.contracts);
        setContracts(combinedContracts);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      }
    }

    setContractsVisible(!contractsVisible);
  };

  function combineContracts(contracts) {
    // Sort contracts by contract_from_date in ascending order
    contracts.sort((a, b) => new Date(a.contract_from_date) - new Date(b.contract_from_date));
    
    let contractMap = new Map();
  
    contracts.forEach(contract => {
      const originalId = contract.kontynuacja || contract.id;
  
      if (!contractMap.has(originalId)) {
        contractMap.set(originalId, { original: null, aneks: [] });
      }
  
      const contractData = contractMap.get(originalId);
  
      if (!contract.kontynuacja) {
        // This is the original contract
        contractData.original = contract;
      } else {
        // This is an aneks
        contractData.aneks.push(contract);
      }
    });
  
    return Array.from(contractMap.values());
  }
  


  function getOriginalContract(originalContractId, allContracts) {
    const originalContract = allContracts.find(contract => contract.id === originalContractId);
    console.log("Found original contract for aneks:", originalContract);
    return originalContract;
  }
  
  
  
  const AneksView = ({ contract, originalContract }) => {
    
    const changes = [];
    
    
    // You may want to ensure that you're comparing numbers, as different types (string vs number) could cause issues.
    const originalGrossAmount = Number(originalContract.gross_amount);
    const aneksGrossAmount = Number(contract.gross_amount);

    console.log("Aneks contract data:", contract);
    console.log("Original contract data:", originalContract);

    if (!originalContract) {
      console.error('Original contract not found for aneks:', contract);
      return <p>Original contract data missing!</p>;
    }

    if (aneksGrossAmount !== originalGrossAmount) {
      changes.push(`Gross Amount changed from ${originalGrossAmount} to ${aneksGrossAmount}`);
    }
  
    // Log the data to see if they are being passed correctly and to confirm the change is detected.
    console.log("Original contract gross amount:", originalGrossAmount);
    console.log("Aneks contract gross amount:", aneksGrossAmount);
    console.log("Detected changes:", changes);
  
    return (
      <div>
        <p>Aneks details (debug):</p>
        <p>Original Gross Amount: {originalContract.gross_amount}</p>
        <p>New Gross Amount: {contract.gross_amount}</p>
        {/* Render detected changes or a message if none */}
        {changes.length > 0 ? (
          <ul>{changes.map((change, index) => <li key={index}>{change}</li>)}</ul>
        ) : (
          <p>No changes were made in this aneks.</p>
        )}
      </div>
    );
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

  const toggleEditContractsMode = (contractId) => {
    setEditContractsMode(!editContractsMode);
    setEditingContractId(contractId);
  };
  
  const handleUpdateContract = async (e, contractId) => {
    e.preventDefault();
  
    const updatedContractData = {
      gross_amount: e.target.gross_amount.value,
      contract_from_date: e.target.contract_from_date.value,
      contract_to_date: e.target.contract_to_date.value,
      typ_umowy: e.target.typ_umowy.value,
      stanowisko: e.target.stanowisko.value,
      etat: e.target.etat.value,
      workstart_date: e.target.workstart_date.value,
      
    };
  
    try {
      const response = await axios.put(`http://localhost:3001/api/contracts/${contractId}`, updatedContractData);
      // Handle success
      setEditContractsMode(false);
      setEditingContractId(null);
      setUpdateMessage('Contract data updated successfully!');
        console.log('Message set:', updateMessage);
        setTimeout(() => setUpdateMessage(''), 3000); // Message disappears after 3 seconds
    } catch (error) {
      console.error('Error updating contract:', error);
      // Handle error appropriately
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

  const isContractTerminated = (endDate) => {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return contractEndDate < today;
};
  const contractStatus = isContractTerminated(employee.contractEndDate) ? 'Terminated' : 'Active';
  const statusColor = contractStatus === 'Terminated' ? 'red' : 'green';
 
  if (detailView) {
    // Render the detailed view of the selected employee
  return (
    <div>
      <span style={{ color: statusColor }}>{contractStatus}</span>
      <p>Name: {name}</p>
      <p>Surname: {surname}</p>
  
      <button onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</button>
      <button onClick={toggleContracts}>{contractsVisible ? 'Hide Contracts' : 'Show Contracts'}</button>
      
      <button onClick={() => handleGenerateContractPage(id)}>Generuj</button>

      <button onClick={handleMedicalExamination}>Medical Examination</button>
      <button onClick={() => handleTerminateContractPage(id)}>Terminate Contract</button>

      <hr /> {/* Horizontal line divider */}


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
      <div>
        <p>No contracts found.</p>
        <button onClick={handleAddContract}>Add Contract</button>
      </div>
    ) : (
      contracts.map(({ original, aneks }) => (
        <div key={original.id}>
          {/* Render Original Contract Details */}
          <p>Original Contract ID: {original.id}</p>
          
          {updateMessage && <div className="update-message">{updateMessage}</div>}
          {editContractsMode && editingContractId === original.id ? (
            // Render the form for editing the original contract
            <form onSubmit={(e) => handleUpdateContract(e, original.id)}>
              {/* Add all form fields for editing the original contract */}
              <label htmlFor="gross_amount">Gross Amount:</label>
              <input type="number" name="gross_amount" defaultValue={original.gross_amount} />
              <label htmlFor="contract_from_date">Contract From:</label>
              <input type="date" name="contract_from_date" defaultValue={original.contract_from_date} />
              <label htmlFor="contract_to_date">Contract To:</label>
              <input type="date" name="contract_to_date" defaultValue={original.contract_to_date} />
              <label htmlFor="typ_umowy">Typ Umowy:</label>
              <input type="text" name="typ_umowy" defaultValue={original.typ_umowy} />
              <label htmlFor="stanowisko">Stanowisko:</label>
              <input type="text" name="stanowisko" defaultValue={original.stanowisko} />
              <label htmlFor="etat">Etat:</label>
              <input type="text" name="etat" defaultValue={original.etat} />
              <label htmlFor="Rozpoczęcie pracy">Rozpoczęcie pracy:</label>
              <input type="date" name="workstart_date" defaultValue={original.workstart_date} />
              <button type="submit">Save Changes</button>
              <button onClick={() => toggleEditContractsMode(null)}>Cancel</button>
            </form>
          ) : (
            // Render the normal view of the original contract
            <div>
              <p>Gross Amount: {original.gross_amount}</p>
              <p>Contract From: {new Date(original.contract_from_date).toLocaleDateString()}</p>
              <p>Contract To: {aneks.length > 0 ? new Date(aneks[aneks.length - 1].contract_to_date).toLocaleDateString() : new Date(original.contract_to_date).toLocaleDateString()}</p>
              <p>Typ Umowy: {original.typ_umowy}</p>
              <p>Stanowisko: {original.stanowisko}</p>
              <p>Etat: {original.etat}</p>
              <p>Rozpoczęcie pracy: {new Date(original.workstart_date).toLocaleDateString()}</p>
              <p>typ rozwiązania umowy: {original.termination_type}</p>
               {/* New row for Contract Termination Status */}
               <p>
            Contract Status: 
            {isContractTerminated(aneks.length > 0 ? aneks[aneks.length - 1].contract_to_date : original.contract_to_date)
              ? <span style={{ color: 'red' }}> Terminated</span>
              : <span style={{ color: 'green' }}> Active</span>}
          </p>
              {aneks.length === 0 ? (
      <button onClick={() => toggleEditContractsMode(original.id)}>Quick edit</button>
    ) : (
      <p>Do umowy istnieje aneks. Zmiany w umowie poprzez aneks</p>
    )}
              <button onClick={() => handleFullEdit(original.id)}>Full Edit</button>
              {aneks.length === 0 ? (
    <button onClick={() => handleAneks(original.id)}>Create Aneks</button>
  ) : (
    <button onClick={() => handleAneks(original.id, aneks[aneks.length - 1].id)}>Modify Aneks</button>
  )
}
              <button onClick={handleAddContract}>Add new Contract</button>
            </div>
          )}

          {/* Render Aneks Contracts */}
          {aneks && aneks.length > 0 && (
            <div>
              <h4>Aneks:</h4>
              {aneks.map(aneksContract => (
                <div key={aneksContract.id}>
                  <p>Aneks Contract ID: {aneksContract.id}</p>
                  <AneksView contract={aneksContract} originalContract={original} />
                  {/* Display details of aneks contract */}
                  <div>
                    {/* Display details of aneks contract */}
                    <p>Gross Amount: {aneksContract.gross_amount}</p>
                    <p>Contract From: {new Date(aneksContract.contract_from_date).toLocaleDateString()}</p>
                    <button onClick={() => handleAneks(original.id, aneks[aneks.length - 1].id)}>Modify Aneks</button>
                    
                    {/* Add more fields if needed */}
                  </div>
                  <hr /> {/* Horizontal line divider */}
                </div>
                
              ))}
            </div>
          )}
        </div>
      ))
    )}
  </div>
)}



    </div>
      )
}else {
  // Render the summary view
  return (
    <div className="flex justify-between">
      {/* Summary information for the employee list */}
      
      <div>
        <p className="font-bold">{employee.name} {employee.surname}</p>
        <span style={{ color: statusColor }}>{contractStatus}</span>
      </div>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        onClick={() => setSelectedEmployee(employee)}
      >
        More
      </button>
    </div>
  );
}
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
  const [filterStatus, setFilterStatus] = useState('all'); // new state for filtering by contract status
  const { setIsInSetupProcess } = useSetup(); // Use the hook to access context methods
  const user = useRequireAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

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

  const isContractTerminated = (endDate) => {
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return contractEndDate < today;
  };
  
  const filteredAndSortedEmployees = employees
    .filter(employee => {
      // Apply surname filter
      const surnameMatch = employee.surname.toLowerCase().includes(filter.toLowerCase());
  
      // Apply contract status filter
      const isTerminated = isContractTerminated(employee.contractEndDate);
      const statusMatch = filterStatus === 'all' || 
                          (filterStatus === 'active' && !isTerminated) || 
                          (filterStatus === 'terminated' && isTerminated);
  
      return surnameMatch && statusMatch;
    })
    .sort((a, b) => {
      // Apply sorting
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

  const handleCreateEmployeeClick = () => {
    setIsInSetupProcess(false); // Set to false to indicate not in setup process
    navigate('/createEmployee');
  };

  // If user is null, component will show a loading message or a minimal UI instead of immediately returning null
  if (!user) {
    return (
      <div>Loading... If you are not redirected, <a href="/loginUser">click here to login</a>.</div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4">
          
          <div className="md:w-1/2">
            <h1 className="text-2xl font-semibold mb-4">Employee List</h1>
        <div className="flex flex-wrap gap-4 mb-4 justify-between">
          <input
            type="text"
            placeholder="Filter by surname..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 shadow-sm w-full md:w-auto flex-1"
          />
          <select onChange={handleSortChange} className="border border-gray-300 rounded-md p-2 shadow-sm">
            <option value="asc">Sort A-Z</option>
            <option value="desc">Sort Z-A</option>
          </select>
          <select onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md p-2 shadow-sm">
            <option value="all">All Employees</option>
            <option value="active">Active Employees</option>
            <option value="terminated">Terminated Employees</option>
          </select>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreateEmployeeClick}
          >
            Create Employee
          </button>
        </div>
        <div className="employee-list">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-1 gap-10">
          {filteredAndSortedEmployees.map((employee) => (
            <div 
            onClick={() => handleEmployeeSelect(employee)} 
            key={employee.id} 
            updateEmployeeInList={updateEmployeeInList} 
            taxOffices={taxOffices}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
          >
            {/* Pass just the necessary props to Employee for summary view */}
            <Employee 
              employee={employee} 
              handleEmployeeSelect={handleEmployeeSelect} 
              
            />
          </div>
          ))}
        </div>
      )}
    </div>
      </div>
      {selectedEmployee && (
            <div className="md:w-1/2 bg-white p-4 rounded-md shadow">
              {/* Display selected employee details */}
              <Employee
                employee={selectedEmployee}
                updateEmployeeInList={updateEmployeeInList}
                taxOffices={taxOffices}
                detailView={true} // pass true to show detailed view
                setSelectedEmployee={setSelectedEmployee} // pass function to unset the selected employee
              />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default EmployeeList;
