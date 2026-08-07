import { type HttpResponse, HTTPS } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

export type CosmeticTypes = "AVATAR" | "BANNER" | "FRAME" | "EMOTE";

type CreateBody = {
    cosmetic: Cosmetic;
}

type EditBody = {
    cosmetic: Cosmetic;
}

type DisableBody = {
    cosmeticId: string;
}

type EnableBody = {
    cosmeticId: string;
}

export type Cosmetic = {
    id: string;
    name: string;
    type: CosmeticTypes;
    assetPath: string;
    version: number;
    available: boolean;
}

export class CosmeticRequests {
    static async createCosmetic(formData: FormData) {
        const token = localStorage.getItem("token");

        try {
            const res: HttpResponse<CreateBody> = await fetch(`${HTTPS}/cosmetic`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            }).then(res => res.json());

            if (!res.success) throw new Error(res.message);

            return res.data;

        } catch (err) {

            throw err;
        } 
    }

    static async getCosmetics(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/cosmetic?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<GetBody<Cosmetic>> = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }

    static async disableCosmetic(cosmeticId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/cosmetic/disable/${cosmeticId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<DisableBody> = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }

    static async enableCosmetic(cosmeticId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/cosmetic/enable/${cosmeticId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<EnableBody> = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }

    static async editCosmetic(formData: FormData, cosmeticId: string) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${HTTPS}/cosmetic/${cosmeticId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const response: HttpResponse<EditBody> = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }

    static async deleteCosmetic(cosmeticId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/cosmetic/${cosmeticId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }

    static async search(search: string, page: number, size: number) {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
            search: search,
            page: page.toString(),
            size: size.toString()
        });

        const res = await fetch(`${HTTPS}/cosmetic/search?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<GetBody<Cosmetic>> = await res.json();

        if (!res.ok) {
            throw new Error(response.message);
        }

        return response.data;
    }
}