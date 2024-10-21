import React, { useContext } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';

const User = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div>
            <h2>User Profile</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default User;