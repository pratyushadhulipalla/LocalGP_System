import { loadStripe } from '@stripe/stripe-js';

// Replace 'YOUR_PUBLISHABLE_KEY' with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51Pkl80Rx8qpDAPwIC8P0jbW9Kw3mVOuLxra55Q2f21SFuhc0kbuZ8woHjGKtLQuT02R0BWbOKWVIZFfpTOmRaf1J00QBkoIRsV');

export default stripePromise;
