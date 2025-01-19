import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import PatientAppointments from '../components/PatientAppointments';
import axios from 'axios';

// Mock axios for API calls
jest.mock('axios');

beforeAll(() => {
    // Mock window.alert
    window.alert = jest.fn();
});

beforeEach(() => {
    // Mock localStorage for user data
    const mockUser = { patientId: 1 };
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock API responses
    axios.get.mockImplementation((url) => {
        if (url.includes('/doctors')) {
            return Promise.resolve({
                data: [
                    { id: 1, name: 'Dr. Smith' },
                    { id: 2, name: 'Dr. Johnson' },
                ],
            });
        } else if (url.includes('/appointments/patient/1/appointments')) {
            return Promise.resolve({
                data: [
                    {
                        id: 50,
                        date: '2024-09-04',
                        time: '11:00:00',
                        reason: 'Fever',
                        symptoms: 'Headache',
                        status: 'Booked',
                        doctorId: 1,
                        patientId: 1,
                        mode: 'face-to-face',
                    },
                ],
            });
        } else if (url.includes('doctor/1/availability')) {
            return Promise.resolve({
                data: [
                    {
                        dayOfWeek: 'Wednesday',
                        startTime:'8:00:00',
                        endTime: '16:00:00'
                    }
                ]
            });
        }else if (url.includes('/doctor/1/booked-slots?date=2024-09-18')) {
            return Promise.resolve({
                data: [
                    {
                        time: '08:00:00'
                    }
                ]
            });
        }
        else if (url.includes('/doctor/1/booked-slots')) {
            return Promise.resolve({
                data: []
            });
        }
        return Promise.reject(new Error('not found'));
    });
    axios.post.mockImplementation((url) => {
        if (url.includes('/appointments/book')) {
            return Promise.resolve({});
        }
        return Promise.reject(new Error('not found'));
    });

});


test('renders PatientAppointments component', async () => {
    await act(async () => {
        render(
            <Router>
                <PatientAppointments />
            </Router>
        );
    });

    // Check if the title is rendered
    expect(screen.getByText(/Book an Appointment/i)).toBeInTheDocument();
});

test('books an appointment successfully', async () => {
    await act(async () => {
        render(
            <Router>
                <PatientAppointments />
            </Router>
        );
    });

    // Select the doctor
    fireEvent.change(screen.getByText(/Select a doctor/i).closest('select'), { target: { value: '1' } });

    // Choose the date
    const dateInput = document.querySelector('input[type="date"]');
    if (!dateInput) {
        throw new Error("Date input not found");
    }
    fireEvent.change(dateInput, { target: { value: '2024-09-18' } });

         
    // Debug to inspect the DOM and find the exact time format
   

    // Find and click the time button, choose an available time like 09:00
    const timeButton = await screen.findByText('09:00'); // Adjust this to a time that exists
    fireEvent.click(timeButton);
    // Select the reason
    fireEvent.change(screen.getByText(/Select a reason/i).closest('select'), { target: { value: 'Checkup' } });

    // Select the appointment mode
    fireEvent.change(screen.getByText(/Select appointment mode/i).closest('select'), { target: { value: 'face-to-face' } });

    // Book the appointment
    await act(async () => {
        fireEvent.click(screen.getByText(/Book Appointment/i));
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Appointment booked successfully'));
});
test('edits an appointment', async () => {
    await act(async () => {
        render(
            <Router>
                <PatientAppointments />
            </Router>
        );
    });

    // Wait for the initial render to complete and check for a specific doctor
    await waitFor(() => screen.getByText(/Dr. Smith/i));

    // Click the Edit button for the first appointment
    await act(async () => {
        fireEvent.click(screen.getByText(/Edit/i));
    });

    // Use getByText to select the "reason" dropdown
    fireEvent.change(screen.getByText(/Select a reason/i).closest('select'), { target: { value: 'Cold' } });

    await act(async () => {
        fireEvent.click(screen.getByText(/Book Appointment/i));
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Appointment updated successfully'));
});

test('cancels an appointment', async () => {
    await act(async () => {
        render(
            <Router>
                <PatientAppointments />
            </Router>
        );
    });

    await waitFor(() => screen.getByText(/Dr. Smith/i));

    await act(async () => {
        fireEvent.click(screen.getByText(/Cancel/i));
    });

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Appointment cancelled successfully'));
});
