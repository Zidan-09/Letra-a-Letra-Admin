import { apiFetch } from "../../../lib/http";

type LoginBody = {
    id: string,
    token: string
}

export type Key =
"USER" |
"LOGS" |
"ADMIN" |
"ITEMS" |
"GAME" |
"LEVELS" |
"OFFERS" |
"TRANSACTIONS" |
"AUDIT" |
"TICKET";

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
        return apiFetch<LoginBody>("/admin/auth", {
            method: "POST",
            auth: false,
            body: {
                email,
                password
            }
        });
    }

    static async me() {
        return apiFetch<MeBody>("/admin/me", {
            method: "GET"
        });
    }

    static async forgotPassword(email: string) {
        await apiFetch<Record<string, never>>("/admin/auth/forgot-password", {
            method: "POST",
            auth: false,
            body: {
                email
            }
        });
    }
}

export { LoginRequests }