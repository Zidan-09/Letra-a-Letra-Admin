import type { CosmeticTypes } from "../utils/cosmeticTypes";
import { type HttpResponse, HTTP } from "./config";

type CreateBody = {
    cosmetic: Cosmetic;
}

type GetBody = {
    cosmetics: Cosmetic[];
}

type EditBody = {
    cosmetic: Cosmetic;
}

type DisableBody = {
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

        console.log(formData);

        const res = await fetch(`${HTTP}/cosmetic`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<CreateBody> = await res.json();

        return response.data;
    }

    static async getCosmetics() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTP}/cosmetic`, {
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

        const res = await fetch(`${HTTP}/cosmetic/disable/${cosmeticId}`, {
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

    static async editCosmetic(formData: FormData) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${HTTP}/cosmetic`, {
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