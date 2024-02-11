// SetupContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const SetupContext = createContext();

export const useSetup = () => useContext(SetupContext);
export const steps = [
    { name: "Create Company", path: "/CreateCompany" },
    { name: "Add Employees", path: "/createEmployee" },
    { name: "Salary Setup", path: "/salary-selection" },
];

export const SetupProvider = ({ children }) => {
  // Initialize the currentStep from local storage or default to 1 if not found
  const [currentStep, setCurrentStep] = useState(() => {
    const storedStep = localStorage.getItem('currentStep');
    return storedStep ? parseInt(storedStep, 10) : 1;
  });

  // Update the currentStep in local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep);
  }, [currentStep]);

  const nextStep = () => {
    setCurrentStep((prevStep) => {
      const nextStep = prevStep + 1;
      // Optionally, update local storage here as well, but useEffect will handle it
      return nextStep;
    });
  };

  const isSetupComplete = () => currentStep >= steps.length; // Use steps.length for dynamic step count

  return (
    <SetupContext.Provider value={{ currentStep, nextStep, isSetupComplete, steps }}>
      {children}
    </SetupContext.Provider>
  );
};
