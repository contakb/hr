import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SetupPage = () => {
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
    axios.get('http://localhost:3001/api/created_company')
      .then(response => {
        setCompanyData(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching company data:', error);
        setError('Failed to fetch company data.');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!companyData) {
    return <p>No company data found.</p>;
  }

  return (
    <div>
      <h2>Company Information</h2>
      {/* Display company data */}
      <p>Company Name: {companyData.company_name}</p>
      <p>street: {companyData.street}</p>
      <p>number: {companyData.number}</p>
      {/* ... */}
    </div>
  );
};

export default SetupPage;
