import { API_URL, isSuccess } from "../../../lib/config";
import { HttpError } from "../../../lib/http";

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

export type UserItem = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    contexts: ItemContext[];
    quantity: number;
    equipped: boolean;
    acquiredAt: string;
    expiresAt: string | null;
    assetPath: string;
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

export type ItemFilters = {
    kind?: string;
    category?: string;
    context?: string;
    equipped?: boolean;
};

type UserItemsBody = {
    items: UserItem[];
};

function buildQuery(filters: ItemFilters): string {
    const params = new URLSearchParams();

    if (filters.kind) params.append("kind", filters.kind);
    if (filters.category) params.append("category", filters.category);
    if (filters.context) params.append("context", filters.context);
    if (filters.equipped !== undefined) params.append("equipped", String(filters.equipped));

    const query = params.toString();

    return query ? `?${query}` : "";
}

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

async function parseUserItems(res: Response): Promise<UserItem[]> {
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

    if (isSuccess<UserItemsBody>(payload)) return payload.data.items;

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

    static async listItems(filters: ItemFilters = {}) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/items${buildQuery(filters)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });

        return parseUserItems(res);
    }

    static async getUserItems(userId: string, filters: ItemFilters = {}) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/items${buildQuery(filters)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });

        return parseUserItems(res);
    }
}
