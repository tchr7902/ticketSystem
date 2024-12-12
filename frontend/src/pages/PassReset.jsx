import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from '../utils/authContext';
import { resetPassword } from "../utils/api"; 
import { Tooltip } from 'react-tooltip'
import 'bootstrap/dist/css/bootstrap.min.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';
import '../styles/App.css';
import { ToastContainer, toast, Bounce } from 'react-toastify'; 
import { FaSignOutAlt } from 'react-icons/fa';

function PassReset() {
    const navigate = useNavigate();
    const location = useLocation();
    const [logo, setLogo] = useState('../images/gem_logo.png');
    const pathParts = location.pathname.split('/');
    const resetToken = pathParts[pathParts.length - 1];
    const { logout } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        
        // Validation for password fields
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }
        
        if (!/[!@#$%^&*]/.test(newPassword)) {
            setError("Password must contain at least one special character.");
            return;
        }

        // Reset password API call
        try {
            await resetPassword(resetToken, newPassword);
            toast.success('Password reset successfully!');
            setSuccessMessage("Your password has been reset. You can now log in with your new password.");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to login after successful reset
            setTimeout(() => navigate("/login"), 9000);
        } catch (err) {
            toast.error('Failed to reset password. Please try again.');
        }
    };

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme == 'light') {
        setLogo(lightLogo);
        } else if (theme == 'dark') {
        setLogo(darkLogo);
        }
    })


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
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <FaSignOutAlt className="react-icon" size={50} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Login Page"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <nav className="backup-profile-navbar">
            <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
            <FaSignOutAlt className="react-icon" size={40} onClick={handleLogout}
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                data-tooltip-delay-show={300}></FaSignOutAlt>
            </nav>
            <Tooltip id="logout-tooltip" />
            <div className="change-div">
                <div className="col-md-6 change">
                    <h3 className="mb-4">Reset Password</h3>
                    {error && <p className="text-danger">{error}</p>}
                    {successMessage && <p className="text-success">{successMessage}</p>}
                    <form onSubmit={handlePasswordReset}>
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
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PassReset;
