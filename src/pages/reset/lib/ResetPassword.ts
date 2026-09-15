import { apiFetch } from "../../../lib/http"

type ResetPasswordRequest = {
    email: string,
    token: string,
    newPassword: string,
}

type ValidateTokenRequest = {
    email: string,
    token: string,
}

class ResetPasswordRequests {
    static async validateToken({ email, token }: ValidateTokenRequest) {
        await apiFetch<Record<string, never>>("/admin/auth/verify-reset-token", {
            method: "POST",
            auth: false,
            body: {
                email,
                token
            }
        });
    }

    static async reset({ email, token, newPassword }: ResetPasswordRequest) {
        await apiFetch<Record<string, never>>("/admin/auth/reset-password", {
            method: "POST",
            auth: false,
            body: {
                email,
                token,
                newPassword
            }
        });
    }
}

export { ResetPasswordRequests }