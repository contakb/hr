import React, { useState } from 'react';

function SettingsPage() {
  const initialFormData = {
    companyName: '',
    formaPrawna: 'osobaPrawna',
    taxId: '',
    pesel: '',
    address: '',
    taxOffice: '',
    bankAccount: '',
    ubezpieczenieWypadkowe: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingUbezpieczenie, setIsChangingUbezpieczenie] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsChangingUbezpieczenie(false); // Ensure the other form is closed
  };

  const handleUbezpieczenieClick = () => {
    setIsChangingUbezpieczenie(true);
    setIsEditing(false); // Ensure the other form is closed
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsChangingUbezpieczenie(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to the server
    // formData now contains all the entered details
    console.log(formData); // Replace with your API call

    // After saving, you can reset the form and exit edit mode
    setFormData(initialFormData);
    setIsEditing(false);
    setIsChangingUbezpieczenie(false);
  };

  return (
    <div>
      <h1>Company Settings</h1>
      {isChangingUbezpieczenie ? (
        <form onSubmit={handleSubmit}>
          <label>
            Ubezpieczenie Wypadkowe:
            <input
              type="text"
              name="ubezpieczenieWypadkowe"
              value={formData.ubezpieczenieWypadkowe}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Save Ubezpieczenie</button>
          <button onClick={handleCancel}>Cancel</button>
        </form>
      ) : isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Render all the company data fields for editing */}
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
            Tax ID:
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
            />
          </label>
          {formData.formaPrawna === 'osobaFizyczna' && (
            <label>
              PESEL Number:
              <input
                type="text"
                name="pesel"
                value={formData.pesel}
                onChange={handleChange}
              />
            </label>
          )}
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
          <label>
            Bank Account:
            <input
              type="text"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Save Company Data</button>
          <button onClick={handleCancel}>Cancel</button>
        </form>
      ) : (
        <div>
          {/* Display the company data */}
          {/* ... (display all company data fields here) */}
          <button onClick={handleEditClick}>Change Company Data</button>
          <button onClick={handleUbezpieczenieClick}>
            Change Ubezpieczenie Wypadkowe
          </button>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
