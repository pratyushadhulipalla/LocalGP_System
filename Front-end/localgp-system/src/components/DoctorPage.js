import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorPage.css';
import DoctorCalendar from './DoctorCalendar';
import ContactAdminPopup from './ContactAdminPopup';

import { createRoutesFromChildren, useNavigate } from 'react-router-dom';

const DoctorPage = () => {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    
    
    const [editMode, setEditMode] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                const response = await axios.get('/api/doctor/details', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Doctor details:', response.data);
                const doctor = response.data;
                setDoctorName(`Dr. ${doctor.firstName} ${doctor.lastName}`);
                // setAvailability(doctor.availability || []);
                
            } catch (error) {
                console.error('Error fetching doctor details:', error);


                
            }
        };

        const fetchUpcomingAppointments = async () => {
            try {
                const response = await axios.get('/api/doctor/upcoming-appointments', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUpcomingAppointments(response.data);
            } catch (error) {
                console.error('Error fetching upcoming appointments:', error);
            }
        };

        fetchDoctorDetails();
        fetchUpcomingAppointments();
    }, []);

   

    const handleViewDetails = () => {
        navigate('/doctor/details', { state: { role: 'Doctor' } });
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    const handleAppointmentsClick = () => {
        navigate('/doctor/appointments');
    };

    const handlePrescriptionsClick = () => {
        navigate('/doctor/prescriptions');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


    const handleContactAdminClick = () => {
        setIsContactPopupOpen(true);
        setIsDropdownOpen(false); // Close the dropdown
    };

    const handleSendMessageToAdmin = async (message) => {
        try {
            const senderName = doctorName; 
            await axios.post('/api/doctor/contact-admin', { message, senderName }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Message sent to admin successfully!');
        } catch (error) {
            console.error('Error sending message to admin:', error);
            alert('Failed to send message to admin.');
        }
    };


    return (
        <div className="doctor_container">
            <div className="doctor_navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>
                    An Automated System for Local GPs
                </div>
                <div className="doctor_nav-links">
                    <button onClick={handleAboutUsClick}>About Us</button>
                    <button onClick={handleContactClick}>Contact</button>
                    <div className="dropdown">
                        <img
                            src='/userprofile.png'
                            alt='profile'
                            onClick={toggleDropdown}
                            className="dropdown-icon"
                        />
                        {isDropdownOpen && (
                            <div className="dropdown-content">
                                <button onClick={handleViewDetails}>View/Edit Details</button>
                                <button onClick={handleContactAdminClick}>Contact Admin</button>
                                <button onClick={handleLogoutClick}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="doctor_welcome">
                <div className='doctor_profile'>
                    <h1>Welcome, {doctorName}</h1>
                    <p>Thank you for your dedicated services to LocalGP.</p>
                    <p>We appreciate your hard work and commitment to patient care.</p>
                </div>
                <div className='doctor_cards'>
                    <div className="doctor_cardap" onClick={handleAppointmentsClick}>
                        <div><img src='/appointmentcontent.png' alt='img' /></div>
                        <h2>Manage Appointments</h2>
                    </div>
                    <div className="doctor_cardap" onClick={handlePrescriptionsClick}>
                        <div><img src='/prescriptionicon.png' alt='img' /></div>
                        <h2>Prescriptions</h2>
                    </div>
                </div>
            </div>

            <div className='doctor_content'>
                <div className="doctor_upcoming-appointments">
                    <div className="doctor_appointments">
                        <h2>Upcoming Appointments</h2>
                        <img src='/appointmentsDR.png' alt='img' />
                    </div>
                    <div className='doctor_upcomingappointments'>
                        {upcomingAppointments.length === 0 ? (
                            <p>No upcoming appointments</p>
                        ) : (
                            <fieldset>
                            <ol>
                                {upcomingAppointments.map((appointment) => (
                                    <li key={appointment.id}>
                                        {appointment.date} {appointment.time} - {appointment.patientName}
                                    </li>
                                ))}
                            </ol>
                            </fieldset>
                        )}
                    </div>
                </div>
                
                <div className="doctor_content">
                <DoctorCalendar />
            </div>
                
                
                </div>
                {isContactPopupOpen && (
                <ContactAdminPopup
                    onClose={() => setIsContactPopupOpen(false)}
                    onSend={handleSendMessageToAdmin}
                />
            )}
            </div>
        );
    };
    
    export default DoctorPage;
    
