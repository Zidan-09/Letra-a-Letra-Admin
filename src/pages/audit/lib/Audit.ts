import { type HttpResponse, API_URL } from "../../../lib/config";

export type AuditEventType =
    | "WALLET_CREDITED"
    | "WALLET_DEBITED"
    | "COSMETIC_ACQUIRED"
    | "COSMETIC_REVOKED"
    | "COSMETIC_EQUIPPED"
    | "COSMETIC_UNEQUIPPED"
    | "MATCH_STARTED"
    | "MATCH_ENDED"
    | "ROOM_CLOSED_INACTIVITY"
    | "PLAYER_REMOVED_INACTIVITY"
    | "MATCHMAKING_PAIRED"
    | "CATALOG_CHANGED"
    | "COMMAND_FAILED";

export type AuditCategory =
    | "ECONOMY"
    | "INVENTORY"
    | "GAME"
    | "ACCOUNT"
    | "ADMINISTRATION"
    | "OPERATION";

export type AuditOutcome = "SUCCESS" | "FAILURE";

export type AuditResourceType =
    | "WALLET"
    | "INVENTORY_ITEM"
    | "COSMETIC"
    | "OFFER"
    | "LEVEL"
    | "USER"
    | "MATCH"
    | "ROOM";

export type AuditDirection = "DESC" | "ASC";

export type AuditEventState = Record<string, unknown> | null;

export type AuditEvent = {
    eventId: string;
    occurredAt: string;
    category: string | null;
    eventType: string;
    outcome: string;
    failureReason: string | null;
    actorType: string | null;
    actorId: string | null;
    actorName: string | null;
    targetUserId: string | null;
    resourceType: string | null;
    resourceId: string | null;
    beforeState: AuditEventState;
    afterState: AuditEventState;
    delta: AuditEventState;
    reasonCode: string | null;
    requestId: string | null;
    operationId: string | null;
    correlationId: string | null;
    sourceType: string | null;
    sourceDetail: string | null;
    transactionId: string | null;
    metadata: AuditEventState;
};

export type AuditPage = {
    content: AuditEvent[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

export type AuditFilters = {
    targetUserId?: string;
    actorId?: string;
    eventType?: AuditEventType;
    category?: AuditCategory;
    outcome?: AuditOutcome;
    resourceType?: AuditResourceType;
    resourceId?: string;
    from?: string;
    to?: string;
    requestId?: string;
    operationId?: string;
    correlationId?: string;
    transactionId?: string;
};

export const AUDIT_EVENT_TYPE_OPTIONS: AuditEventType[] = [
    "WALLET_CREDITED",
    "WALLET_DEBITED",
    "COSMETIC_ACQUIRED",
    "COSMETIC_REVOKED",
    "COSMETIC_EQUIPPED",
    "COSMETIC_UNEQUIPPED",
    "MATCH_STARTED",
    "MATCH_ENDED",
    "ROOM_CLOSED_INACTIVITY",
    "PLAYER_REMOVED_INACTIVITY",
    "MATCHMAKING_PAIRED",
    "CATALOG_CHANGED",
    "COMMAND_FAILED"
];

export const AUDIT_CATEGORY_OPTIONS: AuditCategory[] = [
    "ECONOMY",
    "INVENTORY",
    "GAME",
    "ACCOUNT",
    "ADMINISTRATION",
    "OPERATION"
];

export const AUDIT_OUTCOME_OPTIONS: AuditOutcome[] = ["SUCCESS", "FAILURE"];

export const AUDIT_RESOURCE_TYPE_OPTIONS: AuditResourceType[] = [
    "WALLET",
    "INVENTORY_ITEM",
    "COSMETIC",
    "OFFER",
    "LEVEL",
    "USER",
    "MATCH",
    "ROOM"
];

const eventTypeLabels: Record<AuditEventType, string> = {
    WALLET_CREDITED: "Carteira creditada",
    WALLET_DEBITED: "Carteira debitada",
    COSMETIC_ACQUIRED: "Cosmético adquirido",
    COSMETIC_REVOKED: "Cosmético revogado",
    COSMETIC_EQUIPPED: "Cosmético equipado",
    COSMETIC_UNEQUIPPED: "Cosmético desequipado",
    MATCH_STARTED: "Partida iniciada",
    MATCH_ENDED: "Partida encerrada",
    ROOM_CLOSED_INACTIVITY: "Sala fechada por inatividade",
    PLAYER_REMOVED_INACTIVITY: "Jogador removido por inatividade",
    MATCHMAKING_PAIRED: "Pareamento de matchmaking",
    CATALOG_CHANGED: "Catálogo alterado",
    COMMAND_FAILED: "Comando falhou"
};

const categoryLabels: Record<AuditCategory, string> = {
    ECONOMY: "Economia",
    INVENTORY: "Inventário",
    GAME: "Jogo",
    ACCOUNT: "Conta",
    ADMINISTRATION: "Administração",
    OPERATION: "Operação"
};

const resourceTypeLabels: Record<AuditResourceType, string> = {
    WALLET: "Carteira",
    INVENTORY_ITEM: "Item de inventário",
    COSMETIC: "Cosmético",
    OFFER: "Oferta",
    LEVEL: "Nível",
    USER: "Usuário",
    MATCH: "Partida",
    ROOM: "Sala"
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
    return UUID_PATTERN.test(value.trim());
}

export function formatEnumValue(value: string | null | undefined): string {
    if (!value) return "—";
    return value.replaceAll("_", " ");
}

export function formatEventType(value: string | null | undefined): string {
    if (!value) return "—";
    return eventTypeLabels[value as AuditEventType] ?? formatEnumValue(value);
}

export function formatCategory(value: string | null | undefined): string {
    if (!value) return "—";
    return categoryLabels[value as AuditCategory] ?? formatEnumValue(value);
}

export function formatOutcome(value: string | null | undefined): string {
    return formatEnumValue(value);
}

export function formatResourceType(value: string | null | undefined): string {
    if (!value) return "—";
    return resourceTypeLabels[value as AuditResourceType] ?? formatEnumValue(value);
}

export function formatDateTime(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR") + " - " + date.toLocaleTimeString("pt-BR");
}

export function hasJsonContent(value: AuditEventState): value is Record<string, unknown> {
    return !!value && typeof value === "object" && Object.keys(value).length > 0;
}

function toIsoDateTime(value: string): string | undefined {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
}

function appendParams(params: URLSearchParams, entries: Array<[string, string | undefined]>) {
    for (const [name, value] of entries) {
        if (!value) continue;
        const trimmed = value.trim();
        if (!trimmed) continue;
        params.append(name, trimmed);
    }
}

function appendDateRange(params: URLSearchParams, filters: AuditFilters) {
    if (filters.from) {
        const iso = toIsoDateTime(filters.from);
        if (iso) params.append("from", iso);
    }

    if (filters.to) {
        const iso = toIsoDateTime(filters.to);
        if (iso) params.append("to", iso);
    }
}

async function requestAuditPage(url: string): Promise<AuditPage> {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error();

    const response: HttpResponse<AuditPage> = await res.json();

    return response.data;
}

export class AuditRequests {
    static async getEvents(filters: AuditFilters, page: number, size: number, direction: AuditDirection = "DESC") {
        const params = new URLSearchParams();

        appendParams(params, [
            ["targetUserId", filters.targetUserId],
            ["actorId", filters.actorId],
            ["eventType", filters.eventType],
            ["category", filters.category],
            ["outcome", filters.outcome],
            ["resourceType", filters.resourceType],
            ["resourceId", filters.resourceId],
            ["requestId", filters.requestId],
            ["operationId", filters.operationId],
            ["correlationId", filters.correlationId],
            ["transactionId", filters.transactionId]
        ]);

        appendDateRange(params, filters);

        params.append("page", String(page));
        params.append("size", String(size));
        params.append("direction", direction);

        return requestAuditPage(`${API_URL}/admin/audit?${params.toString()}`);
    }

    static async getEventsByUser(userId: string, filters: AuditFilters, page: number, size: number) {
        const params = new URLSearchParams();

        appendParams(params, [
            ["eventType", filters.eventType],
            ["category", filters.category]
        ]);

        appendDateRange(params, filters);

        params.append("page", String(page));
        params.append("size", String(size));

        return requestAuditPage(`${API_URL}/admin/audit/user/${encodeURIComponent(userId)}?${params.toString()}`);
    }

    static async getEventsByResource(resourceType: string, resourceId: string, filters: AuditFilters, page: number, size: number) {
        const params = new URLSearchParams();

        appendParams(params, [
            ["targetUserId", filters.targetUserId]
        ]);

        appendDateRange(params, filters);

        params.append("page", String(page));
        params.append("size", String(size));

        return requestAuditPage(
            `${API_URL}/admin/audit/resource/${encodeURIComponent(resourceType)}/${encodeURIComponent(resourceId)}?${params.toString()}`
        );
    }
}
