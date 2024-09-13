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
  const [contractType, setContractType] = useState(''); // Default to 'umowa o dzieło'
  const [amountInWords, setAmountInWords] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for umowa cywilnoprawna fields
  const [grossAmount, setGrossAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [taskDescription, setTaskDescription] = useState(''); // Task description for umowa cywilnoprawna
  const [hoursWorked, setHoursWorked] = useState(''); // Hours worked for umowa cywilnoprawna
  const [payPerHour, setPayPerHour] = useState(''); // Pay per hour for umowa cywilnoprawna
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if form is submitting
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { currentStep, setCurrentStep, nextStep, steps } = useSetup(); // Use the context to control steps
  const { markStepAsCompleted } = useSetup();
  const [showNextStepButton, setShowNextStepButton] = useState(false);
  const [projectStartDate, setProjectStartDate] = useState(''); // For "umowa o dzieło"
  const [projectEndDate, setProjectEndDate] = useState(''); // For "umowa o dzieło"
  const [prawaAutorskie, setPrawaAutorskie] = useState(false); // Checkbox for "Prawa Autorskie"
  const [prawaAutorskieText, setPrawaAutorskieText] = useState(
    "Wykonawca upoważnia również Zamawiającego do rozporządzania oraz korzystania z utworów stanowiących opracowanie dzieła, w zakresie wskazanym w ust. 1 powyżej.Wskazane upoważnienie może być przenoszone na osoby trzecie bez konieczności uzyskiwania odrębnej zgody.Przejście praw autorskich do dzieła nastąpi z momentem przekazania dzieła Zamawiającemu."
  ); // Default text for "Prawa Autorskie"

  const [deadlineDzieło, setDeadlineDzieło] = useState(''); // New state for "Dzieło zostanie wykonane w terminie do"
  const [dataWyplaty, setDataWyplaty] = useState(''); // New state for "data_wyplaty"


  const { setIsInSetupProcess } = useSetup();
  const user = useRequireAuth();
  const location = useLocation();
  

  const queryParams = new URLSearchParams(location.search);
  const isInSetupProcess = queryParams.get('setup') === 'true';

  useEffect(() => {
    const parsedValue = parseFloat(grossAmount);
    if (!isNaN(parsedValue)) {
      setAmountInWords(numberToPolishWords(parsedValue));
    } else {
      setAmountInWords('');
    }
  }, [grossAmount]);

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

  const handleShowContract = () => {
    navigate(`/UmowaCywilnoprawna/${employeeId}`); // Navigate to the UmowaCywilnoprawna page for the given employee ID
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
          setAdditionalInfo(contract.additional_info);
          setTaskDescription(contract.task_description);
          setHoursWorked(contract.hours_worked);
          setPayPerHour(contract.pay_per_hour);
          setContractType(contract.contract_type);
          setDataWyplaty(contract.data_wyplaty || '');
  
          // Set projectStartDate, projectEndDate, and deadline_dzieło only if contract type is "umowa o dzieło"
          if (contract.contract_type === 'umowa o dzieło') {
            setProjectStartDate(contract.contract_from_date);
            setProjectEndDate(contract.contract_to_date);
            setDeadlineDzieło(contract.deadline_dzieło); // Set deadline_dzieło for umowa o dzieło
          }
  
          // Set prawa_autorskie if it exists
          setPrawaAutorskie(!!contract.prawa_autorskie);
          setPrawaAutorskieText(contract.prawa_autorskie || prawaAutorskieText);
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
      additional_info: additionalInfo,  // Correct this line
      task_description: taskDescription,
      hours_worked: hoursWorked,
      pay_per_hour: payPerHour,
      contract_type: contractType, // Add contract_type to the data
      prawa_autorskie: prawaAutorskie ? prawaAutorskieText : null, // Add prawa autorskie if applicable
      deadline_dzieło: contractType === 'umowa o dzieło' ? deadlineDzieło : null, // Add deadline_dzieło only if contract type is "umowa o dzieło"
      data_wyplaty: dataWyplaty || null, // Add data_wyplaty to contract data
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
  setAdditionalInfo(savedContract.additional_info);
  setTaskDescription(savedContract.task_description);
  setHoursWorked(savedContract.hours_worked);
  setPayPerHour(savedContract.pay_per_hour);
  setContractType(savedContract.contract_type);
  setDataWyplaty(savedContract.data_wyplaty || '');

  // Set projectStartDate and projectEndDate if contract type is "umowa o dzieło"
  if (savedContract.contract_type === 'umowa o dzieło') {
    setProjectStartDate(savedContract.contract_from_date);
    setProjectEndDate(savedContract.contract_to_date);
    setDeadlineDzieło(savedContract.deadline_dzieło || '');  // Ensure it's updated in the state
    
  }

  // Handle prawa_autorskie field
  setPrawaAutorskie(!!savedContract.prawa_autorskie);
  setPrawaAutorskieText(savedContract.prawa_autorskie || prawaAutorskieText);
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
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6">
            {isEditMode ? 'Edytuj umowę cywilnoprawną' : 'Dodaj umowę cywilnoprawną'}
          </h2>
          {feedbackMessage && (
            <div className={`mb-4 p-4 rounded ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
              {feedbackMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow rounded p-6">
            {/* Contract Type Selection */}
            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Typ umowy cywilnoprawnej:</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled hidden>wybierz typ umowy</option>
                <option value="umowa o dzieło">Umowa o dzieło</option>
                <option value="umowa zlecenie">Umowa zlecenie</option>
              </select>
            </div>

            {/* Gross Amount and Amount in Words */}
            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Gross Amount:</label>
              <input
                type="text"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Kwota brutto słownie:</label>
              <p className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100">
                {amountInWords || '—'}
              </p>
            </div>

            {/* Conditional Fields for Contract Type */}
            {contractType === 'umowa o dzieło' ? (
              <>
                <div className="w-full px-2 mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Wykonawca przystąpi do wykonywania dzieła w dniu:
      </label>
      <input
        type="date"
        value={startDate}  // Populate startDate
        onChange={(e) => setStartDate(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <div className="w-full px-2 mb-4">
      <label className="block text-sm font-medium text-gray-700">Zakończenie prac nastąpi w dniu:</label>
      <input
        type="date"
        value={endDate}  // Populate endDate
        onChange={(e) => setEndDate(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <div className="w-full px-2 mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Dzieło zostanie wykonane w terminie do:
      </label>
      <input
        type="date"
        value={deadlineDzieło}  // Populate deadline_dzieło from state
        onChange={(e) => setDeadlineDzieło(e.target.value)}  // Update the state on change
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
    <div className="w-full px-2 mb-4">
  <label className="block text-sm font-medium text-gray-700">Data Wypłaty - uzupełnij po dokonaniu wypłaty:</label>
  <input
    type="date"
    value={dataWyplaty}
    onChange={(e) => setDataWyplaty(e.target.value)}
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
  />
</div>

              {/* Prawa Autorskie Checkbox */}
              <div className="w-full px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={prawaAutorskie}
                      onChange={(e) => setPrawaAutorskie(e.target.checked)}
                      className="mr-2"
                    />
                    Dodaj prawa autorskie do umowy o dzieło
                  </label>
                </div>

                {/* Prawa Autorskie Conditions */}
                {prawaAutorskie && (
              <div className="w-full px-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Prawa Autorskie:</label>
                <textarea
                  value={prawaAutorskieText}
                  onChange={(e) => setPrawaAutorskieText(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
              </>
            ) : (
              <>
                {/* Fields for Umowa Zlecenie */}
                <div className="w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Data rozpoczęcia:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Data końca:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="w-full px-2 mb-4">
  <label className="block text-sm font-medium text-gray-700">Data Wypłaty - (uzupełnij po dokonaniu wypłaty):</label>
  <input
    type="date"
    value={dataWyplaty}
    onChange={(e) => setDataWyplaty(e.target.value)}
    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
  />
</div>

              </>
            )}

            {/* Task Description, Hours, Pay Rate */}
            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Zakres prac:</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Ilość godzin do przepracowania:</label>
              <input
                type="number"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Stawka za godzinę pracy w złotych:</label>
              <input
                type="number"
                value={payPerHour}
                onChange={(e) => setPayPerHour(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Remarks */}
            <div className="w-full px-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Uwagi dodatkowe:</label>
              <input
                type="text"
                value={additionalInfo}  // Make sure the state is updated to additionalInfo
                onChange={(e) => setAdditionalInfo(e.target.value)}  // Change handler
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
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
            <button 
  className="bg-blue-500 text-white px-4 py-2 rounded mt-4" 
  onClick={handleShowContract}>
  Pokaż Umowę
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


// Conversion function from earlier
function numberToPolishWords(value) {
    const units = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
    const teens = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
    const tens = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
    const hundreds = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
    const thousands = ['tysiąc', 'tysiące', 'tysięcy'];
  
    if (value === 0) return 'zero złotych zero groszy';
  
    let zlote = Math.floor(value);
    let grosze = Math.round((value - zlote) * 100);
  
    const groszePart = grosze === 0 ? 'zero groszy' : `${grosze} groszy`;
  
    let result = '';
  
    if (zlote > 999) {
      const thousandPart = Math.floor(zlote / 1000);
      zlote %= 1000;
      result += `${units[thousandPart]} ${thousands[1]} `;
    }
  
    if (zlote >= 100) {
      result += `${hundreds[Math.floor(zlote / 100)]} `;
      zlote %= 100;
    }
  
    if (zlote >= 20) {
      result += `${tens[Math.floor(zlote / 10)]} `;
      zlote %= 10;
    } else if (zlote >= 10) {
      result += `${teens[zlote - 10]} `;
      zlote = 0;
    }
  
    if (zlote > 0) {
      result += `${units[zlote]} `;
    }
  
    result += `złotych ${groszePart}`;
    return result.trim();
  }

export default  AddCivilContractForm;
