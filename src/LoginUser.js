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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);


  const handleLogin = async (event) => {
    event.preventDefault();
  
    // Attempt to log in with the provided email and password using signInWithPassword
    const { error, user } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage(error.message || 'Failed to login');
    } else {
      console.log('Logged in successfully:', user);
      navigate('/account-details', { state: { email } });// Adjust as necessary for your routing
    }
  };
  
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
  
    // Correct method to initiate password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Optional: Specify the redirect URL to which the user should be sent after clicking the reset link.
      redirectTo: `${window.location.origin}/LoginUser`
    });
  
    if (error) {
      console.error('Error sending password reset email:', error.message);
      setErrorMessage(error.message);
    } else {
      alert("Check your email for the password reset link.");
      // Optionally navigate to a different page or show a message
    }
  };
  
  
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true); // Enable password recovery view
      }
    });
  
    return () => {
      supabase.auth.updateUser();
    };
  }, []);
  

  const handleNewPasswordSubmit = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
  
    if (error) {
      console.error('Error updating password:', error.message);
      setErrorMessage("Failed to update password.");
    } else {
      alert("Your password has been updated successfully.");
      setIsPasswordRecovery(false); // Return to normal login view
      navigate('/LoginUser'); // Redirect the user to the login page
    }
  };
  

  return (
    <div>
      <h1>{isPasswordRecovery ? "Reset Password" : "Login"}</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      
      {isPasswordRecovery ? (
        // Display password reset view
        <div>
          {/* Simplified for brevity. Implement a form or input for the new password */}
          <input
            type="password"
            placeholder="Enter your new password"
            onChange={(e) => setPassword(e.target.value)} // Reuse the password state or create a new one
          />
          <button onClick={() => handleNewPasswordSubmit(password)}>Reset Password</button>
        </div>
      ) : (
        // Display regular login form
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
          <button onClick={handleResetPassword} type="button">Forgot Password?</button>
          


        </form>
        
      )}
      <p><button type="button" onClick={() => navigate('/Login')}>Create Account</button></p>
    </div>
  );
}

export default LoginUser;
