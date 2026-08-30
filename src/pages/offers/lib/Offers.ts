import { type HttpResponse, API_URL } from "../../../lib/config";
import type { Reward } from "../../../lib/Rewards";
import type { GetBody, RewardType } from "../../../lib/shared";

export type CoinType = "SOFT" | "HARD" | "REAL";

type OfferReward = {
    offerRewardId: string;
    reward: Reward;
}

type CreateOfferReward = {
    rewardType: RewardType;
    rewardReference: string;
    quantity: number;
}

export type Offer = {
    offerId: string;
    title: string;
    coinType: CoinType;
    price: number;
    rewards: OfferReward[];
    active: boolean;
    repeatable: boolean;
    hasExpiration: boolean;
    expiresAt: Date;
}

type CreateRequest = {
    title: string;
    coinType: CoinType;
    price: number;
    rewards: CreateOfferReward[];
    repeatable: boolean;
    hasExpiration: boolean;
    expiresIn: number;
}

type FindBody = {
    offer: Offer;
}

export class OfferRequests {
    static async getOffers(page: number, size: number) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/offer?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<Offer>> = await res.json();

        return response.data;
    }

    static async findOfferById(id: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/offer/${id}`, {
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

    static async createOffer(offer: CreateRequest) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/offer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...offer
            })
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<Offer> = await res.json();

        return response.data;
    }

    static async enableOffer(offerId: string) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/offer/enable/${offerId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }

    static async disableOffer(offerId: string) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/offer/disable/${offerId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }

    static async deleteOffer(offerId: string) {
        const token = localStorage.getItem("token");
        
        const res = await fetch(`${API_URL}/offer/${offerId}`, {
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