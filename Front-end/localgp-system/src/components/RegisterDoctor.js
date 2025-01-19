import React, { useState } from 'react';
import axios from 'axios';
import './RegisterDoctor.css';
import { useNavigate } from 'react-router-dom';

const RegisterDoctor = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        address: '',
        city: '',
        country: '',
        postCode: '',
        dateOfBirth: '',
        gender: '',
        specialization: '',
        yearsOfExperience: '',
        education: '',
        licenseNumber: '',
        availability: daysOfWeek.map(day => ({ dayOfWeek: day, startTime: '', endTime: '', selected: false }))
    });

    const [message, setMessage] = useState('');
    const [licenseVerified, setLicenseVerified] = useState(false); // New state for verification status
    const [licenseMessage, setLicenseMessage] = useState(''); // Message for verification

    const navigate = useNavigate();

    const specializations = [
        'Emergency', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Psychiatry', 'Radiology', 'General Surgery', 'Orthopedics', 'Ophthalmology', 'Gynecology'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvailabilityChange = (e, dayIndex, field) => {
        const newAvailability = [...formData.availability];
        newAvailability[dayIndex][field] = e.target.value;
        setFormData({ ...formData, availability: newAvailability });
    };

    const handleDaySelectionChange = (e, dayIndex) => {
        const newAvailability = [...formData.availability];
        newAvailability[dayIndex].selected = e.target.checked;
        setFormData({ ...formData, availability: newAvailability });
    };

    const handleRegisterDoctor = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/auth/register-doctor', {
                ...formData,
                availability: formData.availability.filter(a => a.selected).map(a => ({
                    ...a,
                    startTime: `${a.startTime}:00`,
                    endTime: `${a.endTime}:00`
                }))
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage(response.data.Message);
            navigate('/admin');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("Registration failed");
            }
        }
    };

    const handleLicenseVerification = async () => {
        try {
            console.log('Verifying License Number:', formData.licenseNumber);
            const response = await axios.post('/api/auth/verify-license', {
                licenseNumber: formData.licenseNumber
            });
            if (response.data.isValid) {
                setLicenseVerified(true);
                setLicenseMessage("License number verified successfully!");
            } else {
                setLicenseVerified(false);
                setLicenseMessage("Invalid license number.");
            }
        } catch (error) {
            setLicenseVerified(false);
            setLicenseMessage("Verification failed.");
        }
    };


    const handleBackToDashboard = () => {
        navigate('/admin');
    };

    return (
        <div className="registerdoctor_container">
            <nav className="registerdoctor_navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>An Automated System for Local GPs
                </div>
                <div className="nav-button">
                    <button type="button" onClick={handleBackToDashboard}>Dashboard</button>
                </div>
            </nav>
            <div className="register-doctor-container">
                <form onSubmit={handleRegisterDoctor}>
                    {message && <p className="message">{message}</p>}
                    <div className='validatedoctor'>
                        <label>License Number</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            
                            required
                        />
                        <button type="button" onClick={handleLicenseVerification}>Verify License</button>
                        {licenseVerified ? <span className="verified">✔</span> : null}
                        {licenseMessage && <p>{licenseMessage}</p>}
                    </div>



                    <div>
                        <label>First Name</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Post Code</label>
                        <input type="text" name="postCode" value={formData.postCode} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label>Specialization</label>
                        <select name="specialization" value={formData.specialization} onChange={handleChange} required>
                            <option value="">Select Specialization</option>
                            {specializations.map(specialization => (
                                <option key={specialization} value={specialization}>{specialization}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Years of Experience</label>
                        <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Availability</label>
                        {formData.availability.map((avail, index) => (
                            <div key={index} className="availability-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={avail.selected}
                                        onChange={(e) => handleDaySelectionChange(e, index)}
                                    />
                                    {avail.dayOfWeek}
                                </label>
                                {avail.selected && (
                                    <>
                                        <input
                                            type="time"
                                            value={avail.startTime}
                                            onChange={(e) => handleAvailabilityChange(e, index, 'startTime')}
                                            required
                                        />
                                        <input
                                            type="time"
                                            value={avail.endTime}
                                            onChange={(e) => handleAvailabilityChange(e, index, 'endTime')}
                                            required
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label>Education</label>
                        <input type="text" name="education" value={formData.education} onChange={handleChange} required />
                    </div>
                    <div className='button-group'>
                        <button type="submit">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterDoctor;
