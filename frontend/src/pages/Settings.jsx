import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSignOutAlt } from 'react-icons/fa'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { Tooltip } from 'react-tooltip'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';

const SettingsPage = ({toggleTheme, theme}) => {
    const { user, logout, changePassword, changeEmail } = useContext(AuthContext);
    const navigate = useNavigate();
    const [logo, setLogo] = useState('../images/gem_logo.png');
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
        const theme = localStorage.getItem('theme');
        console.log(theme)
        if (theme == 'light') {
        setLogo(lightLogo);
        console.log(logo)
        } else if (theme == 'dark') {
        setLogo(darkLogo);
        console.log(logo)
        }
        if (user) {
            setCurrentEmail(user.email);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/home');
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
            setTimeout(() => toast.error(err.message), 100); 
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setTimeout(() => toast.error('Passwords do not match.'), 100);
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            toast.error("Password must contain at least one uppercase letter.");
            return;
        }
        
        if (!/[!@#$%^&*]/.test(newPassword)) {
            toast.error("Password must contain at least one special character.");
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
            <nav className="profile-navbar">
                <FaArrowLeft className="react-icon" size={40} onClick={backButton}
                data-tooltip-id="back-tooltip"
                data-tooltip-content="Back"
                data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <nav className="backup-profile-navbar">
                <FaArrowLeft className="react-icon" size={30} onClick={backButton}
                data-tooltip-id="back-tooltip"
                data-tooltip-content="Back"
                data-tooltip-delay-show={300}></FaArrowLeft>
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
                <FaSignOutAlt className="react-icon" size={30} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <div className="darkmode-div">
                <button 
                onClick={toggleTheme} className="btn-important">
                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
                </button>
            </div>
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
            <Tooltip id="logout-tooltip" />
            <Tooltip id="back-tooltip" />
        </div>
    );
};

export default SettingsPage;
