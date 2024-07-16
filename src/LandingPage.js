import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const LandingPage = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const navigate = useNavigate();
  const { user } = useUser();

  const handlePlanSelection = async (plan, billingCycle) => {
    if (!user) {
      navigate(`/signup?plan=${plan}&billingCycle=${billingCycle}`);
      return;
    }

    // For existing users, create a checkout session
    try {
      const response = await fetch('http://localhost:3001/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, billingCycle, email: user.email }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error redirecting to Stripe:', error.message);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      <header className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold">Cennik</div>
        <div>
          <Link to="/loginuser" className="text-lg hover:text-gray-400">
            Logowanie
          </Link>
        </div>
      </header>
      <main className="flex flex-col items-center py-12">
        <h1 className="text-4xl font-bold mb-4">Dostępne plany</h1>
        <p className="text-center mb-8">
          Zacznij od darmowej wersji próbnej, następnie wybierz rozszerzony wariant. Pełne pakiety zawierają.
        </p>
        <div className="flex mb-8">
          <button
            className={`px-4 py-2 rounded-l-md ${billingCycle === 'monthly' ? 'bg-gray-600' : 'bg-gray-700'}`}
            onClick={() => setBillingCycle('monthly')}
          >
             rozliczenie miesięczne
          </button>
          <button
            className={`px-4 py-2 rounded-r-md ${billingCycle === 'yearly' ? 'bg-gray-600' : 'bg-gray-700'}`}
            onClick={() => setBillingCycle('yearly')}
          >
            roczne
          </button>
        </div>
        <div className="flex justify-center space-x-8">
          <div className="bg-gray-800 p-6 rounded-lg w-64 text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4">Hobby</h3>
            <p className="mb-6">Najpotrzebniejsze funkcjonalności kadrowe</p>
            <p className="text-3xl font-bold mb-4">
              {billingCycle === 'yearly' ? '$200/year' : '$20/month'}
            </p>
            <button
              onClick={() => handlePlanSelection('hobby', billingCycle)}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Wybierz
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg w-64 text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4">Firma</h3>
            <p className="mb-6">Wszystko co potrzebujesz do prowadzenia spraw pracowniczych</p>
            <p className="text-3xl font-bold mb-4">
              {billingCycle === 'yearly' ? '$500/year' : '$50/month'}
            </p>
            <button
              onClick={() => handlePlanSelection('freelancer', billingCycle)}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Wybierz
            </button>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg w-64 text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="mb-6">Wszystkie dostępne funkcjonalności</p>
            <p className="text-3xl font-bold mb-4">
              {billingCycle === 'yearly' ? '$1000/year' : '$100/month'}
            </p>
            <button
              onClick={() => handlePlanSelection('startup', billingCycle)}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Wybierz
            </button>
          </div>
        </div>
        <div className="mt-8">
          <Link
            to="/signup?plan=free"
            className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            Zacznij pracę z darmową wersj próbną
          </Link>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6 mb-8">
            <img src="https://via.placeholder.com/50" alt="Company Logo" className="h-12" />
            <div>
              <h4 className="text-lg font-semibold">Zaufali nam</h4>
              <div className="flex space-x-4">
                <img src="https://via.placeholder.com/50" alt="Next.js" className="h-8" />
                <img src="https://via.placeholder.com/50" alt="Vercel" className="h-8" />
                <img src="https://via.placeholder.com/50" alt="Stripe" className="h-8" />
                <img src="https://via.placeholder.com/50" alt="Supabase" className="h-8" />
                <img src="https://via.placeholder.com/50" alt="GitHub" className="h-8" />
              </div>
            </div>
          </div>
          <hr className="border-gray-600 mb-8" />
          <div className="flex justify-between text-sm">
            <div>
              <h5 className="font-semibold">ACME</h5>
              <ul>
                <li className="my-2"><Link to="#" className="hover:underline">Home</Link></li>
                <li className="my-2"><Link to="#" className="hover:underline">O nas</Link></li>
                <li className="my-2"><Link to="#" className="hover:underline">Kariera</Link></li>
                <li className="my-2"><Link to="#" className="hover:underline">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold">LEGAL</h5>
              <ul>
                <li className="my-2"><Link to="#" className="hover:underline">Polityka prywatności</Link></li>
                <li className="my-2"><Link to="#" className="hover:underline">Warunki użytkowania</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center mt-8">
            <p>© 2024 wszelkie prawa zastrzeżone.</p>
            <div className="flex space-x-4">
              <Link to="#"><img src="https://via.placeholder.com/20" alt="GitHub" className="h-6" /></Link>
              <p>Stworzone przez <a href="https://vercel.com" className="underline">HR</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
