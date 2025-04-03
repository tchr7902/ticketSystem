import React, { useState, useContext, useEffect } from "react";
import { loginUser, registerUser } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { useNavigate } from "react-router-dom";
import { Modal, Form } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import ForgotPasswordPage from "../components/ForgotPass.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import lightLogo from '../images/gem_logo.png';
import darkLogo from '../images/gem_logo_white.png';
import logo2 from '../images/gem-singlelogo.png';
import '../styles/App.css';

function LoginPage() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [store_id, setStoreId] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); 
    const [logo, setLogo] = useState('../images/gem_logo.png');
    const navigate = useNavigate();

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

    const handlePhoneNumberChange = (e) => {
        let input = e.target.value.replace(/\D/g, "");
        if (input.length > 10) input = input.slice(0, 10);
    
        let formatted = input;
        if (input.length > 6) {
            formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
        } else if (input.length > 3) {
            formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
        } else if (input.length > 0) {
            formatted = `(${input}`;
        }
    
        setPhoneNumber(formatted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        if (isRegister && password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
    
        try {
            let loginResponse;
    
            if (isRegister) {
                if (password.length < 8) {
                    setError("Password must be at least 8 characters long.");
                    setLoading(false);
                    return;
                }
                if (!/[A-Z]/.test(password)) {
                    setError("Password must contain at least one uppercase letter.");
                    setLoading(false);
                    return;
                }
                if (!/[!@#$%^&*]/.test(password)) {
                    setError("Password must contain at least one special character.");
                    setLoading(false);
                    return;
                }
    
                // Attempt to register the user
                try {
                    await registerUser(email, password, first_name, last_name, phone_number, store_id);
    
                    // Delay before login attempt
                    setTimeout(async () => {
                        try {
                            loginResponse = await loginUser(email, password);
                            const { access_token, user } = loginResponse;
    
                            // Save access token and user info in context
                            login(access_token, user);
    
                            // Redirect based on user role
                            navigate(user.role === 'admin' ? '/home' : '/home');
                        } catch (loginError) {
                            const backendMessage = loginError.response?.data?.error || "Login failed after registration. Please check your credentials and try again.";
                            setError(backendMessage);
                        }
                        setLoading(false);
                    }, 500); // Delay to prevent immediate login after registration
    
                } catch (registrationError) {
                    const backendMessage = registrationError.response?.data?.error || "An error occurred during registration. Please try again.";
                    setError(backendMessage);
                    setLoading(false);
                }
    
            } else {
                // Existing user login
                try {
                    loginResponse = await loginUser(email, password);
                    const { access_token, user } = loginResponse;
    
                    // Save access token and user info in context
                    login(access_token, user);
    
                    // Redirect based on user role
                    navigate(user.role === 'admin' ? '/home' : '/home');
                } catch (loginError) {
                    const backendMessage = loginError.response?.data?.error || "Invalid credentials. Please try again.";
                    setError(backendMessage);
                    setLoading(false);
                }
            }
        } catch (generalError) {
            setError("An unexpected error occurred. Please try again later.");
            setLoading(false);
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
        <div className="container login-div">
            <img className="img-1" 
                src={logo} 
                alt="Logo" 
                style={{ width: '469px', height: '108px', marginBottom: '20px'}} 
            />
            <img className="img-2 mt-2" 
                src={logo2} 
                alt="Logo2" 
                style={{ width: '150px', height: '150px', marginBottom: '20px'}} 
            />
            <h1 style={{ marginBottom: '20px'}}><strong>IT Support Hub</strong></h1>
            <div className="register-card" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 className="text-center mb-4">
                    {isRegister ? "Register" : "Login"}
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
                            autoComplete="email"
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
                            autoComplete="current-password"
                        />
                    </div>
                    {isRegister && (
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
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Phone Number"
                                    value={phone_number}
                                    onChange={handlePhoneNumberChange}
                                    maxLength={14}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <select
                                    className="form-select"
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
                    )}
                    <button 
                        type="submit" 
                        className="btn-login w-100 mb-3" 
                        disabled={loading}
                    >
                        {loading ? "Loading..." : (isRegister ? "Register" : "Login")}
                    </button>
                    <p 
                        className="text-center mt-3 text-decoration-underline" 
                        style={{ cursor: "pointer" }} 
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister 
                            ? "Already have an account? Login" 
                            : "Don't have an account? Register"}
                    </p>
                    <p 
                        className="text-center text-decoration-underline" 
                        style={{ cursor: "pointer" }}
                        onClick={() => setModalVisible(true)} // Open modal on click
                    >
                        Forgot your password?
                    </p>
                </form>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </div>

            {/* React-Bootstrap Modal */}
            <Modal show={modalVisible} onHide={() => setModalVisible(false)} centered>
                <Modal.Header>
                        <Modal.Title>
                            <h3 className="m-0">Forgot Password?</h3>
                        </Modal.Title>
                        <FaTimes
                        className="close-modal-times"
                        onClick={() => {
                            setModalVisible(false);
                        }}
                    ></FaTimes>
                </Modal.Header>
                <Modal.Body>
                    <ForgotPasswordPage />
                </Modal.Body>
            </Modal>

        </div>
    );
}

export default LoginPage;
