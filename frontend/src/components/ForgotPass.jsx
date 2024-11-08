import React, { useState } from 'react';
import { forgotPassword } from "../utils/api";

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await forgotPassword(email);
            setMessage(response.message);
        } catch (err) {
            setError("Error sending password reset email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleForgotPasswordSubmit} className="d-flex flex-column justify-content-center align-items-center m-4">
                    <input
                        type="email"
                        className="form-control input-box-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                <button type="submit" className="btn-important" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
            {message && <p className="text-success d-flex justify-content-center">{message}</p>}
            {error && <p className="text-danger d-flex justify-content-center">{error}</p>}
        </div>
    );
}

export default ForgotPasswordPage;
