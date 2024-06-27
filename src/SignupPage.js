import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_live_51PWCkCC24aqQf542gaveEHeqLSBQ724b0jzLDCs9nGsurKvRp2sHvWepk7waJmeX5e0xSiZtCzxzV39brkyBC7TW00PM67gLmm');

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const plan = new URLSearchParams(location.search).get('plan') || 'free';
    const billingCycle = new URLSearchParams(location.search).get('billingCycle') || 'yearly';
  
    const handleRegisterSubmit = async (event) => {
      event.preventDefault();
  
      if (!email || !password || password !== confirmPassword) {
        setErrorMessage('Please check your email and password. They are required, and passwords must match.');
        return;
      }
  
      try {
        if (plan === 'free') {
          // Create user in Supabase for free plan
          const { user: signUpUser, error: signUpError } = await supabase.auth.signUp({ email, password });
  
          if (signUpError) {
            setErrorMessage(signUpError.message);
            return;
          }
  
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            setErrorMessage(sessionError.message);
            return;
          }
  
          const user = session?.user ?? signUpUser;
  
          if (user) {
            const { error: cloneError } = await supabase.rpc('clone_schema_for_user', { email: user.email });
  
            if (cloneError) {
              setErrorMessage('Error cloning schema');
              return;
            }
  
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14); // Set trial period to 14 days
  
            // Add the user data to the user_details table in the public schema
            const { error: userTableError } = await supabase
              .from('user_details')
              .insert([
                {
                  user_id: user.id,
                  user_email: user.email,
                  role: 'admin',
                  schema_name: `schema_${user.email.replace(/[@\.]/g, '_')}`,
                  plan_type: 'free',
                  trial_status: true,
                  trial_end_date: trialEndDate.toISOString().split('T')[0] // Format date as YYYY-MM-DD
                }
              ]);
  
            if (userTableError) {
              console.error('Error inserting into user_details:', userTableError.message);
              setErrorMessage('Error inserting into user details');
              return;
            }
  
            console.log(`Schema for ${user.email} created successfully`);
            navigate('/account-details', { state: { email: user.email } });
          } else {
            setErrorMessage('User object is undefined after sign up');
          }
        } else {
          // Create checkout session for paid plan
          const response = await fetch('http://localhost:3001/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan, billingCycle, email, password }),
          });
  
          const { sessionId } = await response.json();
  
          // Redirect to Stripe Checkout
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({ sessionId });
  
          if (error) {
            setErrorMessage(error.message);
          }
        }
      } catch (error) {
        setErrorMessage('An unexpected error occurred');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <img className="mx-auto h-12 w-auto" src="https://via.placeholder.com/50" alt="Logo" />
            <h2 className="mt-6 text-3xl font-extrabold text-white">Sign Up</h2>
          </div>
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email:</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password:</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password:</label>
                <input id="confirm-password" name="confirm-password" type="password" autoComplete="off" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
              </div>
            </div>
  
            <div>
              <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Register {plan !== 'free' && 'and Pay'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center text-white">
            <p>Already have an account?</p>
            <button type="button" onClick={() => navigate('/LoginUser')} className="font-medium text-indigo-400 hover:text-indigo-300">
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default SignupPage;