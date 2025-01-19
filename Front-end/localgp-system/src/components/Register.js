import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { countries } from 'countries-list';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateofbirth, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [postcode, setPost] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
    const [dobErrorMessage, setDobErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleContactClick = () => {
        navigate('/contact');
    };
    
    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

     

    const countryOptions = Object.keys(countries).map((code) => ({
        code: code,
        name: countries[code].name
    }));

      

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setPasswordErrorMessage('');
        setPhoneErrorMessage('');
        setDobErrorMessage('');

            // Regular expression to check if password is alphanumeric
            const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(password);

            // Password length and alphanumeric validation
            if (password.length < 8 || password.length > 16) {
                setPasswordErrorMessage("Password must be between 8 and 16 characters.");
                return;
            }
    
            // if (!isAlphanumeric) {
            //     setPasswordErrorMessage("Password must contain both letters and numbers.");
            //     return;
            // }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Phone number validation
        const phoneFormat = /^[0-9]+$/; // Only digits allowed
        if (!phoneFormat.test(phone)) {
            setPhoneErrorMessage("Phone number must contain only digits.");
            return;
        }

        if (phone.length < 10 || phone.length > 15) {
            setPhoneErrorMessage("Phone number must be between 10 and 15 digits.");
            return;
        }

         // Date of birth validation (should not be in the future)
         const dobDate = new Date(dateofbirth);
         const today = new Date();
         if (dobDate > today) {
             setDobErrorMessage("Date of birth cannot be a future date.");
             return;
         }
        
        // Convert dob to UTC format
        
        const dobUtc = new Date(Date.UTC(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate()));


        try {
            await axios.post('/api/auth/register', {
                username, email, password, confirmPassword, firstName, lastName, dateofbirth: dobUtc.toISOString(), gender, phone, address, city, country, postcode
            });
            setSuccessMessage("Registration successful. Please check your email for confirmation.");
            // Optionally, you can redirect to login page after a delay
            setTimeout(() => navigate('/'), 5000);

        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Registration failed");
            }
        }
    };

    return (
        <div className="register_container">
            <nav className="register_navbar">
                <div className="title">
                <i className="fas fa-heartbeat"></i>An Automated System for Local GPs</div>
                <div className="login_nav-links">
                   <button onClick={handleAboutUsClick}>AboutUs</button>
                    <button onClick={handleContactClick}>Contact</button>
                </div>
            </nav>
            
            <div className="register_formcontainer">
                <h2>Register</h2>
                {successMessage && <p className="success">{successMessage}</p>}
                {errorMessage && <p className="error">{errorMessage}</p>}
                <form onSubmit={handleRegister}>
                    <div>
                        <label>First Name</label>
                        <input className='fieldSize' type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Last Name</label>
                        <input className='fieldSize' type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Username</label>
                        <input className='fieldSize' type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label>Email</label>
                        <input className='fieldSize' type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        {errorMessage === "Email is already registered." && <p className="error">{errorMessage}</p>}
                    </div>
                    <div>
                        <label>Password</label>
                        <input className='fieldSize' type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {passwordErrorMessage && <p className="error">{passwordErrorMessage}</p>}

                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input className='fieldSize' type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <input type="date" value={dateofbirth} onChange={(e) => setDob(e.target.value)} required />
                        {dobErrorMessage && <p className="error">{dobErrorMessage}</p>}
                    </div>

                    <div>
                        <label>Gender</label>
                        <select className='aligndropdown' value={gender} onChange={(e) => setGender(e.target.value)} required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label>Phone</label>
                        <input className='fieldSize'  type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        {phoneErrorMessage && <p className="error">{phoneErrorMessage}</p>}
                    </div>
                    <div>
                        <label>Address</label>
                        <input className='fieldSize'  type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div>
                        <label>City</label>
                        <input className='fieldSize' type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div>
                        <label>Country</label>
                        <select className='aligndropdown' value={country} onChange={(e) => setCountry(e.target.value)} required>
                            <option value="">Select Country</option>
                            {countryOptions.map(({ code, name }) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                        <div>
                            <label>Post Code</label>
                            <input className='fieldSize' type="text" value={postcode} onChange={(e) => setPost(e.target.value)} required />
                        </div>
                        <div className="button-group">
                            <button type="submit">Register</button>
                        </div>
                </form>
            </div>
        </div>
    );
}

export default Register;