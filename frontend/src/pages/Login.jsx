import React, { useState, useContext } from "react";
import { loginUser, registerUser } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/gem_logo.png';
import logo2 from '../images/gem-singlelogo.png';
import '../styles/App.css';

function LoginPage() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [store_id, setStoreId] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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
                // Register the user
                await registerUser(email, password, first_name, last_name, store_id);
                console.log('Registration successful');
    
                // Log in the user after registration
                loginResponse = await loginUser(email, password);
            } else {
                // Log in existing user
                loginResponse = await loginUser(email, password);
            }
    
            const { access_token, user } = loginResponse;
    
            // Save access token and user info in context
            login(access_token, user);
    
            // Redirect based on user role
            if (user.role === 'admin') {
                navigate('/tickets'); // Redirect admin to all tickets
            } else {
                navigate('/tickets'); // Regular user route
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError("Login/registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <img className="img-1" 
                src={logo} 
                alt="Logo" 
                style={{ width: '469px', height: '108px', marginBottom: '20px'}} 
            />
            <img className="img-2" 
                src={logo2} 
                alt="Logo2" 
                style={{ width: '150px', height: '150px', marginBottom: '20px'}} 
            />
            <h1 style={{ marginBottom: '20px'}}><strong>IT Support Hub</strong></h1>
            <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
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
                    )}
                    <button 
                        type="submit" 
                        className="btn w-100 mb-3" 
                        disabled={loading}
                    >
                        {loading ? "Loading..." : (isRegister ? "Register" : "Login")}
                    </button>
                    <p 
                        className="text-center text-secondary" 
                        style={{ cursor: "pointer" }} 
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister 
                            ? "Already have an account? Login" 
                            : "Don't have an account? Register"}
                    </p>
                </form>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </div>
        </div>
    );
}

export default LoginPage;
