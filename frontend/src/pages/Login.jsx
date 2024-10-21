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
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // New loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        setError(""); // Clear previous errors
        try {
            const data = isRegister
                ? await registerUser(email, password)
                : await loginUser(email, password);
            
            console.log('Login response:', data);

            login(data.access_token, data.user);
            navigate("/tickets"); // Redirect to the ticket page
        } catch (err) {
            console.error("Auth error:", err);
            setError("Authentication failed. Please try again.");
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <img 
                src={logo} 
                alt="Logo" 
                style={{ width: '370px', height: '100px', marginBottom: '40px'}} // Added margin for spacing below the logo
            />
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
