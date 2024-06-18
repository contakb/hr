import React from 'react';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Brak dostępu</h1>
        <p className="mb-4">Nie posiadasz odpowiednich uprawnień.</p>
        <a
          href="/LoginUser"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Zaloguj się
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
