import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import StylistDashboard from "./components/stylist/StylistDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import "./App.css";
function App() {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    return (
        <BrowserRouter>
            <Routes>

                {/* Public route */}
                <Route path="/login" element={<Login />} />

                {/* Customer route */}
                <Route
                    path="/customer"
                    element={
                        token && role === "customer"
                            ? <CustomerDashboard />
                            : <Navigate to="/login" />
                    }
                />

                {/* Stylist route */}
                <Route
                    path="/stylist"
                    element={
                        token && role === "stylist"
                            ? <StylistDashboard />
                            : <Navigate to="/login" />
                    }
                />

                {/* Admin route */}
                <Route
                    path="/admin"
                    element={
                        token && role === "admin"
                            ? <AdminDashboard />
                            : <Navigate to="/login" />
                    }
                />

                {/* Default route */}
                <Route
                    path="*"
                    element={<Navigate to="/login" />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;