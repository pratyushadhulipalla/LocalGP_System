import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-container">
            <div className="navbar-contact">
                <div className="title">
                    <i className="fas fa-heartbeat"></i>
                    An Automated System for Local GPs
                </div>
            </div>
            <div className="contact-page">
                <h1>Contact Details</h1>
                <div className="contact-cards">
                    <div className="contact-card">
                        <i className="fas fa-map-marker-alt"></i>
                        <h3>Address</h3>
                        <p>Infirmary Square, Leicester LE1 5WW</p>
                    </div>
                    <div className="contact-card">
                        <i className="fas fa-phone-alt"></i>
                        <h3>Call Us</h3>
                        <p>0300 303 1573</p>
                        <p>08081 788337</p>
                    </div>
                    <div className="contact-card">
                        <i className="fas fa-envelope"></i>
                        <h3>Email Us</h3>
                        <p>localgpteam.staff@gmail.com</p>
                        <p>localgpservices@gmail.com</p>
                    </div>
                    <div className="contact-card">
                        <i className="fas fa-clock"></i>
                        <h3>Open Hours</h3>
                        <p>Monday - Friday</p>
                        <p>9:00AM - 05:00PM</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
