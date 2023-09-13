import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountDetails from './AccountDetails';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    // Check if any field is empty
    if (!email || !password || !confirmPassword || !username) {
      setErrorMessage('All fields are required');
      return;
    }

    // Check if password and confirmation password match
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }

    const userData = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      username: username,
    };

    axios
      .post('http://localhost:3001/check-registration', userData)
      .then((response) => {
        if (response.data === 'Email already exists') {
          setErrorMessage('Email is already taken');
        } else if (response.data === 'Username already exists') {
          setErrorMessage('Username is already taken');
        } else {
          axios
            .post('http://localhost:3001/register', userData)
            .then((response) => {
              setErrorMessage('');
              setSuccessMessage('Registration successful');
              setTimeout(() => {
                navigate(`/account/${username}`);
              }, 1000);
            })
            .catch((error) => {
              console.error('Error registering user:', error);
            });
        }
      })
      .catch((error) => {
        console.error('Error checking registration:', error);
      });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setPasswordMatchError(false);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  
  const navigate = useNavigate(); // Define the navigate variable using the useNavigate hook

  return (
    <div className="login-container">
      <h1>Register</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {passwordMatchError && <p className="error-message">Passwords do not match</p>}
      <form onSubmit={handleRegisterSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={handleEmailChange} />

        <label>Password:</label>
        <input type="password" value={password} onChange={handlePasswordChange} />

        <label>Confirm Password:</label>
        <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />

        <label>Username:</label>
        <input type="text" value={username} onChange={handleUsernameChange} />

        <button type="submit">Register</button>
      </form>
      
      {showAccountDetails && <AccountDetails email={email} />}
    </div>
  );
}

export default Login;
