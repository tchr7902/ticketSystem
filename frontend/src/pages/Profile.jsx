import React, { useContext, useState } from 'react';
import { AuthContext } from '../utils/authContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';
import logo from '../images/gem_logo.png';
import user_logo from '../images/user_icon.png';

const ProfilePage = () => {
    const { user, logout, changePassword } = useContext(AuthContext);
    const navigate = useNavigate();


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const stores = [
        { store_id: 1, store_name: "Headquarters" },
        { store_id: 2, store_name: "Warehouse" },
        { store_id: 3, store_name: "American Fork" },
        { store_id: 4, store_name: "Spanish Fork" },
        { store_id: 5, store_name: "Orem" },
        { store_id: 6, store_name: "Riverdale" },
        { store_id: 7, store_name: "Sandy" },
        { store_id: 8, store_name: "Park City" },
        { store_id: 9, store_name: "Layton" },
    ];

    const getStoreName = (store_id) => {
        const store = stores.find(store => store.store_id === store_id);
        return store ? store.store_name : "Unknown Store";
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const backButton = () => {
        navigate('/tickets')
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setTimeout(() => toast.error("Passwords do not match."), 100);
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setTimeout(() => toast.success("Password changed successfully!"), 100);
        } catch (err) {
            setTimeout(() => toast.error("Failed to change password."), 100);
            console.error("Password change error:", err);
        }
    };

    if (!user) {
        return <p className="text-center text-danger mt-5">No user logged in.</p>;
    }

    return (
    <div className="container mt-5">
            {/* Toast Container */}
            <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
        />
    <nav className="profile-navbar">
        <button className="btn btn-outline-secondary mt-3" onClick={backButton}>Back</button>
        <img src={logo} alt="Logo" style={{ width: '375px', height: '86px', marginRight: '30px' }} />
        <button className="btn-important btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
    </nav>
    <nav className="backup-profile-navbar">
        <button className="btn btn-outline-secondary mt-3" onClick={backButton}>Back</button>
        <button className="btn-important btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
    </nav>
            <div className="my-info">
                <img 
                    className="responsive-icon" 
                    src={user_logo} 
                    alt="user icon" 
                />
                <h4>Hello, {user.first_name}!</h4>
                <p>{user.email}</p>
                <p>{getStoreName(user.store_id)}</p>
            </div>
                <div className="change-pass">
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
                <button type="submit" className="btn btn-primary">
                    Confirm
                </button>
            </form>
        </div>
    </div>
    );
};

export default ProfilePage;
