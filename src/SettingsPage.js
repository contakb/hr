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
  };

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        {/* Add more form fields */}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default SettingsPage;
