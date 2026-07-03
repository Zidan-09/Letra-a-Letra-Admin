import { HTTP, type HttpResponse } from "./config";

type LoginBody = {
    id: string,
    token: string
}

async function login(email: string, password: string) {
    const res = await fetch(`${HTTP}/auth`, {
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

export { login }