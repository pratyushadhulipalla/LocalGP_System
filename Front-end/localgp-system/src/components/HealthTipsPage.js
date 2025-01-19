import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HealthTipsPage.css';

const HealthTipsPage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleViewDetails = () => {
        navigate('/patient/details', {
            state: { role: 'Patient' }
        });
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="health-tips-container">
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
                                <button onClick={handleLogoutClick}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <h1>Health Tips</h1>
            
            <div className="health-tip-category_Diet">
                <div>
                <h2>Nutrition and Diet</h2>
                </div>
                <div className='health-diet_1'>
                <div>
                <img src='/neutrion.png' alt='img' />
                </div>
                <ul>
                    <li>Eat a variety of foods to ensure you get all the nutrients your body needs.</li>
                    <li>Incorporate more fruits and vegetables into your meals.</li>
                    <li>Stay hydrated by drinking plenty of water throughout the day.</li>
                    <li>Limit your intake of sugar and saturated fats.</li>
                </ul>
                </div>
                
            </div>

            <div className="health-tip-category_Fit">
                <div>
                <h2>Exercise and Fitness</h2>
                </div>
                <div className='health_fit'>
                <div>
                <img src='/excercise.png' alt='img' />
                </div>  
                <ul>
                    <li>Aim for at least 30 minutes of moderate physical activity every day.</li>
                    <li>Incorporate strength training exercises at least twice a week.</li>
                    <li>Find a physical activity you enjoy to make it easier to stick with it.</li>
                    <li>Don’t forget to warm up before exercising and cool down afterward.</li>
                </ul>
                </div>
            </div>

            <div className="health-tip-category_mental">
                <div>
                <h2>Mental Health</h2>
                </div>
                <div className='health_mental'>
                <div>
                <img src='/mentalhappy.png' alt='img' />
                </div>
                <ul>
                    <li>Practice mindfulness and meditation to reduce stress.</li>
                    <li>Ensure you get enough sleep each night.</li>
                    <li>Stay connected with friends and family to maintain strong social bonds.</li>
                    <li>Seek professional help if you’re feeling overwhelmed or anxious.</li>
                </ul>
            </div>
            </div>

            <div className="health-tip-category_care">
                <div>
                <h2>Preventive Care</h2>
                </div>
                <div className='health_care'>
                <div>
                <img src='/preventive-care.png' alt='img' />
                </div>
                <ul>
                    <li>Schedule regular check-ups with your healthcare provider.</li>
                    <li>Stay up-to-date with vaccinations and immunizations.</li>
                    <li>Practice good hygiene, such as regular hand washing.</li>
                    <li>Avoid smoking and limit alcohol consumption.</li>
                </ul>
            </div>
            </div>

            <div className="health-tip-category_general">
                <div>
                <h2>General Health and Wellness</h2>
                </div>
                <div className='health_general'>
                <div>
                <img src='/mental-health.png' alt='img' />
                </div>
                <ul>
                    <li>Maintain a healthy weight through a balanced diet and regular exercise.</li>
                    <li>Manage stress effectively through relaxation techniques.</li>
                    <li>Stay informed about your health and medical conditions.</li>
                    <li>Take time to relax and engage in activities you enjoy.</li>
                </ul>
            </div>
            </div>
            
           
        </div>
    );
};

export default HealthTipsPage;
