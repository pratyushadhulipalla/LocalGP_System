import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const SuccessPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');
  const navigate = useNavigate();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage

        if (!token) {
          console.error('User is not authenticated');
          return;
        }

        await axios.post(
          '/api/prescription/update-payment-status',
          { sessionId },
          {
            headers: {
              Authorization: `Bearer ${token}` // Include the JWT token in the authorization header
            }
          }
        );
        console.log('Payment status updated successfully.');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    };

    if (sessionId) {
      updatePaymentStatus();
    }
  }, [sessionId]);

  const handleBackToPrescriptions = () => {
    navigate('/prescriptions'); // Update this path if necessary
  };

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your payment was successful. Thank you for your purchase.</p>
      <button onClick={handleBackToPrescriptions}>Back to Prescriptions</button>
    </div>
  );
};

export default SuccessPage;
