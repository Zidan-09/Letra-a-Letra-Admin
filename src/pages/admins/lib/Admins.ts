import { apiFetch } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";

export type Key =
"USER" |
"LOGS" |
"ADMIN" |
"COSMETIC" |
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

export type Admin = {
    id: string;
    username: string;
    email: string;
    isSuperAdmin: boolean;
    permissions: Permission[];
}

type FindBody = {
    admin: Admin;
}

type RegisterAdmin = {
    name: string;
    email: string;
}

type UpdateAdmin = {
    name: string;
    email: string;
    isSuper: boolean;
    permissions: Permission[];
}

export class AdminRequests {
    static async getAdmins(page: number, size: number) {
        return apiFetch<PageResponse<Admin>>(`/admin?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findAdminByEmail(email: string) {
        return apiFetch<FindBody>(`/admin/email/${encodeURIComponent(email)}`, {
            method: "GET"
        });
    }

    static async registerAdmin(admin: RegisterAdmin) {
        const body = await apiFetch<FindBody>("/admin", {
            method: "POST",
            body: admin
        });

        return body.admin;
    }

    static async removeAdmin(id: string) {
        const body = await apiFetch<FindBody>(`/admin/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        return body.admin;
    }

    static async updateAdmin(admin: Admin) {
        const updateData: UpdateAdmin = {
            name: admin.username,
            email: admin.email,
            isSuper: admin.isSuperAdmin,
            permissions: admin.permissions
        }

        const body = await apiFetch<FindBody>(`/admin/${encodeURIComponent(admin.id)}`, {
            method: "PUT",
            body: updateData
        });

        return body.admin;
    }
}
