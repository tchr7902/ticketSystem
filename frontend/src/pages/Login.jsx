import React, { useState, useContext } from "react";
import { loginUser, registerUser } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { useNavigate } from "react-router-dom";

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
            
            console.log('Login response:', data)

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
        <div>
            <h2>{isRegister ? "Register" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : (isRegister ? "Register" : "Login")}
                </button>
                <p onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                </p>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default LoginPage;
