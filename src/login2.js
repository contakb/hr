import React, { useState } from 'react';
import AccountDetails from './AccountDetails';

function Login() {
  const [email, setEmail] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <div>
      <h1>Login</h1>
      <label>Email:</label>
      <input type="email" value={email} onChange={handleEmailChange} />
      <button>Submit</button>
      {email && <AccountDetails email={email} />}
    </div>
  );
}

export default Login2;
