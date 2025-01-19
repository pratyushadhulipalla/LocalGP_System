import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientPage.css';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import ContactAdminPopup from './ContactAdminPopup'; 
import PatientChat from './PatientChat'; 




const PatientPage = () => {
    const [patientName, setPatientName] = useState('');
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
  
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch patient details
        const fetchPatientDetails = async () => {
            try {
                const response = await axios.get('/api/patient/Patientdetails', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Fetched details:', response.data);
                setPatientName(`${response.data.firstName} ${response.data.lastName}`);
            } catch (error) {
                console.error('Failed to fetch patient details', error);
            }
        };

        // Fetch upcoming appointments
        const fetchUpcomingAppointments = async () => {
            try {
                const response = await axios.get('/api/patient/upcoming-appointments', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Upcoming appointments response:', response.data); // Debugging
                setUpcomingAppointments(response.data);
            } catch (error) {
                console.error('Failed to fetch upcoming appointments', error);
            }
        };

      
          

        fetchPatientDetails();
        fetchUpcomingAppointments();
    }, []);

    
       

    const handleViewDetails = () => {
        navigate("/patient/details", {
            state: { role: 'Patient' }
        });
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handlePatientAppointmentsClick = () => {
        navigate('/patient/appointments');
    };

    const handleMedicalRecordsClick = () => {
        navigate('/patient/medical-records');
    };

    const handlePrescriptionsClick = () => {
        navigate('/patient/prescriptions');
    };



    const handleHealthTipsClick = () => {
        navigate('/patient/health-tips');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }

    const handleContactAdminClick = () => {
        setIsContactPopupOpen(true);
        setIsDropdownOpen(false); 
    };


    const handleSendMessageToAdmin = async (message) => {
        try {
            const senderName = patientName;
            await axios.post('/api/patient/contact-admin', { message, senderName }, {
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
    const toggleChatWindow = () => {
        setIsChatOpen(!isChatOpen);
    };


    
    

    return (
        <div className="patient-container">
            <div className="patient-navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>
                    An Automated System for Local GPs
                </div>
                <div className="patient-nav-links">
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
            <div className="welcome-section">
                <div className='Patinet-Carousel-container'>

            <Carousel
                    showArrows={false}
                    infiniteLoop={true}
                    showThumbs={false}
                    showStatus={false}
                    autoPlay={true}
                    interval={2000}
                    transitionTime={500}
                    showIndicators={false}
                    
                >
                    <div>
                        <img src="patientpageimage3.jpg" alt="Image 4" />
                        
                    </div>
                   
                    <div>
                        <img src="/hospitalmanagement.png" alt="Image 1" />
                        
                    </div>

                     <div>
                        <img src="patientpageimage4.jpg" alt="Image 3" />
                        
                    </div>
                   
                    <div>
                        <img src="/pateintpageimage5.jpg" alt="Image 5" />
                        
                    </div>
                    
                </Carousel>
                </div>
                <div className='overlay-text'>        
                <div className='welcome-message'>
                    <h2>Hello, {patientName}</h2>
                    <p>Welcome to localGP, Thank you for choosing our services.</p>
                </div>

                <div className="upcoming-appointments">
                    <img src='/calendar.png' alt='img' />
                    <h3>Upcoming Appointments</h3>
                    <fieldset>
                    <ol>
                        {upcomingAppointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.date} - {appointment.time} with {appointment.doctorName}
                            </li>
                        ))}
                    </ol>
                    </fieldset>
                </div>
                </div>

            </div>
            <div className="patient-content">

                
                    <div className="patient-section">
                        <img src='/doctor-appointment.png' alt='img' />
                        {/* <h2>Book Appointments</h2> */}
                        <button onClick={handlePatientAppointmentsClick}>Appointments</button>
                    </div>
                    <div className="patient-section">
                        <img src='/medicalrecords.png' alt='img' />
                        {/* <h2>Medical Records</h2> */}
                        <button onClick={handleMedicalRecordsClick}>Medical Records</button>
                    </div>
                
                    <div className="patient-section">
                        <img src='/prescription.png' alt='img' />
                        {/* <h2>Prescriptions</h2> */}
                        <button onClick={handlePrescriptionsClick}>Prescriptions</button>
                    </div>

                    <div className="patient-section">
                        <img src='/healthtips.png' alt='img' />
                        {/* <h2>Health Tips & Articles</h2> */}
                        <button onClick={handleHealthTipsClick}>Health Tips</button>
                    
                </div>
            </div>

             {/* Floating Chat Icon */}
             <div className="patient-chat-icon-container" onClick={toggleChatWindow}>
                <img src='/chaticon.png' alt="Chat" className="chat-icon" />
               
            </div>

            {/* Chat Window */}
            {isChatOpen && (
                <div className="user-chat-window">
                    <button className="close-chat-btn" onClick={toggleChatWindow}>X</button>
                    <PatientChat />
                </div>
            )}
            {isContactPopupOpen && (
                <ContactAdminPopup
                    onClose={() => setIsContactPopupOpen(false)}
                    onSend={handleSendMessageToAdmin}
                />
            )}
        </div>

    );
};

export default PatientPage;
