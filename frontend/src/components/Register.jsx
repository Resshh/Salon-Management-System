import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

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

            alert("Registration successful");

            navigate("/login");

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Registration failed"
            );
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
                        Become
                        <br />
                        Your Best
                        <br />
                        <span>Version.</span>
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
                        Join the BEAUTÉ experience
                    </p>

                    <form onSubmit={handleRegister}>

                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />


                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />


                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />


                        <label>Phone</label>

                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />


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
                            CREATE ACCOUNT
                        </button>

                    </form>


                    <p className="login-text">
                        Already have an account?
                        <span onClick={() => navigate("/login")}>
                            {" "}Login
                        </span>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;