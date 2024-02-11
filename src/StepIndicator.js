import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { useSetup } from './SetupContext'; // Import the context hook

const StepIndicator = ({ steps }) => {
    const { currentStep } = useSetup(); // Use the currentStep from context
    const navigate = useNavigate(); // Hook for navigation

    const navigateToStep = (path, stepNumber) => {
        // Optional: You might want to allow navigation only to completed steps or the current step
        // This check can be adjusted based on your application's requirements
        if (stepNumber <= currentStep) {
            navigate(path);
        }
    };

    return (
        <div className="step-indicator-container">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                // Add a click handler to each step
                // Apply cursor style through className or inline styles for better UX
                return (
                    <div 
                        key={index} 
                        className={`step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`} 
                        onClick={() => navigateToStep(step.path, stepNumber)}
                        style={{ cursor: 'pointer' }} // Makes it visually clear that the item is clickable
                    >
                        <div className="step-number">{stepNumber}</div>
                        <div className="step-title">{step.name}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;
