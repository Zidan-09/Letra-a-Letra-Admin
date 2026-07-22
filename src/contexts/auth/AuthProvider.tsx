import { useState, type ReactNode } from "react";
import { AuthContext, type Auth } from "./AuthContext";

interface Props {
    children: ReactNode;
}

export function AuthProvider({ children }: Props) {
    const [auth, setAuth] = useState<Auth | null>(() => {
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("id");

        if (!token || !id)
            return null;

        return {
            token,
            id
        };
    });

    function login(authData: Auth) {
        localStorage.setItem("token", authData.token);
        localStorage.setItem("id", authData.id);

        setAuth(authData);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("id");

        setAuth(null);
    }

    return (
        <AuthContext.Provider
            value={{
                ...auth,
                login,
                logout
            } as any}
        >
            {children}
        </AuthContext.Provider>
    );
}