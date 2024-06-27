import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        navigate('/account-details', { state: { email: session.user.email } });
      } else {
        console.error('User session not found', error);
      }
    };

    getUserSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Payment Successful</h2>
          <p className="mt-2 text-white">Redirecting to your account...</p>
        </div>
      </div>
    </div>
  );
};

export default Success;
