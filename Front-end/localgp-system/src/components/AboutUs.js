// aboutus.js
import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us_container">
            <div className="about-us_navbar">
                <div className="title">
                    <i className="fas fa-heartbeat"></i> An Automated System for Local GPs
                </div>   
            </div>
            <div className="about-us_content">
                <section id="whoweare" className='about-us_section about-us_whoweare'>
                {/* <div className="background1"></div> */}
                <img src='/doctor1.jpg' alt='img'/>
                    <h2>Who We Are</h2>
                    <p>Local GP is dedicated to providing comprehensive healthcare services to the community. Our team of skilled professionals is committed to offering personalized medical care with a focus on quality and compassion.</p>
                    <p>Our mission is to deliver top-quality healthcare. We pride ourselves on our team of experts who provide personalized, compassionate care. With cutting-edge technology and a focus on preventive care, we strive to meet each patient's unique needs and promote wellness."</p>
                </section>
                <section id="services" className='about-us_section about-us_services'>
                    {/* <div className="background"></div> */}
                    <img src='/services.jpeg' alt='img'/>
                    <h2>Our Services</h2>
                    <ul>
                        <li>General Consultation</li>
                        <li>Pediatrics</li>
                        <li>Cardiology</li>
                        <li>Dermatology</li>
                        <li>Neurology</li>
                        <li>Psychiatry</li>
                        <li>Radiology</li>
                        <li>General Surgery</li>
                        <li>Orthopedics</li>
                        <li>Ophthalmology</li>
                    </ul>
                </section>
                <section id="working-hours" className='about-us_section about-us-workinghours'>
                {/* <div className="background2"></div> */}
                <img src='/time.jpg' alt='img'/>
                    <h2>Working Hours</h2>
                    <p><strong>Monday</strong>: 9:00 AM - 5:00 PM</p>
                    <p><strong>Tuesday</strong>: 9:00 AM - 5:00 PM</p>
                    <p><strong>Wednesday</strong>: 9:00 AM - 5:00 PM</p>
                    <p><strong>Thursday</strong>: 9:00 AM - 5:00 PM</p>
                    <p><strong>Friday</strong>: 9:00 AM - 5:00 PM</p>
                    <p><strong>Saturday</strong>: Closed</p>
                    <p><strong>Sunday</strong>: Closed</p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
