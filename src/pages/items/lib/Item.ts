import { API_URL, isSuccess } from "../../../lib/config";
import { apiFetch, HttpError } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";

export type ItemKind = "COSMETIC" | "CONSUMABLE";

export type ItemCategory =
    | "AVATAR"
    | "BANNER"
    | "FRAME"
    | "EMOTE"
    | "BOARD_SKIN"
    | "CELL_SKIN"
    | "XP_BOOST";

export type ItemContext = "PROFILE" | "MATCH";

export const COSMETIC_CATEGORIES: ItemCategory[] = [
    "AVATAR",
    "BANNER",
    "EMOTE",
    "FRAME",
    "CELL_SKIN",
    "BOARD_SKIN",
];

export const CONSUMABLE_CATEGORIES: ItemCategory[] = [
    "XP_BOOST",
];

export const ITEM_CONTEXTS: ItemContext[] = ["PROFILE", "MATCH"];

export function getCategoriesForKind(kind: ItemKind): ItemCategory[] {
    return kind === "COSMETIC" ? COSMETIC_CATEGORIES : CONSUMABLE_CATEGORIES;
}

export function isCategoryValidForKind(kind: ItemKind, category: ItemCategory): boolean {
    return getCategoriesForKind(kind).includes(category);
}

export type EffectType = "XP_BOOST_PCT";

export type ItemEffect = {
    type: EffectType;
    magnitude: number;
    durationMinutes: number;
};

export type ItemDefinition = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    contexts: ItemContext[];
    stackable: boolean;
    maxStack: number | null;
    consumable: boolean;
    effect?: ItemEffect | null;
    assetPath: string | null;
    version: number;
    available: boolean;
};

export type CreateItemRequest = {
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    applicability?: ItemContext[];
    stackable?: boolean;
    maxStack?: number;
    consumable?: boolean;
    effect?: ItemEffect;
};

export type UpdateItemRequest = {
    name?: string;
    available?: boolean;
    isNewAsset: boolean;
};

export type ItemCatalogFilters = {
    kind?: string;
    category?: string;
    available?: boolean;
};

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function parseItemDefinition(res: Response): Promise<ItemDefinition> {
    const text = await res.text();

    if (!text) throw new HttpError(res.status, "INVALID_RESPONSE", "Resposta inválida do servidor.");

    let payload: unknown;
    try {
        payload = JSON.parse(text);
    } catch {
        throw new HttpError(res.status, "INVALID_RESPONSE", "Resposta inválida do servidor.");
    }

    if (!res.ok) {
        const record = payload as { code?: unknown; message?: unknown };
        throw new HttpError(
            res.status,
            typeof record.code === "string" ? record.code : "REQUEST_FAILED",
            typeof record.message === "string" ? record.message : "Erro na requisição."
        );
    }

    if (isSuccess<ItemDefinition>(payload)) return payload.data;

    throw new HttpError(res.status, "INVALID_RESPONSE", "Resposta inválida do servidor.");
}

export class ItemRequests {
    static async createItem(body: CreateItemRequest, asset?: File | null) {
        const formData = new FormData();
        formData.append("item", new Blob([JSON.stringify(body)], { type: "application/json" }));

        if (asset) formData.append("asset", asset);

        const res = await fetch(`${API_URL}/admin/items`, {
            method: "POST",
            headers: authHeaders(),
            body: formData
        });

        return parseItemDefinition(res);
    }

    static async updateItem(itemId: string, body: UpdateItemRequest, asset?: File | null) {
        const formData = new FormData();
        formData.append("item", new Blob([JSON.stringify(body)], { type: "application/json" }));

        if (asset) formData.append("asset", asset);

        const res = await fetch(`${API_URL}/admin/items/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: authHeaders(),
            body: formData
        });

        return parseItemDefinition(res);
    }

    static async setAvailable(itemId: string, available: boolean) {
        return ItemRequests.updateItem(itemId, { available, isNewAsset: false });
    }

    static async deleteItem(itemId: string) {
        const body = await apiFetch<ItemDefinition>(`/admin/items/${encodeURIComponent(itemId)}`, {
            method: "DELETE"
        });

        return body;
    }

    static async getItem(itemId: string) {
        const body = await apiFetch<ItemDefinition>(`/admin/items/${encodeURIComponent(itemId)}`, {
            method: "GET"
        });

        return body;
    }

    static async listDefinitions(page: number, size: number, filters: ItemCatalogFilters = {}) {
        const params = new URLSearchParams();

        if (filters.kind) params.append("kind", filters.kind);
        if (filters.category) params.append("category", filters.category);
        if (filters.available !== undefined) params.append("available", String(filters.available));
        params.append("page", String(page));
        params.append("size", String(size));

        return apiFetch<PageResponse<ItemDefinition>>(`/admin/items?${params.toString()}`, {
            method: "GET"
        });
    }
}
