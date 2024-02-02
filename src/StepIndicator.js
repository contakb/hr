import React from 'react';
import { useSetup } from './SetupContext'; // Import the context hook

const StepIndicator = ({ steps }) => {
    const { currentStep } = useSetup(); // Use the currentStep from context
    console.log("Current Step in StepIndicator:", currentStep);
  
    return (
        <div className="step-indicator-container">
            {steps.map((step, index) => {
                // Determine if the step is completed, current, or upcoming
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

               

                return (
                    <div key={index} className={`step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}>
                        <div className="step-number">{stepNumber}</div>
                        <div className="step-title">{step.name}</div>
                           
                        </div>
                    
                );
            })}
        </div>
    );
};

export default StepIndicator;
