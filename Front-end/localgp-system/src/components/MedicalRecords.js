import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MedicalRecords.css'; 
import FeedbackForm from './FeedbackForm';

const MedicalRecords = () => {
    const [pastAppointments, setPastAppointments] = useState([]);
    const [pastPrescriptions, setPastPrescriptions] = useState([]);
    const patientID = localStorage.getItem('user')
    const ID = JSON.parse(patientID).patientId;
    console.log(ID);
    

    useEffect(() => {
        // Fetch past appointments
        const fetchPastAppointments = async () => {
            try {
                const response = await axios.get(`/api/appointments/patient/${JSON.parse(patientID).patientId}/past-appointments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPastAppointments(response.data);
            } catch (error) {
                console.error('Failed to fetch past appointments', error);
            }
        };

        // Fetch past prescriptions
        const fetchPastPrescriptions = async () => {
            try {
                const response = await axios.get(`/api/prescription/patient/${JSON.parse(patientID).patientId}/past-prescriptions`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPastPrescriptions(response.data);
            } catch (error) {
                console.error('Failed to fetch past prescriptions', error);
            }
        };

        fetchPastAppointments();
        fetchPastPrescriptions();
    }, []);

    return (
        <div className="medical-records-container">
            <h2>Medical Records</h2>

            <div className="appointments-section">
                <h3>Past Appointments</h3>
                {pastAppointments.length > 0 ? (
                    <ul>
                        {pastAppointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.date} - {appointment.time} with {appointment.doctorName}
                                <FeedbackForm
                                    appointmentId={appointment.appointmentId}
                                    patientId={localStorage.getItem('patientId')}
                                    doctorId={appointment.doctorId}
                                    onSubmit={() => window.location.reload()} // Reload to see the updated feedback status
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No past appointments found.</p>
                )}
            </div>

            <div className="prescriptions-section">
                <h3>Past Prescriptions</h3>
                {pastPrescriptions.length > 0 ? (
                    <ul>
                        {pastPrescriptions.map((prescription, index) => (
                            <li key={index}>
                                {prescription.medicineName} - {prescription.dosage} for {prescription.duration} days
                                (Prescribed by {prescription.doctorName}, {prescription.pharmacyName})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No past prescriptions found.</p>
                )}
            </div>
        </div>
    );
};

export default MedicalRecords;
