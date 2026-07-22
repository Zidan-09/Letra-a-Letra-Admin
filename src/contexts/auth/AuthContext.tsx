import { createContext } from "react";

export type Auth = {
    id: string;
    token: string;
}

export type AuthContextData = {
    id: string;
    token: string;
    login: (auth: Auth) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextData | null>(null);