import React from 'react';
import { Link } from 'react-router-dom';

function NavigationPage() {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold underline mb-4">Navigation Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/employeeList">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Employees
          </button>
        </Link>
        <Link to="/salary-list">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Salaries
          </button>
        </Link>
        <Link to="/reports">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Reports
          </button>
        </Link>
        <Link to="/account-details">
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Account
          </button>
        </Link>
        <Link to="/ToDo">
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            ToDo
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NavigationPage;
