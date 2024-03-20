import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AccountDetails from './AccountDetails';
import { toast } from 'react-toastify';
import { supabase } from './supabaseClient';


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

    try {
        const { user: signUpUser, error: signUpError } = await supabase.auth.signUp({ email, password });

        if (signUpError) {
            console.error('Sign up error:', signUpError.message);
            setErrorMessage(signUpError.message);
            return;
        }

        // Fetch the current session after signup to get the active user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Error retrieving session:', sessionError.message);
            setErrorMessage(sessionError.message);
            return;
        }

        const user = session?.user ?? signUpUser;

        if (user) {
            const schemaName = `schema_${user.email.replace(/[@\.]/g, '_')}`;

            // Ensure you have the correct function name here
            const { error: cloneError } = await supabase.rpc('clone_schema_for_user', { email: user.email });

            if (cloneError) {
                console.error('Error cloning schema:', cloneError.message);
                setErrorMessage('Error cloning schema');
                return;
            }

            console.log(`Schema ${schemaName} created and structure cloned successfully`);
            navigate('/account-details', { state: { email: user.email } });
        } else {
            console.error('User object is undefined after sign up');
            setErrorMessage('User object is undefined after sign up');
        }
    } catch (error) {
        console.error('Error during registration or login:', error);
        setErrorMessage('An unexpected error occurred');
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-md w-full space-y-8">
    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Register</h1>
    {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
    {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
    {passwordMatchError && <p className="text-red-500 text-center">Passwords do not match</p>}
    <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">Email:</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={email} onChange={handleEmailChange} placeholder="Email" />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password:</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={password} onChange={handlePasswordChange} placeholder="Password" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="sr-only">Confirm Password:</label>
          <input id="confirm-password" name="confirm-password" type="password" autoComplete="off" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={confirmPassword} onChange={handleConfirmPasswordChange} placeholder="Confirm Password" />
        </div>
      </div>

      <div>
        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Register
        </button>
      </div>

      <div className="text-sm text-center">
        <p>Masz już konto?</p>
        <button type="button" onClick={() => navigate('/LoginUser')} className="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </button>
      </div>
    </form>

    {showAccountDetails && (
  <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
    <AccountDetails email={email} />
  </div>
)}
  </div>
</div>

      
      
      
     
  );
}

export default Login;
