import React, { useState, useEffect } from 'react';
import axios from 'axios';
import  {jwtDecode}  from 'jwt-decode';
import './DoctorAppointments.css';
import { useNavigate } from 'react-router-dom';
import DoctorAppointmentsModal from './DoctorAppointmentsModal'; 

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorId, setDoctorId] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pastAppointments, setPastAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const id = parseInt(decodedToken.doctorId, 10);
            if (!isNaN(id)) {
                setDoctorId(id);
            } else {
                console.error('Invalid doctor ID');
            }
        }
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchAppointments();
            fetchPastAppointments();
        }
    }, [doctorId]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`/api/appointments/doctor/${doctorId}/appointments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    };

    const fetchPastAppointments = async () => {
        try {
            const response = await axios.get(`/api/appointments/doctor/${doctorId}/past-appointments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPastAppointments(response.data);
        } catch (error) {
            console.error('Failed to fetch past appointments', error);
        }
    };

    const handleCancelAppointment = async (id) => {
        try {
            await axios.delete(`/api/appointments/cancel/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment', error);
        }
    };

    const handleUpdateAppointment = async (id, updatedDate, updatedTime) => {
        try {
              // Ensure the time is in HH:mm:ss format
        let formattedTime = updatedTime;
        if (updatedTime.length === 5) {
            formattedTime = `${updatedTime}:00`; // Append seconds if they are missing
        }
    
            const updatedAppointment = {
                date: updatedDate,  // 'YYYY-MM-DD' format
                time: formattedTime  // 'HH:mm:ss' format
            };
    
            console.log('Sending updated appointment:', updatedAppointment);
    
            await axios.put(`/api/appointments/update/${id}`, updatedAppointment, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Appointment updated successfully');
            fetchAppointments(); // Refresh the list of appointments
        } catch (error) {
            console.error('Failed to update appointment', error);
        }
    };
    
    
    

    const openModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const saveAppointment = (date, time) => {
        if (selectedAppointment) {
            handleUpdateAppointment(selectedAppointment.id, date, time);
            closeModal(); // Close the modal after saving
        }
    };

    if (doctorId === null) {
        return <div>Loading...</div>;
    }

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    return (
        <div className='DoctorAppointments_container'>
            <div className="patient-navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>
                    An Automated System for Local GPs
                </div>
                <div className="patient-nav-links">
                    <button onClick={handleAboutUsClick}>About Us</button>
                    <button onClick={handleContactClick}>Contact</button>
                </div>
            </div>
            <div>
            <h2>My Upcoming Appointments</h2>
            <div className='Doctorappointments-list'>
            <ul>
                {appointments.map(appointment => (
                    <fieldset>
                    <li className='align' key={appointment.id}>
                        <div>
                            <strong>Date:</strong> {appointment.date}<br />
                            <strong>Time:</strong> {appointment.time}<br />
                            <strong>Reason:</strong> {appointment.reason}<br />
                            <strong>Patient:</strong> {appointment.patientName}<br />
                        </div>
                        <div className="actions">
                            <button onClick={() => handleCancelAppointment(appointment.id)}>Cancel</button>
                            <button onClick={() => openModal(appointment)}>Update</button>
                        </div>
                    </li>
                </fieldset>
                ))}
            </ul>
            
            </div>
            <h2>Past Appointments</h2>
                <div className='Doctorappointments-list'>
                    {pastAppointments.length > 0 ? (
                        <ul>
                            {pastAppointments.map(appointment => (
                                <fieldset key={appointment.id}>
                                    <li className='align'>
                                        <div>
                                            <strong>Date:</strong> {appointment.date}<br />
                                            <strong>Time:</strong> {appointment.time}<br />
                                            <strong>Reason:</strong> {appointment.reason}<br />
                                            <strong>Patient:</strong> {appointment.patientName}<br />
                                            {appointment.feedback && (
                                                <>
                                                    <strong>Feedback:</strong><br />
                                                    <span>Rating: {'★'.repeat(appointment.feedback.rating)}{'☆'.repeat(5 - appointment.feedback.rating)}</span><br />
                                                    <span>Comment: {appointment.feedback.feedbackText}</span>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                </fieldset>
                            ))}
                        </ul>
                    ) : (
                        <p>No past appointments found.</p>
                    )}
                </div>



            {isModalOpen && selectedAppointment && (
                <DoctorAppointmentsModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={saveAppointment}
                    initialDate={selectedAppointment.date}
                    initialTime={selectedAppointment.time}
                />
            )}
        </div>
       
        </div>
       
    );
};

export default DoctorAppointments;
