import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientAppointments.css';
import { useNavigate } from 'react-router-dom';
import ReadOnlyDoctorCalendar from './ReadOnlyDoctorCalendar'; 


const PatientAppointments = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [availability, setAvailability] = useState([]);
    const [patientId, setPatientId] = useState(1); // Replace with actual patient ID
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [appointmentMode, setAppointmentMode] = useState('face-to-face');
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState({});



    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
    }, []);

    useEffect(() => {
        if (selectedDoctor) {
            fetchDoctorAvailability(selectedDoctor);
            fetchBookedSlots(selectedDoctor);
        }
    }, [selectedDoctor, date]);

    useEffect(() => {
        if (date && selectedDoctor) {
            const times = getAvailableTimes();
            setAvailableTimes(times);
            if (times.length === 0) {
                setMessage("This date is not available, please check available days below.");
            } else {
                setMessage('');
            }
        }
    }, [date, bookedSlots, availability]);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/api/appointments/doctors', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error('Failed to fetch doctors', error);
        }
    };

    const fetchDoctorAvailability = async (doctorId) => {
        try {
            const response = await axios.get(`/api/appointments/doctor/${doctorId}/availability`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAvailability(response.data);
        } catch (error) {
            console.error('Failed to fetch doctor availability', error);
        }
    };

    const fetchBookedSlots = async (doctorId) => {
        try {
            if (date) {
                const response = await axios.get(`/api/appointments/doctor/${doctorId}/booked-slots?date=${date}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setBookedSlots(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch booked slots', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.patientId) {
                console.error('Patient ID not found in stored user data');
                return;
            }
            const patientId = user.patientId; // Retrieve the patientId from the stored user data
            console.log("Patient id", patientId);

            const response = await axios.get(`/api/appointments/patient/${patientId}/appointments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    };

    const bookAppointment = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.patientId) {
                console.error('Patient ID not found in stored user data');
                return;
            }
            const patientId = user.patientId; // Retrieve the patientId from the stored user data
            console.log("Patient id", patientId);
    
            const localDateTime = new Date(`${date}T${time}`);
            const utcDate = localDateTime.toISOString().split('T')[0];// Date part in ISO format
            const utcTime = localDateTime.toTimeString().split(' ')[0];// Time part in HH:mm:ss format
            console.log(utcDate, utcTime);
    
            const appointment = {
                doctorId: parseInt(selectedDoctor, 10),
                patientId: patientId,
                date: utcDate,
                time: utcTime, // Send the time as HH:mm:ss
                reason,
                otherReason,
                symptoms,
                status: 'Booked',
                mode: appointmentMode
            };
    
            if (editingAppointmentId) {
                // Update existing appointment
                await axios.put(`/api/appointments/patient/update/${editingAppointmentId}`, appointment, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Appointment updated successfully');
            } else {
                // Book a new appointment
                await axios.post('/api/appointments/book', appointment, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                alert('Appointment booked successfully');
            }
    
            setEditingAppointmentId(null); // Clear editing state
            setMessage('');
            fetchBookedSlots(selectedDoctor);
            fetchAppointments(); // Refresh the list of appointments
        } catch (error) {
            console.error('Failed to book/update appointment', error);
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Failed to book/update appointment");
            }
        }
    };
    
    const getAvailableTimes = () => {
        if (!date || !availability.length) return [];
        const selectedDay = new Date(date).toLocaleDateString('en-GB', { weekday: 'long' });
        const availableSlots = availability.filter(a => a.dayOfWeek === selectedDay);

        if (!availableSlots.length) {
               
                return [];
            }
        
        const bookedTimes = bookedSlots.map(slot => slot.time);

        let times = [];
        availableSlots.forEach(slot => {
            let startTime = parseInt(slot.startTime.split(':')[0], 10);
            let endTime = parseInt(slot.endTime.split(':')[0], 10);
            for (let time = startTime; time < endTime; time++) {
                const timeString = time.toString().padStart(2, '0') + ':00';
                if (!bookedTimes.includes(timeString)) {
                    times.push(timeString);
                }
            }
        });

        if (times.length === 0) {
            setMessage("All time slots on this date are booked, please check available days below.");
        } else {
            setMessage(""); // Clear the message if there are available times
        }

        return times;
    };

    const editAppointment = (appointment) => {
        setSelectedDoctor(appointment.doctorId);
        setDate(appointment.date);
        setTime(appointment.time);
        setReason(appointment.reason);
        setOtherReason(appointment.otherReason || '');
        setSymptoms(appointment.symptoms || '');
        setAppointmentMode(appointment.mode);
        setEditingAppointmentId(appointment.id); // Set the ID of the appointment being edited
    };
    

    const cancelAppointment = async (id) => {
        try {
            await axios.delete(`/api/appointments/cancel/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Appointment cancelled successfully');
            fetchAppointments(); // Refresh the list of appointments
        } catch (error) {
            console.error('Failed to cancel appointment', error);
        }
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    }
    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleViewDetails = () => {
        navigate("/patient/details", {
            state: { role: 'Patient' }
        });
    };

    const handleMeetingLinkClick = (appointment) => {
        setMeetingDetails({
            date: appointment.date,
            time: appointment.time,
            doctorName: appointment.doctorName,
            reason: appointment.reason,
            link: appointment.onlineMeetingLink
        });
        setShowPopup(true); // Show the popup
    };

    return (
        <div className='PatientAppointments_container'>
            <div className="PatientAppointments_navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>
                    An Automated System for Local GPs
                </div>
                <div className="PatientAppointments_navlinks">
                    <button onClick={handleAboutUsClick}>About Us</button>
                    <button onClick={handleContactClick}>Contact</button>
                </div>
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
                            <button onClick={handleLogoutClick}>Logout</button>
                        </div>
                    )}
                </div>

            </div>
            <div className="PatientAppointmentsform_container">
                <h2>Book an Appointment</h2>
                {message && <p className="error-message">{message}</p>}
                <div className='PatientAppointments_Formfeilds'>
                    <select className="PatientAppointments_select" onChange={e => setSelectedDoctor(e.target.value)} value={selectedDoctor}>
                        <option value="">Select a doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                        ))}
                    </select>
                    <input className="PatientAppointments_input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    {availableTimes.length === 0 && date && (
                        <p className="error-message">This date is not available, please check available days below.</p>
                    )}
                    <div className="time-box-container">
                        {availableTimes.map((timeSlot, index) => (
                            <button
                                key={index}
                                className={`time-box ${time === timeSlot ? 'selected' : ''}`}
                                onClick={() => setTime(timeSlot)}
                                disabled={bookedSlots.some(slot => slot.time.slice(0, 5) === timeSlot)}
 
                            >
                                {timeSlot}
                            </button>
                        ))}
                    </div>

                    <select className="PatientAppointments_select" onChange={e => setReason(e.target.value)} value={reason}>
                        <option value="">Select a reason</option>
                        <option value="Fever">Fever</option>
                        <option value="Headache">Headache</option>
                        <option value="Cold">Cold</option>
                        <option value="Flu">Flu</option>
                        <option value="Checkup">General Checkup</option>
                        <option value="Back Pain">Back Pain</option>
                        <option value="Stomach Ache">Stomach Ache</option>
                        <option value="Allergy">Allergy</option>
                        <option value="Injury">Injury</option>
                        <option value="Consultation">Consultation</option>
                        <option value="other">Other reasons</option>
                    </select>
                    <input className="PatientAppointments_placeholder"
                        type="text"
                        placeholder="Other reason (if any)"
                        value={otherReason}
                        onChange={e => setOtherReason(e.target.value)}
                    />
                    <input className="PatientAppointments_placeholder"
                        type="text"
                        placeholder="Describe any other symptoms"
                        value={symptoms}
                        onChange={e => setSymptoms(e.target.value)}
                    />
                    <select className="PatientAppointments_select" onChange={e => setAppointmentMode(e.target.value)} value={appointmentMode}>
                    <option value="">Select appointment mode</option>
                        <option value="face-to-face">Face-to-Face</option>
                        <option value="online">Online</option>
                    </select>
                </div>
                <button onClick={bookAppointment}>Book Appointment</button>
                {selectedDoctor && <ReadOnlyDoctorCalendar doctorId={selectedDoctor} />}
                <div className='PatientAppointmentsform_MyAppointments'>
                    <h2>My Appointments</h2>
                    <ol className='PatientAppointments_Ulist'>
                    {appointments.map(appointment => (
                        <li className='PatientAppointments_list' key={appointment.id}>
                            {appointment.date} {appointment.time} - {appointment.reason} ({appointment.status})
                            {appointment.mode === 'online' && (
                                <button onClick={() => handleMeetingLinkClick(appointment)}>
                                    Join Meeting
                                </button>
                            )}
                            <button onClick={() => editAppointment(appointment)}>Edit</button>
                            <button onClick={() => cancelAppointment(appointment.id)}>Cancel</button>
                        </li>
                    ))}
                </ol>
                </div>
                
            </div>
            {showPopup && (
            <div className="popup-overlay">
                <div className="popup-content">
                    <h3>Meeting Details</h3>
                    <p><strong>Date:</strong> {meetingDetails.date}</p>
                    <p><strong>Time:</strong> {meetingDetails.time}</p>
                    <p><strong>Doctor:</strong> {meetingDetails.doctorName}</p>
                    <p><strong>Reason:</strong> {meetingDetails.reason}</p>
                    <p><strong>Meeting Link:</strong> <a href={meetingDetails.link} target="_blank" rel="noopener noreferrer">Join Meeting</a></p>
                    <button onClick={() => setShowPopup(false)}>OK</button>
                </div>
            </div>
        )}
            
        </div>
        
    );
};

export default PatientAppointments;
