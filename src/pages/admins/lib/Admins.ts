import { HTTPS, type HttpResponse } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

export type Admin = {
    id: string;
    username: string;
    email: string;
    permissions: Set<any>;
}

type FindBody = {
    admin: Admin;
}

type RegisterAdmin = {
    name: string;
    email: string;
    password: string;
}

export class AdminRequests {
    static async getAdmins(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/admin?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<Admin>> = await res.json();

        console.log(response);

        return response.data;
    }

    static async findAdminByEmail(email: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/admin/email/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }

    static async registerAdmin(admin: RegisterAdmin) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...admin
            })
        });

        if (!res.ok) throw new Error();
    }

    static async removeAdmin(id: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/admin/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }
}