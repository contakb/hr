import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import CreateCompanyForm from './CreateCompanyForm';
import axios from 'axios'; // Assuming you're using axios for HTTP requests

function LoginUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    console.log(supabase);
console.log(supabase.auth);


    // Attempt to log in with the provided email and password
    const { error, user } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage(error.message || 'Failed to login');
    } else {
      console.log('Logged in successfully:', user);
      navigate('/account-details'); // Adjust as necessary for your routing
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Log in</button>
      </form>
    </div>
  );
}

export default LoginUser;
