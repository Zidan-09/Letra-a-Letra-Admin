import { API_URL } from "../../../lib/config"

type ResetPasswordRequest = {
    token: string,
    newPassword: string,
}

class ResetPasswordRequests {
    static async validateToken(token: string) {
        const res = await fetch(`${API_URL}/admin/auth/verify-reset-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token
            })
        });

        if (!res.ok) throw new Error();
    }

    static async reset({ token, newPassword }: ResetPasswordRequest) {
        const res = await fetch(`${API_URL}/admin/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token,
                newPassword
            })
        });

        if (!res.ok) throw new Error();
    }
}

export { ResetPasswordRequests }