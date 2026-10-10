import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Message from "./Message";

function Login() {
    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // true = the password is shown as normal text
    const [showPassword, setShowPassword] = useState(false);

    // Reaching the login page (Back button, typed URL, Logout) ends the
    // session, so the Forward button cannot open a dashboard without login.
    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }, []);


    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(
                "/user/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            // Open the dashboard with a full page load, so the app
            // starts fresh as the new user
            // (the same way Logout goes back to /login).
            window.location.href = `/${response.data.role}`;

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Login failed"
            });
        }
    };

    return (
        <div className="login-page">

            <div className="login-left">
                <div className="brand">
                    <h1>BEAUTÉ</h1>
                    <p>Beauty. Style. You.</p>
                </div>

                <div className="login-content">
                    <p className="small-heading">
                        WHERE BEAUTY FEELS LIKE YOU
                    </p>

                    <h2>
                        Your Beauty,
                        <br />
                        <span>Your Style.</span>
                    </h2>

                    <p className="description">
                        Personalized salon experiences
                        <br />
                        for every version of you.
                    </p>
                </div>
            </div>

            <div className="login-right">

                <div className="login-box">

                    <h2>Welcome Back</h2>

                    <p className="login-subtitle">
                        Log in to your account
                    </p>

                    <form onSubmit={handleLogin}>

                        <label>Email</label>

                        <div className="input-wrap">

                            {/* envelope icon */}
                            <svg
                                className="input-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                aria-hidden="true"
                            >
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M3 7l9 6 9-6" />
                            </svg>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />

                        </div>

                        <label>Password</label>

                        <div className="input-wrap">

                            {/* lock icon */}
                            <svg
                                className="input-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                aria-hidden="true"
                            >
                                <rect x="5" y="11" width="14" height="9" rx="2" />
                                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                            </svg>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />

                            {/* eye icon: click to show or hide the password */}
                            <button
                                type="button"
                                className="eye-button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    aria-hidden="true"
                                >
                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                    {!showPassword && <path d="M4 4l16 16" />}
                                </svg>
                            </button>

                        </div>

                        <button type="submit">
                            Login
                        </button>

                    </form>

                    <div className="or-line">
                        <span>OR</span>
                    </div>

                    <p className="register-text">
                        Don't have an account?
                        {" "}
                        <Link to="/register">
                            <span>Register</span>
                        </Link>
                    </p>

                </div>

            </div>

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </div>
    );
}

export default Login;