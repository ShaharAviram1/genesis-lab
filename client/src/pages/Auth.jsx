import { useState } from 'react';
import { useNavigate } from 'react-router';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
        fetch('http://localhost:3000' + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            if (data.success) {
                localStorage.setItem('token', data.token);
                onAuthSuccess({ username: data.user?.username || username, token: data.token });
                navigate('/lab-simulation');
            } else {
                setError(data.error || 'Authentication failed');
            }
        })
        .catch(err => {
            setLoading(false);
            setError('Connection error. Please try again.' + (err.message ? ` (${err.message})` : ''));
        });
    };

    const handleModeSwitch = (loginMode) => {
        setIsLoginMode(loginMode);
        setError(null);
    };

    const submitLabel = loading
        ? (isLoginMode ? 'Logging in…' : 'Creating profile…')
        : (isLoginMode ? 'Enter Lab' : 'Create Profile');

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-wordmark">Genesis Lab</h1>
                <p className="auth-subtitle">Enter the reactor.</p>

                <div className="auth-toggle">
                    <div className={`auth-toggle-indicator auth-toggle-indicator--${isLoginMode ? 'login' : 'register'}`} />
                    <button
                        type="button"
                        className={`auth-toggle-btn${isLoginMode ? ' auth-toggle-btn--active' : ''}`}
                        onClick={() => handleModeSwitch(true)}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`auth-toggle-btn${!isLoginMode ? ' auth-toggle-btn--active' : ''}`}
                        onClick={() => handleModeSwitch(false)}
                    >
                        Register
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                        required
                    />
                    <p className="auth-helper">
                        {isLoginMode ? 'Continue your current universe.' : 'Start a new universe.'}
                    </p>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {submitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
