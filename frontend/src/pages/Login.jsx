import React, { useState, useContext } from "react";
import { loginUser, registerUser } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/gem_logo.png';
import '../styles/App.css';

function LoginPage() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            if (isRegister) {
                await registerUser(email, password);
            }


            const data = await loginUser(email, password);

            console.log('Login response:', data);
            login(data.access_token, data.user); 
            navigate("/tickets"); 
        } catch (err) {
            console.error("Auth error:", err);
            setError("Login/registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <img 
                src={logo} 
                alt="Logo" 
                style={{ width: '469px', height: '108px', marginBottom: '40px'}} 
            />
            <h1 style={{ marginBottom: '40px'}}><strong>IT Tickets</strong></h1>
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
                    )}
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 mb-3" 
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