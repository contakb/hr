import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useRequireAuth } from './useRequireAuth';


function ToDo() {
    const navigate = useNavigate();
    const [showEmploySubMenu, setShowEmploySubMenu] = useState(false);
    const [showManageSubMenu, setShowManageSubMenu] = useState(false);
    const [showReportSubMenu, setShowReportSubMenu] = useState(false);
    const user = useRequireAuth();

    // If user is null, component will show a loading message or a minimal UI instead of immediately returning null
if (!user) {
    return (
      <div>Loading... If you are not redirected, <a href="/login">click here to login</a>.</div>
    );
  }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10">
  <div className="ToDo bg-white shadow-md rounded px-3 py-6 max-w-xl sm:max-w-md w-full">
    <h1 className="text-xl font-semibold mb-3 text-center">What would you like to do?</h1>
            
            {!showEmploySubMenu && !showManageSubMenu && !showReportSubMenu ? (
                <div className="space-y-4">
                    <button onClick={() => setShowEmploySubMenu(true)} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Employ a New Person</button>
                    <button onClick={() => navigate('/salary-selection')} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Przygotuj listę płac</button>
                    <button onClick={() => setShowManageSubMenu(true)} className="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Manage Existing Employees</button>
      <button onClick={() => setShowReportSubMenu(true)} className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Wygeneruj raport</button>
      {/*... other main options */}
                    {/*... other main options */}
                    </div>
            ) : null}

            {showEmploySubMenu ? (
                <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Employ a New Person</h2>
                <div className="space-y-2">
                <button onClick={() => navigate('/createEmployee')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Employee Data</button>
        <button onClick={() => navigate('/createEmployee/contract')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Contract</button>
                        {/*... other employ submenu options */}
                    </div>
                    <button onClick={() => setShowEmploySubMenu(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Back</button>
                </div>
            ) : null}

            {showManageSubMenu ? (
                <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Manage Existing Employees</h2>
                <div className="space-y-2">
        <button onClick={() => navigate('/employeeList')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Lista pracowników</button>
        <button onClick={() => navigate('/manage/view')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">View Employee Performance</button>
        {/*... other manage submenu options */}
      </div>
      <button onClick={() => setShowManageSubMenu(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Back</button>
                </div>
            ) : null}

{showReportSubMenu ? (
                <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Wygeneruj raport</h2>
      <div className="space-y-2">
        <button onClick={() => navigate('/reports')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Lista raportów</button>
        <button onClick={() => navigate('/manage/view')} className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">View Employee Performance</button>
        {/*... other report submenu options */}
      </div>
      <button onClick={() => setShowReportSubMenu(false)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Back</button>
    </div>
            ) : null}
        </div>
        </div>
    );
}

export default ToDo;
