// SettingsPage.js
import React, { useState } from 'react';

function SettingsPage() {
  const [formData, setFormData] = useState({
    // Initialize form data with default values
    // Example: username, email, notifications, etc.
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
  
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to the server
    // formData now contains all the entered details
    console.log(formData); // Replace with your API call
  };
  return (
    <div>
      <h1>Company Settings</h1>
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
          Forma Prawna:
          <select
            name="formaPrawna"
            value={formData.formaPrawna}
            onChange={handleChange}
          >
            <option value="osobaPrawna">Osoba Prawna</option>
            <option value="osobaFizyczna">Osoba Fizyczna</option>
          </select>
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
          Tax ID Number:
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
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
        <label>
          Bank Account:
          <input
            type="text"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleChange}
          />
        </label>
        {/* Add more fields for other details */}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}  

export default SettingsPage;
