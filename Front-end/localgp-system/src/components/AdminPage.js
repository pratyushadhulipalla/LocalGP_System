import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import AreaChart from './AreaChart';
import './AdminPage.css';
// import MedicalRecords from './MedicalRecords';
import UserDetails from './UserDetails';
import AdminChat from './AdminChat';



const AdminPage = () => {
    const [message, setMessage] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [doctorsCount, setDoctorsCount] = useState(0);
    const [patientsCount, setPatientsCount] = useState(0);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorPatients, setDoctorPatients] = useState([]);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
    const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null);

    const [pastAppointments, setPastAppointments] = useState([]);
    const [pastPrescriptions, setPastPrescriptions] = useState([]);
    // const [lineChartData, setLineChartData] = useState(null);
    const [areaChartData, setAreaChartData] = useState(null); 
    const [barChartData, setBarChartData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);




    const navigate = useNavigate();

    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchDashboardData();
            fetchUpcomingAppointments();
            fetchAppointmentsOverTime();
            fetchAppointmentsBySpecialization();
            fetchAgeDistributionData();

        }
        if (currentView === 'patients') {
            fetchPatients();
        }
        if (currentView === 'doctors') {
            fetchDoctors();
        }
    }, [currentView]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage(response.data.message);
            setDoctorsCount(response.data.doctorsCount);
            setPatientsCount(response.data.patientsCount);
        } catch (error) {
            console.error('Error fetching admin dashboard:', error);
        }
    };

    const fetchAppointmentsOverTime = async () => {
        try {
            const response = await axios.get('/api/admin/appointments-over-time', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const chartData = {
                labels: response.data.map(entry => entry.date),
                datasets: [
                    {
                        label: 'Appointments',
                        data: response.data.map(entry => entry.appointments),
                        fill: true,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 0.2)',
                    },
                ],
            };

            setAreaChartData(chartData);
        } catch (error) {
            console.error('Error fetching appointments over time:', error);
        }
    };

    const fetchAppointmentsBySpecialization = async () => {
        try {
            const response = await axios.get('/api/admin/appointments-by-specialization', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const chartData = {
                labels: response.data.map(entry => entry.specialization),
                datasets: [
                    {
                        label: 'Number of Appointments',
                        data: response.data.map(entry => entry.appointmentsCount),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)', // Color for each specialization
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(199, 199, 199, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(199, 199, 199, 1)'
                        ],
                        borderWidth: 1,
                    },
                ],
            };

            setBarChartData(chartData);
        } catch (error) {
            console.error('Error fetching appointments by specialization:', error);
        }
    };

    // if (!barChartData) {
    //     return <div>Loading...</div>; // Or render a spinner/loading indicator
    // }

    const fetchAgeDistributionData = async () => {
        try {
            const response = await axios.get('/api/admin/patients-age-distribution', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const chartData = {
                labels: response.data.map(entry => entry.ageGroup),
                datasets: [
                    {
                        data: response.data.map(entry => entry.count),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };

            setPieChartData(chartData);
        } catch (error) {
            console.error('Error fetching users age distribution:', error);
        }
    };

    // if (!pieChartData) {
    //     return <div>Loading...</div>; // Or render a spinner/loading indicator
    // }

    const fetchUpcomingAppointments = async () => {
        try {
            const response = await axios.get('/api/admin/upcoming-appointments', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUpcomingAppointments(response.data);
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/api/admin/patients', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/api/admin/doctors', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };


    const fetchDoctorPatients = async (doctorId) => {
        try {
            const response = await axios.get(`/api/admin/doctor/${doctorId}/patients`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDoctorPatients(response.data);
        } catch (error) {
            console.error('Error fetching doctor patients:', error);
        }
    };

    const fetchDoctorAppointments = async (doctorId) => {
        try {
            const response = await axios.get(`/api/admin/doctor/${doctorId}/appointments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDoctorAppointments(response.data);
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
        }
    };

    const handleDoctorSelect = (e) => {

        const doctorId = e.target.value;
        setSelectedDoctor(doctorId);
        fetchDoctorDetailsById(doctorId);

        fetchDoctorPatients(doctorId);
        fetchDoctorAppointments(doctorId);
    };

    const fetchDoctorDetailsById = (id) => {

        doctors.map(doctor => {
            if (doctor.id == id) {
                // setSelectedDoctor(doctor);
                setSelectedDoctorDetails(doctor);
            }
        })

    }

    const fetchMedicalRecords = async (patientId) => {
        try {
            const [appointmentsResponse, prescriptionsResponse] = await Promise.all([
                axios.get(`/api/appointments/patient/${patientId}/past-appointments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                axios.get(`/api/prescription/patient/${patientId}/past-prescriptions`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
            ]);
            setPastAppointments(appointmentsResponse.data);
            setPastPrescriptions(prescriptionsResponse.data);
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    const handlePatientSelectForRecords = async (e) => {
        const patientId = e.target.value;
        const selectedPatient = patients.find(patient => patient.id === parseInt(patientId));
        setSelectedPatient(selectedPatient);
        await fetchMedicalRecords(patientId);
    };




    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleNavigation = (view) => {
        setCurrentView(view);
        setSelectedPatient(null);
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('token');
        navigate('/');
    };


    const handlePatientClick = async (patient) => {
        const userId = patient.user.id;
        console.log(`Patient object: ${JSON.stringify(patient)}`);
        console.log(`Fetching details for userId: ${userId}`);
        try {
            const response = await axios.get(`/api/admin/user-details/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userDetails = response.data;
            console.log("Fetched user details:", userDetails);
            navigate('/user-details', { state: { userId: userId, user: userDetails, role: 'patient' } });
        } catch (error) {
            console.error('Error fetching patient details:', error);
        }
    };

    const handleDoctorClick = async (doctor) => {
        const userId = doctor.user.id;
        console.log(`Doctor object: ${JSON.stringify(doctor)}`);
        console.log(`Fetching details for userId: ${userId}`);
        try {
            const response = await axios.get(`/api/admin/user-details/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userDetails = response.data;
            console.log("Fetched user details:", userDetails);

            // Include specialization, yearsOfExperience, and education in user details
            const fullUserDetails = {
                ...userDetails,
                specialization: doctor.specialization,
                yearsOfExperience: doctor.yearsOfExperience,
                education: doctor.education,
                licenseNumber: doctor.licenseNumber
            };
            console.log("Navigating with user details:", fullUserDetails);

            navigate('/user-details', { state: { userId: userId, user: fullUserDetails, role: 'doctor' } });
        } catch (error) {
            console.error('Error fetching doctor details:', error);
        }
    };



    // const lineChartData = {
    //     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //     datasets: [
    //         {
    //             label: 'New Patients',
    //             data: [65, 59, 80, 81, 56, 55, 40],
    //             fill: false,
    //             backgroundColor: 'rgb(75, 192, 192)',
    //             borderColor: 'rgba(75, 192, 192, 0.2)',
    //         },
    //     ],
    // };

    // const barChartData = {
    //     labels: ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Radiology'],
    //     datasets: [
    //         {
    //             label: 'Number of Appointments',
    //             data: [12, 19, 3, 5, 2, 3],
    //             backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1,
    //         },
    //     ],
    // };

    // const pieChartData = {
    //     labels: ['Consultation', 'Check-up', 'Emergency'],
    //     datasets: [
    //         {
    //             label: 'Appointment Types',
    //             data: [300, 50, 100],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(255, 206, 86, 0.2)',
    //             ],
    //             borderColor: [
    //                 'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //             ],
    //             borderWidth: 1,
    //         },
    //     ],
    // };


    const handleDeleteAppointment = async (appointmentId) => {
        try {
            await axios.delete(`/api/admin/appointments/${appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchDoctorAppointments(selectedDoctor);
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    const handleContactClick = () => {
        navigate('/contact');
    };

    const handleAboutUsClick = () => {
        navigate('/AboutUs');
    };

    const toggleChatWindow = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="admin-container">
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <h2>Dashboard</h2>
                    <ul>
                        <li onClick={() => handleNavigation('dashboard')}>Dashboard</li>
                        <li onClick={() => handleNavigation('patients')}>Patients</li>
                        <li onClick={() => handleNavigation('doctors')}>Doctors</li>
                        <li onClick={() => handleAboutUsClick('about-us')}>About Us</li>
                        <li onClick={() => handleContactClick('contact')}>Contact</li>
                        <li onClick={handleLogoutClick}>Logout</li>
                    </ul>
                </nav>
            </div>
            <div className="main-content">
                <div className="admin-navbar">
                    <div className="burger-menu" onClick={toggleSidebar}>
                        &#9776;
                    </div>
                    <div className="title">
                        <i className="fas fa-heartbeat"></i> An Automated System for Local GPs
                    </div>
                    <div className="admin-nav-links">
                        {/* <button onClick={() => handleAboutUsClick('about-us')}>About Us</button>
                        <button onClick={() => handleContactClick('contact')}>Contact</button> */}
                    </div>
                </div>
                <div className="admin-dashboard-content">
                    {currentView === 'dashboard' && (
                        <div>
                            <div className="admin-stats">
                                <div className="stat">
                                    <div className="stat-img">
                                        <img src="/doctorcount.png" alt="Doctors" />
                                    </div>
                                    <div>
                                        <h2>Doctors</h2>
                                        <p>{doctorsCount}</p>
                                    </div>
                                </div>
                                <div className="stat">
                                    <div className="stat-img">
                                        <img src="/patientcountt.png" alt="Patients" />
                                    </div>
                                    <h2>Patients</h2>
                                    <p>{patientsCount}</p>
                                </div>
                                <div className="stat-charts">
                                {/* {lineChartData && <LineChart data={lineChartData} />} */}
                                {areaChartData && <AreaChart data={areaChartData} />}
                               
                                </div>
                            </div>
                            <div className="admin-stats2">
                                <div className="admin-upcomingappointments">
                                    <h3>Upcoming Appointments</h3>
                                    <fieldset>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Time</th>
                                                    <th>Doctor</th>
                                                    <th>Patient</th>
                                                    <th>Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {upcomingAppointments.map((appointment) => (
                                                    <tr key={appointment.id}>
                                                        <td>{appointment.date}</td>
                                                        <td>{appointment.time}</td>
                                                        <td>{appointment.doctorName}</td>
                                                        <td>{appointment.patientName}</td>
                                                        <td>{appointment.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </fieldset>

                                </div>
                                <div className="charts">
                                {barChartData && <BarChart data={barChartData} />}
                                {pieChartData && <PieChart data={pieChartData} />}
                                
                                   
                                </div>
                            </div>

                            {/* Floating Chat Icon */}
             <div className="admin-chat-icon-container" onClick={toggleChatWindow}>
                <img src='/chaticon.png' alt="Chat" className="chat-icon" />
            </div>
                                 {/* Chat Window */}
            {isChatOpen && (
                <div className="user-chat-window">
                    <button className="close-chat-btn" onClick={toggleChatWindow}>X</button>
                    <AdminChat />
                </div>
            )}
                           
           
                        </div>
                    )}
                    {currentView === 'patients' && (
                        <div className='admin-patients'>
                            <div className='admin-patients-section1'>

                                <div className='patinets-list'>
                                    
                                    <h2>Patients</h2>
                                    
                                    <div>
                                    <fieldset>
                                    <div>
                                    <img src='/patientsgroup.png' alt='img' />
                                    </div>
                                        <ol>
                                            {patients.map(patient => (
                                                <li key={patient.id} onClick={() => handlePatientClick(patient)}>
                                                    {patient.user.firstName} {patient.user.lastName}
                                                </li>
                                            ))}
                                        </ol>
                                    </fieldset>
                                    </div>
                                </div>
                                <div className='patients-register'>

                                    <button onClick={() => navigate('/register')}>Register a New Patient</button>
                                </div>
                            </div>
                            <div className='admin-patients-section2'>
                                <div className='patients-records'>

                                    <h2>Patient Health Records</h2>
                                    <div className='patients-recordscontent'>

                                        <div>
                                            <img src='/healthrecordspatient.png' alt='img' />
                                        </div>
                                        <div>
                                            <select onChange={handlePatientSelectForRecords} value={selectedPatient ? selectedPatient.id : ''}>
                                                <option value="">Select a Patient</option>
                                                {patients.map(patient => (
                                                    <option key={patient.id} value={patient.id}>
                                                        {patient.user.firstName} {patient.user.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedPatient && (
                                                <div>
                                                    <fieldset>
                                                    <h3>Past Appointments</h3>
                                                    <ul>
                                                        {pastAppointments.map((appointment, index) => (
                                                            <li key={index}>
                                                                {appointment.date} - {appointment.time} with {appointment.doctorName}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <h3>Past Prescriptions</h3>
                                                    <ul>
                                                        {pastPrescriptions.map((prescription, index) => (
                                                            <li key={index}>
                                                                {prescription.medicineName} - {prescription.dosage} for {prescription.duration} days
                                                                (Prescribed by {prescription.doctorName}, {prescription.pharmacyName})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    </fieldset>
                                                </div>

                                            )}

                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                    {currentView === 'doctors' && (
                        <div className='admin-doctors'>
                            <div className='admin-doctors-section1'>

                                <div className='doctors-list'>
                                    <h2>Doctors List</h2>
                                    <fieldset>
                                        <ol>
                                            {doctors.map(doctor => (
                                                <li key={doctor.id} onClick={() => handleDoctorClick(doctor)}>
                                                    {doctor.user.firstName} {doctor.user.lastName}
                                                </li>
                                            ))}
                                        </ol>
                                    </fieldset>
                                </div>
                                <div className='doctors-register'>


                                    <button onClick={() => navigate('/register-doctor')}>Register a New Doctor</button>
                                </div>
                            </div>
                            <div className='doctors-details'>

                                <div className='doctors-detailssection1' >
                                    <h2>Doctors details</h2>

                                    <select onChange={handleDoctorSelect} value={selectedDoctor || ''}>
                                        <option value="" >Select a doctor</option>
                                        {doctors.map(doctor => (

                                            <option key={doctor.id} value={(doctor.id)}>
                                                {doctor.user.firstName} {doctor.user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedDoctor && selectedDoctorDetails && (
                                        <>
                                            <div className='doctordetails'>
                                                {/* <h2>Other Details</h2> */}
                                                <p>Specialization: {selectedDoctorDetails.specialization}</p>
                                                <p>Years of Experience: {selectedDoctorDetails.yearsOfExperience}</p>
                                                <p>Education: {selectedDoctorDetails.education}</p>
                                                <p>licenseNumber: {selectedDoctorDetails.licenseNumber}</p>
                                            </div>
                                        </>
                                    )}
                                </div>


                                {selectedDoctor && (
                                    <>

                                        <div className='doctors-detailssection2' >
                                            <div className='doctors-patients'>
                                                <h3>Doctor's Patients</h3>
                                                <fieldset>
                                                    <ol>
                                                        {doctorPatients.map(patient => (
                                                            <li key={patient.id}>
                                                                {patient.user.firstName} {patient.user.lastName}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </fieldset>
                                            </div>
                                            <div className='doctors-appointments'>
                                                <h3>Doctor's Appointments</h3>
                                                
                                                    <table>
                                                    <fieldset>
                                                        <thead>
                                                        
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Time</th>
                                                                <th>Patient</th>
                                                                <th>Reason</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {doctorAppointments.map(appointment => (
                                                                <tr key={appointment.id}>
                                                                    <td>{appointment.date}</td>
                                                                    <td>{appointment.time}</td>
                                                                    <td>{appointment.patientName}</td>
                                                                    <td>{appointment.reason}</td>
                                                                    <td>
                                                                        <button onClick={() => handleDeleteAppointment(appointment.id)}>Delete</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        </fieldset>
                                                    </table>
                                                
                                            </div>
                                        </div>

                                    </>
                                )}
                            </div>

                        </div>
                    )}


                    {currentView === 'about-us' && (
                        <div>
                            <h1>About Us</h1>
                            <p>About Us content goes here.</p>
                        </div>
                    )}
                    {currentView === 'contact' && (
                        <div>
                            <h1>Contact</h1>
                            <p>Contact content goes here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
