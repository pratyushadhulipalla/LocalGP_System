import React, { useState } from 'react';
import './ContactAdminPopup.css'; // Create this CSS file for styling

const ContactAdminPopup = ({ onClose, onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        onSend(message);
        setMessage('');
        onClose(); // Close the popup after sending
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Contact Admin</h2>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                ></textarea>
                <div className="popup-buttons">
                    <button onClick={handleSend}>Send</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ContactAdminPopup;
