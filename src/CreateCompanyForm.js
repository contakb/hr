import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateCompanyForm() {
  const [companyname, setCompanyname] = useState('');
  const [address, setAddress] = useState('');
  const [taxid, setTaxID] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userid, setUserid] = useState('');

  useEffect(() => {
    // Fetch the userid from the server and set it in the state
    axios
      .get('http://localhost:3001/userid', { withCredentials: true })
      .then((response) => {
        const userid = response.data.userid;
        setUserid(userid);
      })
      .catch((error) => {
        console.error('Error fetching userid:', error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Perform create company request to the server
    axios
      .post(
        'http://localhost:3001/company',
        { companyname, address, taxid, userid },
        { withCredentials: true }
      )
      .then((response) => {
        // Handle successful company creation
        console.log('Company created successfully:', response.data);
        setSuccessMessage(response.data.message);

        // Optionally, you can display a success message or redirect to a different page
      })
      .catch((error) => {
        // Handle company creation error
        console.error('Error creating company:', error);
        setErrorMessage('Failed to create company');
      });
  };

  const handleNameChange = (event) => {
    setCompanyname(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleTaxIDChange = (event) => {
    setTaxID(event.target.value);
  };

  return (
    <div>
      <h1>Create Company</h1>
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" value={companyname} onChange={handleNameChange} />

        <label>Address:</label>
        <input type="text" value={address} onChange={handleAddressChange} />

        <label>Tax ID:</label>
        <input type="text" value={taxid} onChange={handleTaxIDChange} />

        <button type="submit">Create Company</button>
      </form>
    </div>
  );
}

export default CreateCompanyForm;
