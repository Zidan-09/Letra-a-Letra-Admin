import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";

export function ProtectedLayout() {
    const token = useAuth();

    if (!token.token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}