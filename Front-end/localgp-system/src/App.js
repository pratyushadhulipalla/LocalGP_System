import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/AuthContext';
import AdminPage from './components/AdminPage';
import DoctorPage from './components/DoctorPage';
import PatientPage from './components/PatientPage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import RegisterDoctor from './components/RegisterDoctor';
import Contact from './components/Contact';
import AboutUs from './components/AboutUs';
import UserDetails from './components/UserDetails';
import DoctorAppointments from './components/DoctorAppointments';
import PatientAppointments from './components/PatientAppointments';
import ResetPassword from './components/ResetPassword';
import HealthTipsPage from './components/HealthTipsPage';
import DoctorCalendar from './components/DoctorCalendar';
import DoctorPrescription from './components/DoctorPrescription';
import PatientPrescription from './components/PatientPrescription';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';
import MedicalRecords from './components/MedicalRecords'; 
import PatientChat from './components/PatientChat';
import AdminChat from './components/AdminChat';
import { FirebaseProvider } from './components/firebase'; 

function App() {

    const userRole = localStorage.getItem('roles')?.trim().toLowerCase();
    console.log('User role:', userRole);
    return (

        

       <FirebaseProvider>
      <Router>
      <AuthProvider>
      
        
            
                <Routes>

                {console.log('Rendering Routes')}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/aboutus" element={<AboutUs />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/user-details" element={<UserDetails />} />
                    <Route path="/success" element={<SuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />
                    {/* <Route path="/Doctor/details" element={<UserDetails />} /> */}
                    <Route element={<PrivateRoute requiredRole="Admin" />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Admin" />}>
                        <Route path="/register-doctor" element={<RegisterDoctor />} />
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Doctor" />}>
                        <Route path="/doctor" element={<DoctorPage />} />
                        <Route path="/doctor/calendar" element={<DoctorCalendar />} />
                       
                        
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Doctor" />}>
                        <Route path="/doctor/details" element={<UserDetails />} />
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Doctor" />}>
                        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                        <Route path="/doctor/prescriptions" element={<DoctorPrescription />} />
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Patient" />}>
                        <Route path="/patient" element={<PatientPage />} />
                    </Route>
                    <Route element={<PrivateRoute requiredRole="Patient" />}>
                        <Route path="/patient/details" element={<UserDetails />} />
                        <Route path="/patient/appointments" element={<PatientAppointments />} />
                        <Route path="/patient/prescriptions" element={<PatientPrescription />} />
                        <Route path="/patient/health-tips" element={<HealthTipsPage />} />
                        <Route path="/patient/medical-records" element={<MedicalRecords />} />
                    </Route>
                    {/* <Route element={<PrivateRoute requiredRole="Patient" />}>
                        <Route path="/patient/user-info" element={<UserDetails />} />
                    </Route> */}
                     {/* Chat Routes */}
                     {userRole === 'patient' && (
                            <Route path="/patient-chat" element={<PatientChat />} />
                        )}
                        {userRole === 'admin' && (
                            <Route path="/admin-chat" element={<AdminChat />} />
                        )}
                </Routes>
            
      
            </AuthProvider>
        </Router>
        </FirebaseProvider> 
      
    );
}

// test('renders Login text', () => {
//     render(<App />);
//     const loginTexts = screen.getAllByText(/login/i);
//     expect(loginTexts.length).toBeGreaterThan(0);
// });




// // Update the test to reflect actual content
// test('renders An Automated System for Local GPs title', () => {
//     render(<App />);
//     const titleElement = screen.getByText(/An Automated System for Local GPs/i);
//     expect(titleElement).toBeInTheDocument();
// });



export default App;


