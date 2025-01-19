import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientPrescription.css';
import stripePromise from './stripeConfig';

const PatientPrescription = () => {
    const [activePrescriptions, setActivePrescriptions] = useState([]);
    const [pastPrescriptions, setPastPrescriptions] = useState([]);
    const [loadingPrescriptionId, setLoadingPrescriptionId] = useState(null); 

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await axios.get('/api/prescription/list', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const active = response.data.filter(p => p.paymentStatus !== 'Completed');
                const past = response.data.filter(p => p.paymentStatus === 'Completed');
                setActivePrescriptions(active);
                setPastPrescriptions(past);
            } catch (error) {
                console.error('Error fetching prescriptions:', error);
            }
        };

        fetchPrescriptions();
    }, []);

    const handlePurchase = async (prescriptionId) => {
        setLoadingPrescriptionId(prescriptionId); ;
        try {
            const response = await axios.post('/api/prescription/purchase', {
                prescriptionId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                const { sessionId, url } = response.data;
                console.log(`Received session ID: ${sessionId}`);
                console.log(`Redirecting to Stripe URL: ${url}`);
                const paymentWindow = window.open(url, '_blank');

                if (paymentWindow) {
                    paymentWindow.focus();
                } else {
                    alert("Please allow pop-ups for this site to proceed with the payment.");
                }
            } else {
                console.error('Failed to create a Stripe session.');
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
        } finally {
            setLoadingPrescriptionId(null);;
        }
    };

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                const response = await axios.get('/api/prescription/list', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const active = response.data.filter(p => p.paymentStatus !== 'Completed');
                const past = response.data.filter(p => p.paymentStatus === 'Completed');
                setActivePrescriptions(active);
                setPastPrescriptions(past);
            } catch (error) {
                console.error('Error fetching prescriptions:', error);
            }
        };

        const intervalId = setInterval(checkPaymentStatus, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="patient-prescription-container">
            <h2>Your Prescriptions</h2>

            {activePrescriptions.length > 0 && (
                <div>
                    <h3>Active Prescriptions</h3>
                    <div className="prescription-list">
                        {activePrescriptions.map(prescription => (
                            <div key={prescription.id} className="prescription-item">
                                <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                                <p><strong>Medicine:</strong> {prescription.medicineName}</p>
                                <p><strong>Dosage:</strong> {prescription.dosage} tablets/day</p>
                                <p><strong>Duration:</strong> {prescription.duration} days</p>
                                <p><strong>Pharmacy:</strong> {prescription.pharmacyName}</p>
                                <button onClick={() => handlePurchase(prescription.id)} disabled={loadingPrescriptionId === prescription.id}>
                                    {loadingPrescriptionId === prescription.id ? 'Processing...' : 'Purchase'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pastPrescriptions.length > 0 && (
                <div>
                    <h3>Past Prescriptions</h3>
                    <div className="prescription-list">
                        {pastPrescriptions.map(prescription => (
                            <div key={prescription.id} className="prescription-item">
                                <p><strong>Doctor:</strong> {prescription.doctorName}</p>
                                <p><strong>Medicine:</strong> {prescription.medicineName}</p>
                                <p><strong>Dosage:</strong> {prescription.dosage} tablets/day</p>
                                <p><strong>Duration:</strong> {prescription.duration} days</p>
                                <p><strong>Pharmacy:</strong> {prescription.pharmacyName}</p>
                                <p>Purchase Completed</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activePrescriptions.length === 0 && pastPrescriptions.length === 0 && (
                <p>No prescriptions found.</p>
            )}
        </div>
    );
};

export default PatientPrescription;
