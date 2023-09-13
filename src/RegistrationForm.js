import React, { useState } from 'react';
import AccountDetails from './AccountDetails';

function RegistrationForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform registration logic here
    // ...
    // Once registration is successful, set the email state
    setEmail('user@example.com');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {email && <AccountDetails email={email} />}
    </div>
  );
}

export default RegistrationForm;
