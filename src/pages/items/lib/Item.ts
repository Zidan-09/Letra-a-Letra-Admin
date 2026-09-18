import { API_URL, isSuccess } from "../../../lib/config";
import { apiFetch, HttpError } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";

export type ItemKind = "EQUIPPABLE" | "CONSUMABLE";

export type ItemCategory =
    | "AVATAR"
    | "BANNER"
    | "FRAME"
    | "EMOTE"
    | "BOARD"
    | "CELL";

export type ItemContext = "PROFILE" | "MATCH";

export type EffectKind = "PERCENTAGE_TIMED" | "NICKNAME_CHANGE";

export type EffectType =
    | "XP_BOOST_PCT"
    | "RANKING_POINTS_BOOST_PCT"
    | "COIN_BOOST_PCT"
    | "RANKING_POINTS_SHIELD"
    | "NICKNAME_CHANGE_GRANT";

export type PercentageTimedEffectType = Exclude<EffectType, "NICKNAME_CHANGE_GRANT">;

export type PercentageTimedEffect = {
    kind: "PERCENTAGE_TIMED";
    type: PercentageTimedEffectType;
    magnitude: number;
    durationMinutes: number;
};

export type NicknameChangeEffect = {
    kind: "NICKNAME_CHANGE";
};

export type ItemEffect = PercentageTimedEffect | NicknameChangeEffect;

export const EQUIPPABLE_CATEGORIES: ItemCategory[] = [
    "AVATAR",
    "BANNER",
    "FRAME",
    "EMOTE",
    "BOARD",
    "CELL",
];

export const CATEGORY_CONTEXT: Record<ItemCategory, ItemContext> = {
    AVATAR: "PROFILE",
    BANNER: "PROFILE",
    FRAME: "PROFILE",
    EMOTE: "MATCH",
    BOARD: "MATCH",
    CELL: "MATCH",
};

export const EFFECT_KINDS: EffectKind[] = ["PERCENTAGE_TIMED", "NICKNAME_CHANGE"];

export const PERCENTAGE_TIMED_TYPES: PercentageTimedEffectType[] = [
    "XP_BOOST_PCT",
    "RANKING_POINTS_BOOST_PCT",
    "COIN_BOOST_PCT",
    "RANKING_POINTS_SHIELD",
];

export function getContextForCategory(category: ItemCategory): ItemContext {
    return CATEGORY_CONTEXT[category];
}

export function formatEffect(effect: ItemEffect | null | undefined): string {
    if (!effect) return "—";
    if (effect.kind === "NICKNAME_CHANGE") return "Troca de nickname";
    return `${effect.type} (+${effect.magnitude}% por ${effect.durationMinutes}min)`;
}

export type ItemDefinition = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory | null;
    context: ItemContext | null;
    stackable: boolean;
    maxStack: number | null;
    consumable: boolean;
    effect: ItemEffect | null;
    assetPath: string | null;
    version: number;
    available: boolean;
};

export type CreateEquippablePayload = {
    name: string;
    kind: "EQUIPPABLE";
    category: ItemCategory;
    context: ItemContext;
    asset: File;
};

export type CreateConsumablePayload = {
    name: string;
    kind: "CONSUMABLE";
    effectKind: EffectKind;
    effectType?: PercentageTimedEffectType;
    magnitude?: number;
    durationMinutes?: number;
};

export type CreateItemPayload = CreateEquippablePayload | CreateConsumablePayload;

export type UpdateItemPayload = {
    name?: string;
    available?: boolean;
    category?: ItemCategory;
    context?: ItemContext;
    effectKind?: EffectKind;
    effectType?: PercentageTimedEffectType;
    magnitude?: number;
    durationMinutes?: number;
    isNewAsset?: boolean;
};

export type ItemCatalogFilters = {
    kind?: string;
    category?: string;
    available?: boolean;
    sort?: string[];
};

function authHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return token ? { "Authorization": `Bearer ${token}` } : {};
}

function appendIfDefined(form: FormData, key: string, value: string | number | boolean | undefined | null) {
    if (value === undefined || value === null) return;
    form.append(key, String(value));
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
    static async createItem(payload: CreateItemPayload) {
        const formData = new FormData();
        formData.append("name", payload.name.trim());
        formData.append("kind", payload.kind);

        if (payload.kind === "EQUIPPABLE") {
            formData.append("category", payload.category);
            formData.append("context", payload.context);
            formData.append("asset", payload.asset);
        } else {
            formData.append("effectKind", payload.effectKind);
            if (payload.effectKind === "PERCENTAGE_TIMED") {
                appendIfDefined(formData, "effectType", payload.effectType);
                appendIfDefined(formData, "magnitude", payload.magnitude);
                appendIfDefined(formData, "durationMinutes", payload.durationMinutes);
            }
        }

        const res = await fetch(`${API_URL}/admin/items`, {
            method: "POST",
            headers: authHeaders(),
            body: formData
        });

        return parseItemDefinition(res);
    }

    static async updateItem(itemId: string, payload: UpdateItemPayload, asset?: File | null) {
        const formData = new FormData();
        const name = payload.name?.trim();
        if (name) formData.append("name", name);
        appendIfDefined(formData, "available", payload.available);
        appendIfDefined(formData, "category", payload.category);
        appendIfDefined(formData, "context", payload.context);
        appendIfDefined(formData, "effectKind", payload.effectKind);
        appendIfDefined(formData, "effectType", payload.effectType);
        appendIfDefined(formData, "magnitude", payload.magnitude);
        appendIfDefined(formData, "durationMinutes", payload.durationMinutes);
        appendIfDefined(formData, "isNewAsset", payload.isNewAsset);

        if (asset) formData.append("asset", asset);

        const res = await fetch(`${API_URL}/admin/items/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: authHeaders(),
            body: formData
        });

        return parseItemDefinition(res);
    }

    static async setAvailable(itemId: string, available: boolean) {
        const action = available ? "enable" : "disable";

        return apiFetch<ItemDefinition>(`/admin/items/${encodeURIComponent(itemId)}/${action}`, {
            method: "PATCH"
        });
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
        filters.sort?.forEach((s) => params.append("sort", s));
        params.append("page", String(page));
        params.append("size", String(size));

        return apiFetch<PageResponse<ItemDefinition>>(`/admin/items?${params.toString()}`, {
            method: "GET"
        });
    }
}
