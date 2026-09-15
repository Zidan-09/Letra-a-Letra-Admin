import { apiFetch } from "../../../lib/http"

export class ActivateRequest {
    static async active({ token, password}: { token: string, password: string }) {
        await apiFetch<Record<string, never>>(`/admin/activate?token=${encodeURIComponent(token)}`, {
            method: "PATCH",
            auth: false,
            body: {
                password
            }
        });
    }
}