import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';

const ProfilePage = () => {
    const { user, logout, changePassword } = useContext(AuthContext);
    const navigate = useNavigate();


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/tickets')
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setSuccessMessage("Password changed successfully!");
        } catch (err) {
            setError("Failed to change password. Please try again.");
            console.error("Password change error:", err);
        }
    };

    if (!user) {
        return <p className="text-center text-danger mt-5">No user logged in.</p>;
    }

    return (
    <div className="container mt-5">
    <navbar className="profile-navbar">
        <button className="btn btn-outline-secondary mt-3" onClick={backButton}>Back</button>
        <img src={logo} alt="Logo" style={{ width: '375px', height: '86px', marginRight: '30px' }} />
        <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
    </navbar>
            <div className="my-info">
                <h2>My Profile</h2>
                <p><strong>Email:</strong> {user.email}</p>
            </div>
                <div className="change-pass">
                    <h3>Change Password</h3>
                    {error && <p className="text-danger">{error}</p>}
                    {successMessage && <p className="text-success">{successMessage}</p>}
                    <form onSubmit={handlePasswordChange}>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form"
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                <button type="submit" className="btn btn-primary">
                    Confirm
                </button>
            </form>
        </div>
    </div>
    );
};

export default ProfilePage;
