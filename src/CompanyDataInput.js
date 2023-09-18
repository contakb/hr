// CompanyDataInput.js
import React, { useState } from 'react';

function CompanyDataInput() {
  const [formData, setFormData] = useState({
    companyName: '',
    nip: '',
    address: '',
    taxOffice: '',
    // Add more fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to the server
    console.log(formData); // Replace with your API call to save data
  };

  return (
    <div>
      <h1>Company Data Input</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Company Name:
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </label>
        <label>
          NIP (Tax ID) Number:
          <input
            type="text"
            name="nip"
            value={formData.nip}
            onChange={handleChange}
          />
        </label>
        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <label>
          Tax Office:
          <input
            type="text"
            name="taxOffice"
            value={formData.taxOffice}
            onChange={handleChange}
          />
        </label>
        {/* Add more fields for other company data */}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default CompanyDataInput;
