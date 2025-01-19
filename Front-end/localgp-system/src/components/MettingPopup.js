import React from 'react';
import './MeetingPopup.css';

const MeetingPopup = ({ show, onClose, meetingDetails }) => {
    if (!show) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Meeting Details</h2>
                <p><strong>Date:</strong> {meetingDetails.date}</p>
                <p><strong>Time:</strong> {meetingDetails.time}</p>
                <p><strong>Doctor:</strong> Dr. {meetingDetails.doctorName}</p>
                <p><strong>Reason:</strong> {meetingDetails.reason}</p>
                <p><strong>Link:</strong> <a href={meetingDetails.link} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default MeetingPopup;
