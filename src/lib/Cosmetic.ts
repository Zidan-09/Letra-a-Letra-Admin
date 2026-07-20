import type { CosmeticTypes } from "../utils/cosmeticTypes";
import { type HttpResponse, HTTPS } from "./config";

type CreateBody = {
    cosmetic: Cosmetic;
}

type GetBody = {
    cosmetics: Cosmetic[];
    first: number;
    last: number;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
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
            console.error(err);

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

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody> = await res.json();

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

        if (!res.ok) throw new Error();

        const response: HttpResponse<DisableBody> = await res.json();

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

        if (!res.ok) throw new Error();

        const response: HttpResponse<EnableBody> = await res.json();

        return response.data;
    }

    static async editCosmetic(formData: FormData, cosmeticId: string) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${HTTPS}/cosmetic/${cosmeticId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<EditBody> = await res.json();

        return response.data;
    }
}