import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Prescriptions = () => {
    const navigate = useNavigate();

    const handlePaymentsClick = () => {
        navigate('/patient/payments');
    };

    return (

 <div className="patient-section">
                    {/* <h2>Payments</h2> */}
                    <button onClick={handlePaymentsClick}>View Payments</button>
                </div>
    );
}

export default Prescriptions;



