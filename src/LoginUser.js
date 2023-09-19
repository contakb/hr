import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import AccountDetails from './AccountDetails';

function LoginUser() {
  const [identifier, setIdentifier] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { username } = useParams();

  const handleLogin = (event) => {
    event.preventDefault();
  
    // Perform login request to the server
    axios
      .get('http://localhost:3001/loginUser', {
        params: { usernameOrEmail: identifier, rememberMe },
      })
      .then((response) => {
        // Handle successful login
        console.log('Logged in successfully:', response.data);
  
        // Log the entire response received from the server
        console.log('Server Response:', response);
  
        // Redirect to account details page with user data
        // In LoginUser.js after successful login
const userData = response.data;
navigate(`/account/${userData.storedUsername}`, { state: userData });

      })
      .catch((error) => {
        // Handle login error
        console.error('Error logging in:', error);
        setErrorMessage('Invalid username or email');
      });
  };
  

  const handleIdentifierChange = (event) => {
    setIdentifier(event.target.value);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  return (
    <div>
      <h1>Login</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <label>Username or Email:</label>
        <input type="text" value={identifier} onChange={handleIdentifierChange} />

        <label>
          Remember me:
          <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} />
        </label>

        <button type="submit">Log in</button>
      </form>
    </div>
  );
}

export default LoginUser;
