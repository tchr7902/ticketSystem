import React, { useContext } from 'react';
import { AuthContext } from '../utils/authContext'; 

const SettingsPage = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <p className="text-center text-danger mt-5">No user logged in.</p>;
    }

    return (
        <div className="container mt-5">
            <h2>Settings</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
        </div>
    );
};

export default SettingsPage;
