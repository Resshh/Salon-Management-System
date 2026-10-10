import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorToast from "./components/ErrorToast";

import CustomerDashboard from "./components/customer/CustomerDashboard";
import StylistDashboard from "./components/stylist/StylistDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";


function App() {

  return (
    <BrowserRouter>

      {/* Shows errors sent by showError() from any page */}
      <ErrorToast />

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

        {/* Customer  (the * means: /customer and every page under it) */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute role="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Stylist */}
        <Route
          path="/stylist/*"
          element={
            <ProtectedRoute role="stylist">
              <StylistDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
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