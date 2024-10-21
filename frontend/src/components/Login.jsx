import React, { useState, useContext } from 'react';
import { loginUser, registerUser } from '../utils/api.js';
import { AuthContext } from '../utils/authContext.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await registerUser(email, password);
                setIsRegister(false);;
            } else {
                const { access_token } = await loginUser(email,password);
                const payload = JSOn.parse(atob(access_token.split('.')[1]));
                login(access_token, payload);

                navigate(payload.role === 'admin' ? '/admin/tickets' : '/tickets');
            }
        } catch (err) {
            console.error('Error during login/registration:', err);
            setError('Invalid email or password');
        }
    };

    return (
        <div>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
                    />
                <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
            </form>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register here"}
            </button>
        </div>
    )
}

export default Login;