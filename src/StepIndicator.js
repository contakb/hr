import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { useSetup } from './SetupContext'; // Import the context hook

const StepIndicator = ({ steps }) => {
    const navigate = useNavigate();
    const { currentStep, isStepCompleted } = useSetup(); // Assuming your context provides isStepCompleted

    const navigateToStep = (path, stepNumber) => {
        if (stepNumber <= currentStep) {
            navigate(path);
        }
    };

    return (
        <div className="step-indicator-container">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = isStepCompleted(stepNumber); // Check if the step is marked as completed
                const isCurrent = stepNumber === currentStep;

                return (
                    <div 
                        key={index} 
                        className={`step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}
                        onClick={() => navigateToStep(step.path, stepNumber)}
                        style={{ cursor: 'pointer' }}>
                        <div className="step-number">{isCompleted ? '✔' : stepNumber}</div>
                        <div className="step-title">{step.name}</div>
                    </div>
                );
            })}
        </div>
    );
};


export default StepIndicator;
