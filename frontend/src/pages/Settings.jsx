import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png'
import settings_icon from '../images/settings_icon.png';

const SettingsPage = () => {
    const { user, logout, changePassword, changeEmail } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentEmail, setCurrentEmail] = useState(user ? user.email : "");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState(""); // State for confirm email
    const [emailError, setEmailError] = useState("");
    const [emailSuccessMessage, setEmailSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (user) {
            setCurrentEmail(user.email);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/tickets');
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
    
        // Check if the current email matches the user's actual email
        if (currentEmail !== user.email) {
            setTimeout(() => toast.error('Current email is not correct.'), 100);
            return;
        }
        
        // Check if the new email is valid
        if (!newEmail.includes('@goodearthmarkets.com')) {
            setTimeout(() => toast.error('Please enter a valid GEM email.'), 100);
            return;
        } 
        
        // Check if the new email and confirm email match
        else if (newEmail !== confirmEmail) {
            setTimeout(() => toast.error('Emails do not match!'), 100);
            return; 
        }
    
        try {
            // Call the function to update email in the database
            await changeEmail(currentEmail, newEmail);
            setNewEmail("");
            setConfirmEmail("");

            setTimeout(() => toast.success('Email updated successfully!'), 100);
        } catch (err) {
            setTimeout(() => toast.error('Failed to update email.'), 100);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setTimeout(() => toast.error('Passwords do not match.'), 100);
            return;
        }
        try {
            await changePassword(currentPassword, newPassword);
            setTimeout(() => toast.success('Password changed successfully!'), 100);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setTimeout(() => toast.error('Failed to change password.'), 100);
            console.error('Password change error:', err);
        }
    };

    if (!user) {
        return (
            <div className="loader-wrapper">
                <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="light"
                transition={Bounce}
            />
            <nav className="settings-navbar">
                <button className="btn-2" onClick={backButton}>
                    Back
                </button>
                <img
                    src={logo}
                    alt="Logo"
                    style={{ width: '375px', height: '86px'}}
                />
                <button className="btn-important" onClick={handleLogout}>
                    Logout
                </button>
            </nav>
            <nav className="backup-settings-navbar">
            <button className="btn-2" onClick={backButton}>Back</button>
            <img className="responsive-settings-icon" src={settings_icon} alt="user icon" />
            <button className="btn-important" onClick={handleLogout}>Logout</button>
            </nav>
            <div className="change-div">
                <div className="col-md-6 change">
                    <h3>Change Email</h3>
                    {emailError && <p className="text-danger">{emailError}</p>}
                    {emailSuccessMessage && <p className="text-success">{emailSuccessMessage}</p>}
                    <form onSubmit={handleEmailChange}>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control pass-form input-box"
                                placeholder="Current Email"
                                value={currentEmail}
                                onChange={(e) => setCurrentEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control pass-form input-box"
                                placeholder="New Email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control pass-form input-box"
                                placeholder="Confirm New Email"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-2">
                            Update Email
                        </button>
                    </form>
                </div>

                <div className="col-md-6 change">
                    <h3>Change Password</h3>
                    {error && <p className="text-danger">{error}</p>}
                    {successMessage && <p className="text-success">{successMessage}</p>}
                    <form onSubmit={handlePasswordChange}>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form input-box"
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form input-box"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control pass-form input-box"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-2">
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
