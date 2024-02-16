import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountDetails from './AccountDetails';
import './Login.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // This might be kept for client-side validation
  const [username, setUsername] = useState(''); // Username will be updated later
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  
  const navigate = useNavigate(); // Define the navigate variable using the useNavigate hook

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password || password !== confirmPassword) {
      setErrorMessage('Please check your email and password. They are required, and passwords must match.');
      return;
    }

    // Note: Adjust this to use your server endpoint for registration
    // Inside your registration submission handler
axios.post('http://localhost:3001/register', { email, password })
.then(response => {
  // Assuming the registration was successful
  setSuccessMessage('Registration successful. Please check your email to verify your account.');
  // Navigate to the Account Details page and pass the email in the state
  navigate('/account-details', { state: { email } });
})
.catch(error => {
  console.error('Error registering user:', error);
  setErrorMessage(error.response?.data?.error || 'An unexpected error occurred');
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

        <button type="submit">Register</button>

        <p>Masz już konto?</p>
          <p><button type="button" onClick={() => navigate('/LoginUser')}> Log in</button></p>


      </form>
      
      
      
      {showAccountDetails && <AccountDetails email={email} />}
    </div>
  );
}

export default Login;
