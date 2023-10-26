import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';


function ToDo() {
    const navigate = useNavigate();
    const [showEmploySubMenu, setShowEmploySubMenu] = useState(false);
    const [showManageSubMenu, setShowManageSubMenu] = useState(false);

    return (
        <div className="ToDo">
            <h1>What would you like to do?</h1>
            
            {!showEmploySubMenu && !showManageSubMenu ? (
                <ul>
                    <li><button onClick={() => setShowEmploySubMenu(true)}>Employ a New Person</button></li>
                    <li><button onClick={() => navigate('/terminate')}>Terminate an Employee's Contract</button></li>
                    <li><button onClick={() => setShowManageSubMenu(true)}>Manage Existing Employees</button></li>
                    {/*... other main options */}
                </ul>
            ) : null}

            {showEmploySubMenu ? (
                <div>
                    <h2>Employ a New Person</h2>
                    <ul>
                        <li><button onClick={() => navigate('/createEmployee')}>Create Employee Data</button></li>
                        <li><button onClick={() => navigate('/createEmployee/contract')}>Create Contract</button></li>
                        {/*... other employ submenu options */}
                    </ul>
                    <button onClick={() => setShowEmploySubMenu(false)}>Back</button>
                </div>
            ) : null}

            {showManageSubMenu ? (
                <div>
                    <h2>Manage Existing Employees</h2>
                    <ul>
                        <li><button onClick={() => navigate('/manage/update')}>Update Employee Details</button></li>
                        <li><button onClick={() => navigate('/manage/view')}>View Employee Performance</button></li>
                        {/*... other manage submenu options */}
                    </ul>
                    <button onClick={() => setShowManageSubMenu(false)}>Back</button>
                </div>
            ) : null}
        </div>
    );
}

export default ToDo;
