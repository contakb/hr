import React, {useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator'; // Adjust the path as necessary
import { useSetup } from './SetupContext'; // Import the context to use steps
import axiosInstance from './axiosInstance';
import { useRequireAuth } from './useRequireAuth';
import Modal from './Modal'; // Import the Modal component
import SalaryCalculator from './SalaryCalculator'; // Import the SalaryCalculator component

function AddCivilContractForm() {
  const { employeeId, contractId } = useParams();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for umowa cywilnoprawna fields
  const [grossAmount, setGrossAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stanowisko, setStanowisko] = useState('');
  const [taskDescription, setTaskDescription] = useState(''); // Task description for umowa cywilnoprawna
  const [hoursWorked, setHoursWorked] = useState(''); // Hours worked for umowa cywilnoprawna
  const [payPerHour, setPayPerHour] = useState(''); // Pay per hour for umowa cywilnoprawna
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { currentStep, setCurrentStep, nextStep, steps } = useSetup(); // Use the context to control steps
  const { markStepAsCompleted } = useSetup();
  const [showNextStepButton, setShowNextStepButton] = useState(false);


  const { setIsInSetupProcess } = useSetup();
  const user = useRequireAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isInSetupProcess = queryParams.get('setup') === 'true';

  useEffect(() => {
    const currentPath = location.pathname;
    const stepIndex = steps.findIndex(step => step.path === currentPath);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
    }
  }, [location, setCurrentStep, steps]);

  const isSetupCompleted = () => {
    const setupCompleted = localStorage.getItem('setupCompleted');
    return setupCompleted === 'true';
  };

  useEffect(() => {
    const setupPaths = ['/CreateCompany', '/createEmployee', '/AddCivilContractForm', '/EmployeeParam'];
    const isInSetupProcessNow = setupPaths.some(path => location.pathname.startsWith(path)) && !isSetupCompleted();
    setIsInSetupProcess(isInSetupProcessNow);
  }, [location.pathname]);

  // Check if we are in edit mode (contractId is present)
  const isEditMode = !!contractId;

  useEffect(() => {
    const fetchContractDetails = async () => {
      if (contractId) {
        try {
          const response = await axiosInstance.get(`http://localhost:3001/api/civil-contract/${contractId}`, {
            headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'X-Schema-Name': user.schemaName,
            },
          });
          const contract = response.data;
    
          // Pre-fill the form with contract data
          setGrossAmount(contract.gross_amount);
          setStartDate(contract.contract_from_date);
          setEndDate(contract.contract_to_date);
          setStanowisko(contract.stanowisko);
          setTaskDescription(contract.task_description);
          setHoursWorked(contract.hours_worked);
          setPayPerHour(contract.pay_per_hour);
        } catch (error) {
          console.error('Error fetching civil contract:', error);
        }
      }
    };
    
    fetchContractDetails();
  }, [contractId]);
  
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    setFeedbackMessage('');
  
    const contractData = {
      employee_id: employeeId,
      gross_amount: grossAmount,
      contract_from_date: startDate,
      contract_to_date: endDate,
      stanowisko,
      task_description: taskDescription,
      hours_worked: hoursWorked,
      pay_per_hour: payPerHour,
    };
  
    try {
      let response;
      if (contractId) {
        // Update existing contract
        response = await axiosInstance.put(`http://localhost:3001/api/civil-contracts/${contractId}`, contractData, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
        setIsError(false);
        setFeedbackMessage('Umowa cywilnoprawna updated successfully.');
      } else {
        // Add new contract
        response = await axiosInstance.post(`http://localhost:3001/api/civil-contracts`, contractData, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'X-Schema-Name': user.schemaName,
          }
        });
        setIsError(false);
        setFeedbackMessage('Umowa cywilnoprawna added successfully.');
      }
  
      const savedContract = response.data.updatedContract || response.data.contract; // Handle both cases
      if (savedContract) {
        setGrossAmount(savedContract.gross_amount);
        setStartDate(savedContract.contract_from_date);
        setEndDate(savedContract.contract_to_date);
        setStanowisko(savedContract.stanowisko);
        setTaskDescription(savedContract.task_description);
        setHoursWorked(savedContract.hours_worked);
        setPayPerHour(savedContract.pay_per_hour);
      }
  
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error in contract operation:', error);
      setIsError(true);
      setFeedbackMessage('Error saving the contract.');
      setIsSubmitting(false);
    }
  };
  

  const handleDeleteContract = async () => {
    if (!contractId) return;
  
    try {
      await axiosInstance.delete(`http://localhost:3001/api/civil-contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'X-Schema-Name': user.schemaName
        }
      });
      setIsError(false); // Ensure success state
      setFeedbackMessage('Umowa cywilnoprawna deleted successfully.');
      navigate('/employeeList'); // Redirect after deletion
    } catch (error) {
      console.error('Error deleting contract:', error);
      setIsError(true); // Set error state on failure
      setFeedbackMessage('Error deleting the contract.');
    }
  };
  

  const handleBackToEmployeeList = () => {
    navigate('/employeeList'); // Adjust to your employee list route
  };

  const confirmDeleteContract = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div>
      <div className="bg-gray-100 min-h-screen p-8">
        {isInSetupProcess && <StepIndicator steps={steps} currentStep={currentStep} />}
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6">{isEditMode ? 'Edytuj umowę cywilnoprawną' : 'Dodaj umowę cywilnoprawną'}</h2>
          {feedbackMessage && (
  <div className={`mb-4 p-4 rounded ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
    {feedbackMessage}
  </div>
)}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
            <div className="flex flex-wrap -mx-2">
              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Gross Amount:</label>
                <input 
                  type="text" 
                  value={grossAmount} 
                  onChange={(e) => setGrossAmount(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              <div className="w-1/2 px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Start Date:</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="w-1/2 px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">End Date:</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Stanowisko:</label>
                <input 
                  type="text" 
                  value={stanowisko} 
                  onChange={(e) => setStanowisko(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Opis zadania:</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Godziny pracy:</label>
                <input 
                  type="number" 
                  value={hoursWorked} 
                  onChange={(e) => setHoursWorked(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Stawka za godzinę:</label>
                <input 
                  type="number" 
                  value={payPerHour} 
                  onChange={(e) => setPayPerHour(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
            </div>
            <button className={`inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}  type="submit" disabled={isSubmitting}>
              {isEditMode ? 'Update Contract' : 'Add Contract'}
            </button>
            {isEditMode && (
              <button
                type="button"
                className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4"
                onClick={confirmDeleteContract}
              >
                Delete Contract
              </button>
            )}
            {/* Add Back button */}
            <button className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4" onClick={handleBackToEmployeeList}>
              Back to Employee List
            </button>
          </form>
        </div>
      </div>
       {/* Delete Confirmation Modal */}
       <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <div>
          <p>Are you sure you want to delete this contract?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md"
              onClick={handleDeleteContract}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AddCivilContractForm;
