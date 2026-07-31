import { HTTPS } from "../../../lib/config"

export class ActivateRequest {
    static async active({ token, password}: { token: string, password: string }) {
        const res = await fetch(`${HTTPS}/admin/activate?token=${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password
            })
        });

        if (!res.ok) throw new Error();

        const response = await res.json();

        return response;
    }
}