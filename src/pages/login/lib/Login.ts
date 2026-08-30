import { API_URL, type HttpResponse } from "../../../lib/config";

type LoginBody = {
    id: string,
    token: string
}

export type Key = 
"USER" | 
"LOGS" | 
"ADMIN" | 
"COSMETIC" | 
"GAME" | 
"LEVELS" | 
"OFFERS" | 
"TRANSACTIONS";

export type Action = 
"VIEW" | 
"CREATE" | 
"EDIT" | 
"DELETE" | 
"TOGGLE";

type Permission = {
    key: Key;
    actions: Action[];
}

type MeBody = {
    admin: {
        id: string;
        username: string;
        email: string;
        permissions: Permission[];
    }
}

class LoginRequests {
    static async login(email: string, password: string) {
        const res = await fetch(`${API_URL}/admin/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password
            })
        });

        const response: HttpResponse<LoginBody> = await res.json();

        return response;
    }

    static async me() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/admin/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });

        const response: HttpResponse<MeBody> = await res.json();

        return response;
    }

    static async forgotPassword(email: string) {
        const res = await fetch(`${API_URL}/admin/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        });

        if (!res.ok) throw new Error();
    }
}

export { LoginRequests }