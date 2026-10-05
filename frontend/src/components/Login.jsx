import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            if (response.data.role === "customer") {
                navigate("/customer");
            } else if (response.data.role === "stylist") {
                navigate("/stylist");
            } else if (response.data.role === "admin") {
                navigate("/admin");
            }

        } catch (error) {
            console.log(
                error.response?.data?.message || "Login failed"
            );
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
                        Confidence
                        <br />
                        Looks Good
                        <br />
                        <span>On You.</span>
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
                        Sign in to your BEAUTÉ account
                    </p>

                    <form onSubmit={handleLogin}>

                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <button type="submit">
                            LOGIN
                        </button>

                    </form>

                    <p className="register-text">
                        Don't have an account?
                        <span> Register</span>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;