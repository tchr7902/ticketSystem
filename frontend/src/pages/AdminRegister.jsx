import React, { useState, useContext } from "react";
import { registerAdmin } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/gem_logo.png';
import { FaUserPlus } from 'react-icons/fa';
import '../styles/App.css';

function AdminRegister() {
    const { logout } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [store_id, setStoreId] = useState("");
    const [last_name, setLastName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    const navigate = useNavigate();

    const backButton = () => {
        navigate('/tickets');
    }

    const handleLogout = () => {
        logout();
        navigate('/users/login');
    };

    const showToast = (message, type = "success") => {
        toast(message, { type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
    
        try {
            await registerAdmin(email, password, first_name, last_name, store_id);
            showToast("Registration successful!", "success");
        } catch (err) {
            console.error("Auth error:", err);
            showToast("Error registering admin. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="container mt-5 d-flex flex-column align-items-center vh-100">
            <ToastContainer
                    position="top-center"
                    autoClose={3000}
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
            <nav className="register-navbar">
                <button className="btn-2 mt-3" onClick={backButton}>Back</button>
                <img src={logo} alt="Logo" style={{ width: '375px', height: '86px' }} />
                <button className="btn-important mt-3" onClick={handleLogout}>Logout</button>
            </nav>
            <nav className="backup-register-navbar">
                <button className="btn-2 mt-3" onClick={backButton}>Back</button>
                <FaUserPlus className="register-icon" />
                <button className="btn-important btn-outline-danger mt-3" onClick={handleLogout}>Logout</button>
            </nav>
            <div className="register-admin-card p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">
                    {"Register An Admin"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                        <>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First Name"
                                    value={first_name}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last Name"
                                    value={last_name}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <select
                                    className="form-control"
                                    value={store_id}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Store</option>
                                    {stores.map((store) => (
                                        <option key={store.store_id} value={store.store_id}>
                                            {store.store_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    <button 
                        type="submit" 
                        className="btn-2 w-100 mb-3" 
                        disabled={loading}
                    >
                        {"Register"}
                    </button>
                </form>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </div>
        </div>
    );
}

export default AdminRegister;
