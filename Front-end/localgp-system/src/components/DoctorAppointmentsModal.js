import React from 'react';
import './DoctorAppointmentsModal.css'; // Update the CSS import

const Modal = ({ isOpen, onClose, onSave, initialDate, initialTime }) => {
    const [date, setDate] = React.useState(initialDate);
    const [time, setTime] = React.useState(initialTime);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(date, time);
        onClose();
    };

    return (
        <div className="doctorappointmentsmodal-overlay">
            <div className="doctorappointmentsmodal-content">
                <h3>Update Appointment</h3>
                <div>
                    <label>Date:</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                    <label>Time:</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="doctorappointmentsmodal-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
