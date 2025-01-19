import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { authState, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <h1>Welcome, {authState.user?.username}</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
