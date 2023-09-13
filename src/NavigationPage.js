// NavigationPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NavigationPage() {
  return (
    <div className="navigation-container">
      <h1>Navigation Page</h1>
      <div className="navigation-buttons">
        <Link to="/employeeList">
          <button>Employees</button>
        </Link>
        <Link to="/salary-list">
          <button>Salaries</button>
        </Link>
        <Link to="/reports">
          <button>Reports</button>
        </Link>
        <Link to="/settings">
          <button>Settings</button>
        </Link>
      </div>
    </div>
  );
}

export default NavigationPage;
