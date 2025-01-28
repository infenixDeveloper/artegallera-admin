import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("authToken");

  return token ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
