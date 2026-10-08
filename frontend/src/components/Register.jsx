import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "./Message";

function Register() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    // true = the password is shown as normal text
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {

            const response = await axios.post(
                "http://localhost:5000/api/user/register",
                {
                    name,
                    email,
                    password,
                    phone,
                    gender,
                    dateOfBirth
                }
            );

            console.log(response.data);

            setMessage({
                type: "success",
                text: "Registration successful"
            });

            // Give the user a moment to read the message, then open the login page
            setTimeout(() => navigate("/login"), 1500);

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Registration failed"
            });
        }
    };

    return (
        <div className="register-page">

            <div className="register-left">

                <div className="brand">
                    <h1>BEAUTÉ</h1>
                    <p>Beauty. Style. You.</p>
                </div>

                <div className="register-content">

                    <p className="small-heading">
                        YOUR BEAUTY JOURNEY STARTS HERE
                    </p>

                    <h2>
                        Your Beauty,
                        <br />
                        <span>Your Style.</span>
                    </h2>

                    <p className="description">
                        Create your BEAUTÉ account and
                        <br />
                        discover personalized salon experiences.
                    </p>

                </div>

            </div>


            <div className="register-right">

                <div className="register-box">

                    <h2>Create Account</h2>

                    <p className="register-subtitle">
                        Join the Beauté experience
                    </p>

                    <form onSubmit={handleRegister}>

                        <label>Name</label>

                        <div className="input-wrap">

                            {/* person icon */}
                            <svg
                                className="input-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                            </svg>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                        </div>


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
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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


                        <label>Phone</label>

                        <div className="input-wrap">

                            {/* phone icon */}
                            <svg
                                className="input-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                aria-hidden="true"
                            >
                                <rect x="7" y="3" width="10" height="18" rx="2" />
                                <path d="M11 18h2" />
                            </svg>

                            <input
                                type="text"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />

                        </div>


                        <label>Gender</label>

                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value="">
                                Select gender
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>


                        <label>Date of Birth</label>

                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) =>
                                setDateOfBirth(e.target.value)
                            }
                            required
                        />


                        <button type="submit">
                            Create Account
                        </button>

                    </form>


                    <div className="or-line">
                        <span>OR</span>
                    </div>

                    <p className="login-text">
                        Already have an account?
                        <span onClick={() => navigate("/login")}>
                            {" "}Login
                        </span>
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

export default Register;