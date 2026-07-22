import { HTTPS, type HttpResponse } from "./config";

type LoginBody = {
    id: string,
    token: string
}

type MeBody = {
    admin: {
        id: string;
        username: string;
        email: string;
    }
}

class Login {
    static async login(email: string, password: string) {
        const res = await fetch(`${HTTPS}/admin/auth`, {
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

        const res = await fetch(`${HTTPS}/admin/me`, {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}` 
            }
        });

        const response: HttpResponse<MeBody> = await res.json();

        return response;
    }
}

export { Login }