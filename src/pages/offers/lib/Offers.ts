import { apiFetch } from "../../../lib/http";
import type { Reward, CreateReward } from "../../../lib/Rewards";
import type { PageResponse } from "../../../lib/shared";

export type CoinType = "SOFT" | "HARD" | "REAL";

type OfferReward = {
    offerRewardId: string;
    reward: Reward;
}

export type CreateOfferReward = CreateReward;

export type Offer = {
    offerId: string;
    title: string;
    coinType: CoinType;
    price: number;
    rewards: OfferReward[];
    active: boolean;
    repeatable: boolean;
    hasExpiration: boolean;
    expiresAt: string;
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
        return apiFetch<PageResponse<Offer>>(`/offer?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findOfferById(id: string) {
        return apiFetch<FindBody>(`/offer/${encodeURIComponent(id)}`, {
            method: "GET"
        });
    }

    static async createOffer(offer: CreateRequest) {
        const body = await apiFetch<FindBody>("/offer", {
            method: "POST",
            body: offer
        });

        return body.offer;
    }

    static async enableOffer(offerId: string) {
        return apiFetch<FindBody>(`/offer/enable/${encodeURIComponent(offerId)}`, {
            method: "PATCH"
        });
    }

    static async disableOffer(offerId: string) {
        return apiFetch<FindBody>(`/offer/disable/${encodeURIComponent(offerId)}`, {
            method: "PATCH"
        });
    }

    static async deleteOffer(offerId: string) {
        return apiFetch<FindBody>(`/offer/${encodeURIComponent(offerId)}`, {
            method: "DELETE"
        });
    }
}
