import { HTTP, type HttpResponse } from "./config";

type body = {
    id: string,
    token: string
}

async function login(email: string, password: string) {
    try {
        const res = await fetch(`${HTTP}/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!res.status) throw new Error(`requisição falhou: ${res}`);

        const response: HttpResponse<body> = await res.json();

        return response.data;
    
    } catch (err) {
        console.error(err)
    }
}

export { login }