require('dotenv').config();

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); 
console.log('REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('REACT_APP_STRIPE_PUBLISHABLE_KEY is not defined');
}

console.log('All environment variables are loaded correctly.');
