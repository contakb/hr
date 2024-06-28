import React from 'react';
import { Link } from 'react-router-dom';

const TrialEnded = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Your trial has ended</h1>
      <p className="mb-6">To continue using our services, please choose a plan.</p>
      <Link to="/landingpage" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300">
        Choose a Plan
      </Link>
    </div>
  );
};

export default TrialEnded;
