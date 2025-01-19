import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/auth/forgot-password', { email });
            alert('Password reset link has been sent to your email.');
        } catch (error) {
            console.error("Error sending password reset email", error);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Forgot Password</h2>
                <form onSubmit={handleForgotPassword}>
                    <div>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="button-group">
                        <button type="submit">Send Reset Link</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
