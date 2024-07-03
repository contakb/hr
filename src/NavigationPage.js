import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './UserContext';

function NavigationPage() {
  const { user } = useUser();

  return (
    <div className="p-5 bg-gray-900 text-white flex flex-col">
      <div className="flex flex-wrap justify-center gap-4 ">
        <Link to="/employeeList">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Pracownicy
          </button>
        </Link>
        <Link to="/salary-list">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Wynagrodzenia
          </button>
        </Link>
        <Link to="/reports">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Raporty
          </button>
        </Link>
        {user && user.role === 'employee' ? (
          <Link to="/employee-account">
            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              Konto
            </button>
          </Link>
        ) : (
          <Link to="/account-details">
            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              Konto
            </button>
          </Link>
        )}
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
