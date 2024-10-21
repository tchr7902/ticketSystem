import React, { useState, useContext } from "react";
import { loginUser, registerUser } from "../utils/api";
import { AuthContext } from "../utils/authContext.js";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = isRegister
                ? await registerUser(email, password)
                : await loginUser(email, password);

            // On successful login or registration, store the token and user data
            login(data.access_token, data.user);
            navigate("/tickets"); // Redirect to the ticket page
        } catch (err) {
            console.error("Auth error:", err);
            setError("Authentication failed. Please try again.");
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
                <button type="submit">{isRegister ? "Register" : "Login"}</button>
                <p onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                </p>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default LoginPage;
