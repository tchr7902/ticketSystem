import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../utils/api"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png';
import '../styles/App.css';
import { ToastContainer, toast, Bounce } from 'react-toastify'; 

function PassReset() {
    const navigate = useNavigate();
    const { token } = useParams();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        
        // Validation for password fields
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
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
            await resetPassword(token, newPassword);
            toast.success('Password reset successfully!');
            setSuccessMessage("Your password has been reset. You can now log in with your new password.");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to login after successful reset
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            toast.error('Failed to reset password. Please try again.');
            console.error('Password reset error:', err);
        }
    };

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
            </nav>
            <nav className="backup-profile-navbar">
                <img src={logo2} alt="Logo" style={{ width: '91px', height: '91px' }} />
            </nav>
            <div className="change-div">
                <div className="col-md-6 change">
                    <h3>Reset Password</h3>
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
