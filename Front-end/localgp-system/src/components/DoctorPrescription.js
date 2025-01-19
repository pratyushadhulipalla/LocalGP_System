import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorPrescription.css';
import { useNavigate } from 'react-router-dom';

const DoctorPrescription = () => {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState('');
    const [dosage, setDosage] = useState('');
    const [duration, setDuration] = useState('');
    const [purchaseOption, setPurchaseOption] = useState('');
    const doctorID=localStorage.getItem('user')
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching patients...');
                const patientsResponse = await axios.get('/api/doctor/patients', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Fetched patients:', patientsResponse.data);
                setPatients(patientsResponse.data);

                console.log('Fetching medicines...');
                const medicinesResponse = await axios.get('/api/doctor/medicines', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
                console.log('Fetched medicines:', medicinesResponse.data);
                setMedicines(medicinesResponse.data);

                console.log('Fetching pharmacies...');
                const pharmaciesResponse = await axios.get('/api/doctor/pharmacies',{
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }

                });
                console.log('Fetched pharmacies:', pharmaciesResponse.data);
                setPharmacies(pharmaciesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('Patients state:', patients);
        console.log('doctorId',JSON.parse(doctorID).doctorId)
    }, [patients]);

    const handlePatientChange = async (patientId) => {
        setSelectedPatient(patientId);
        try {
            const appointmentsResponse = await axios.get(`/api/appointments/patient/${patientId}/appointments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setAppointments(appointmentsResponse.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleAddPrescription = () => {
        setSelectedPrescriptions([
            ...selectedPrescriptions,
            { medicine: '', dosage: '', duration: '' }
        ]);
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updatedPrescriptions = selectedPrescriptions.map((prescription, i) =>
            i === index ? { ...prescription, [field]: value } : prescription
        );
        setSelectedPrescriptions(updatedPrescriptions);
    };

   

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that an appointment, patient, and prescriptions are selected
    if (!selectedPatient || !selectedAppointment || selectedPrescriptions.length === 0) {
        alert("Please select a patient, an appointment, and add at least one prescription.");
        return;
    }

    const formattedPrescriptions = selectedPrescriptions.map(prescription => ({
        medicine: prescription.medicine,
        dosage: prescription.dosage,
        duration: prescription.duration,
    }));
        try {
            const response = await axios.post('/api/prescription/create', {
                doctorId :JSON.parse(doctorID).doctorId ,
                patientId: selectedPatient,
                
                prescriptions: formattedPrescriptions,
                // medicineName: selectedMedicine,
                pharmacyId: purchaseOption === 'pharmacy' ? selectedPharmacy : null, // Only include pharmacyId if purchase option is pharmacy
                // dosage,
                // duration,
                purchaseOption 
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 200) {
                alert('Prescription created successfully.');
                navigate('/doctor');
            }
        } catch (error) {
            console.error('Error creating prescription:', error);
        }
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    return (
        <div className="doctor-prescription-container">
            <div className="doctor-prescription-navbar">
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
            <h2>Create Prescription</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Select Patient:
                    <select value={selectedPatient} onChange={(e) => handlePatientChange(e.target.value)}>
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                                {patient.user.firstName} {patient.user.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                {appointments.length > 0 && (
                    <label>
                        Select Appointment:
                        <select value={selectedAppointment} onChange={(e) => setSelectedAppointment(e.target.value)}>
                            <option value="">Select Appointment</option>
                            {appointments.map(appointment => (
                                <option key={appointment.id} value={appointment.id}>
                                    {appointment.date} {appointment.time}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <div>
                    <button type="button" onClick={handleAddPrescription}>
                        Add Prescription
                    </button>
                </div>
                {selectedPrescriptions.map((prescription, index) => (
                    <div key={index}>
                        <label>
                            Select Medicine:
                            <select value={prescription.medicine} onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}>
                                <option value="">Select Medicine</option>
                                {medicines.map(medicine => (
                                    <option key={medicine.id} value={medicine.name}>
                                        {medicine.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Dosage:
                            <input
                                type="text"
                                value={prescription.dosage}
                                onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                                placeholder="e.g., 2 tablets/day" 
                            />
                        </label>
                        <label>
                            Duration:
                            <input
                                type="text"
                                value={prescription.duration}
                                onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"  
                            />
                        </label>
                    </div>
                ))}
                <label>
                    Purchase Option:
                    <select value={purchaseOption} onChange={(e) => setPurchaseOption(e.target.value)}>
                        <option value="">Select Purchase Option</option>
                        <option value="online">Online</option>
                        <option value="pharmacy">Pharmacy</option>
                    </select>
                </label>
                {purchaseOption === 'pharmacy' && (
                    <label>
                        Select Pharmacy:
                        <select value={selectedPharmacy} onChange={(e) => setSelectedPharmacy(e.target.value)}>
                            <option value="">Select Pharmacy</option>
                            {pharmacies.map(pharmacy => (
                                <option key={pharmacy.id} value={pharmacy.id}>
                                    {pharmacy.name} - {pharmacy.address} , {pharmacy.zipCode}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <button type="submit">Create Prescription</button>
            </form>
            </div>
             </div>
        
        
    );
};

export default DoctorPrescription;
