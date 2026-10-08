import { Navigate } from "react-router-dom";

// Wraps a page that needs a login.
// "role" is the role that may open the page, "children" is the page itself.
function ProtectedRoute({ role, children }) {

    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    // Not logged in: go to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Logged in with another role: go to that role's own dashboard
    if (savedRole !== role) {
        return <Navigate to={`/${savedRole}`} replace />;
    }

    return children;

}

export default ProtectedRoute;
