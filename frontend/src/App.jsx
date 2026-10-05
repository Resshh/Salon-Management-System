import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";

import CustomerDashboard from "./components/customer/CustomerDashboard";
import StylistDashboard from "./components/stylist/StylistDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";


function App() {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Customer */}
        <Route
          path="/customer"
          element={
            token && role === "customer"
              ? <CustomerDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Stylist */}
        <Route
          path="/stylist"
          element={
            token && role === "stylist"
              ? <StylistDashboard />
              : <Navigate to="/login" />
          }
        />

        {/* Admin */}
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
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/login" />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;