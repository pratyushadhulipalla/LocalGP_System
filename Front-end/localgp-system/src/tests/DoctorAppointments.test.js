import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import DoctorAppointments from '../components/DoctorAppointments';
import jwt from 'jsonwebtoken';  // If you are using jsonwebtoken

beforeEach(() => {
    // Create a mock token with the doctorId
    const mockPayload = { doctorId: "5" };
    const mockToken = jwt.sign(mockPayload, 'secret'); // 'secret' is a dummy secret used for signing the token

    // Store the mock token in localStorage
    localStorage.setItem('token', mockToken);

    // Mock API responses and other setup if needed
});

test('renders DoctorAppointments component', () => {
    render(
        <Router> {/* Wrap the component with Router */}
            <DoctorAppointments />
        </Router>
    );
    const linkElement = screen.getByText(/Doctor Appointments/i);
    expect(linkElement).toBeInTheDocument();
});

test('cancels an appointment successfully', () => {
    render(
        <Router> {/* Wrap the component with Router */}
            <DoctorAppointments />
        </Router>
    );
    // Simulate cancelling an appointment here
});

test('updates an appointment successfully', () => {
    render(
        <Router> {/* Wrap the component with Router */}
            <DoctorAppointments />
        </Router>
    );
    // Simulate updating an appointment here
});

test('renders past appointments with feedback', () => {
    render(
        <Router> {/* Wrap the component with Router */}
            <DoctorAppointments />
        </Router>
    );
    // Simulate rendering past appointments with feedback
});
