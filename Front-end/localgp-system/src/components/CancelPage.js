import React from 'react';
import {  useNavigate } from 'react-router-dom';


const CancelPage = () => {
    const navigate = useNavigate();


    const handleBackToPrescriptions = () => {
        navigate('/prescriptions'); // Update this path if necessary
      };
    
    return (
        <div>
            <h2>Payment Canceled</h2>
            <p>Your payment was canceled. Please try again.</p>
            <button onClick={handleBackToPrescriptions}>Back to Prescriptions</button>
        </div>
    );
};

export default CancelPage;
