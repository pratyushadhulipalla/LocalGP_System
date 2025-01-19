
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css';
import  { jwtDecode } from 'jwt-decode';



const Login = () => {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [otp, setOtp] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [showOtpInput, setShowOtpInput] = useState(false);
   const { login } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleContactClick = () => {
    navigate('/contact');
};

const handleAboutUsClick = () => {
    navigate('/AboutUs');
};


   const handleLogin = async (e) => {
       e.preventDefault();
       setErrorMessage('');
       console.log("Attempting login with", username, password); // Debug log
       
       try {
           const response = await axios.post('/api/auth/login', { username, password });
           console.log("Login response:", response.data); // Debug log
           const userData = response.data; // assuming the user data is returned on successful login
           
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    
    console.log("Stored user data:", userData); // Check if patientId is present here

           if (response.status === 200) {
            setShowOtpInput(true);
           }
       } catch (error) {
        console.error("Login error:", error.response ? error.response.data : error); // Debug log
        if (error.response && error.response.status === 401) {
            setErrorMessage("Incorrect username or password. Please try again.");
        } else if (error.response && error.response.data && error.response.data.message) {
            setErrorMessage(error.response.data.message);
        } else {
            setErrorMessage("Login failed");
        }
       }
   };


   const handleOtpVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    console.log("Attempting OTP verification with", otp); // Debug log
    try {
        const response = await axios.post('/api/auth/verify-otp', { username, otp });
        console.log("OTP verification response:", response.data); // Debug log

        const token = response.data.token;
        
            const decodedToken = jwtDecode(token);
            const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const user = { 
               
                username, 
                roles,
                patientId: response.data.user.patientId,  // Add patientId if exists
            doctorId: decodedToken.doctorId || null,// Add doctorId if exist
            userId: response.data.user.id    
             };
             
            
              // Store user data and token in local storage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        // localStorage.setItem('userId', JSON.stringify(userId));
            login(token, user);

             // Check user roles and navigate accordingly
             console.log("User roles:", roles); // Debug log
             if (roles.includes('Admin')) {
                 navigate('/admin');
             } else if (roles.includes('Doctor')) {
                 navigate('/doctor');}
                else if (roles.includes('')) {
                    navigate('/patient');
             } else {
                 navigate('/patient');
             }

            // navigate('/patient/');  // Redirect to dashboard or protected route
    } catch (error) {
        console.error("OTP verification error:", error.response ? error.response.data : error); // Debug log
        if (error.response && error.response.data && error.response.data.message) {
            setErrorMessage(error.response.data.message);
        } else {
            setErrorMessage("OTP verification failed");
        }
    }
};


   return (
       <div className="login_container">
        <div className="login_navbar">
                <div className="title">  
                          <i className="fas fa-heartbeat"></i>
                     An Automated System for Local GPs</div>
                <div className="login_nav-links">
                   <button onClick={handleAboutUsClick}>AboutUs</button>
                    <button onClick={handleContactClick}>Contact</button>
                </div>
            </div>
            
         
           <div className="Loginform-container">
               <h2>Login</h2>
               {!showOtpInput ? (
               <form className='loginform' onSubmit={handleLogin}>
               {errorMessage && <p className="error">{errorMessage}</p>}
                   <div className='login_field'>
                       <label>Username</label>
                       <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                       <label>Password</label>
                       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                   </div>
                   <div className="Loginbutton-group">
                       <button type="submit" onClick={handleLogin}>Login</button>
                   </div>
                   {/* <div className="forgot-password">
                   <a onClick={() => navigate('/forgot-password')}>Forgot Password?</a>
               </div> */}
    
               <div className="create-account">
               <span className="small-text">Don't have an account?</span>  <a href="/register">Create an account</a>
                    </div>
               </form>
               ) : (
                <form className='loginform' onSubmit={handleOtpVerify}>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                    <div>
                        <label>Enter OTP</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>
                    <div className="Loginbutton-group">
                        <button type="submit">Verify OTP</button>
                    </div>
                </form>
            )}
           </div>
       </div>
   );
};


export default Login;






