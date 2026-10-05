import { useState } from "react";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

            console.log("Login successful");
            console.log("Role:", response.data.role);

        } catch (error) {
            console.log(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    return (
        <div>
            <h1>Salon Login</h1>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;