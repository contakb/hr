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
      console.log('Logged in successfully:', email);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-xl font-semibold mb-4">{isPasswordRecovery ? "Reset Password" : "Login"}</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      {isPasswordRecovery ? (
        // Display password reset view
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            placeholder="Enter your new password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            onClick={() => handleNewPasswordSubmit(password)}
          >
            Reset Password
          </button>
        </div>
      ) : (
        // Display regular login form
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Log in
            </button>
            <button
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              onClick={handleResetPassword}
              type="button"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      )}
      <p>
        <button
          className="text-blue-500 hover:text-blue-800"
          type="button"
          onClick={() => navigate('/Login')}
        >
          Create Account
        </button>
      </p>
    </div>
  );
}

export default LoginUser;
