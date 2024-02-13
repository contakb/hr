import React, { createContext, useContext, useState, useEffect } from 'react';



const SetupContext = createContext();
// Inside your SetupContext


export const useSetup = () => useContext(SetupContext);


export const steps = [
    { name: "Create Company", path: "/CreateCompany" },
    { name: "Add Employees", path: "/createEmployee" },
    { name: "Add Contract to Employee", path: "/add-contract/:employeeId" }, // New step
    { name: "Add Params to Employee", path: "/employee-param/:employeeId" }, // New step
    { name: "Salary Setup", path: "/salary-selection" },
];

export const SetupProvider = ({ children }) => {
  // Initialize the currentStep from local storage or default to 1 if not found
  const [currentStep, setCurrentStep] = useState(() => {
    const storedStep = localStorage.getItem('currentStep');
    return storedStep ? parseInt(storedStep, 10) : 1;
  });

  // Initialize a state to track the completion status of each step
  const [stepCompletionStatus, setStepCompletionStatus] = useState(() => {
    const storedCompletionStatus = localStorage.getItem('stepCompletionStatus');
    return storedCompletionStatus ? JSON.parse(storedCompletionStatus) : {1: false, 2: false, 3: false, 4: false, 5: false};
  });

  // Update the currentStep and stepCompletionStatus in local storage whenever they change
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep);
    localStorage.setItem('stepCompletionStatus', JSON.stringify(stepCompletionStatus));
  }, [currentStep, stepCompletionStatus]);

  const nextStep = () => {
    setCurrentStep(prevStep => Math.min(prevStep + 1, steps.length));
  };

  const previousStep = () => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
  };

  const markStepAsCompleted = stepNumber => {
    setStepCompletionStatus(prevStatus => ({
      ...prevStatus,
      [stepNumber]: true,
    }));
  };

  const isStepCompleted = stepNumber => {
    return stepCompletionStatus[stepNumber] || false;
  };

  const isSetupComplete = () => {
    return currentStep > steps.length;
  };
  const [isInSetupProcess, setIsInSetupProcess] = useState(true);


  return (
    <SetupContext.Provider value={{
      currentStep,
      setCurrentStep, 
      nextStep, 
      previousStep,
      isSetupComplete, 
      steps,
      markStepAsCompleted,
      isStepCompleted,
      isInSetupProcess, setIsInSetupProcess,
    }}>
      {children}
    </SetupContext.Provider>
  );
};
