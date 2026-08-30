import { type HttpResponse, API_URL } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

export type TicketCategory = "BUG" | "FEEDBACK" | "SUGGESTION" | "OTHER";
export type TicketStatus = "PENDING" | "RESOLVED";

export type Ticket = {
    ticketId: string;
    userId: string;
    category: TicketCategory;
    status: TicketStatus;
    subject: string;
    description: string;
    resolutionNote: string | null;
    resolvedByAdminId: string | null;
    resolvedAt: string | null;
    createdAt: string;
};

type TicketPage = {
    content: Ticket[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: number;
    last: number;
};

export type TicketFilters = {
    status?: TicketStatus;
    category?: TicketCategory;
    userId?: string;
    page?: number;
    size?: number;
    direction?: "DESC" | "ASC";
};

export type ResolveTicketRequest = {
    resolutionNote: string;
};

function appendParams(params: URLSearchParams, entries: Array<[string, string | undefined]>) {
    for (const [name, value] of entries) {
        if (!value) continue;
        const trimmed = value.trim();
        if (!trimmed) continue;
        params.append(name, trimmed);
    }
}

async function requestTicketPage(url: string): Promise<TicketPage> {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error();

    const response: HttpResponse<GetBody<Ticket>> = await res.json();

    return response.data;
}

export class TicketRequests {
    static async getTickets(filters: TicketFilters = {}) {
        const params = new URLSearchParams();

        appendParams(params, [
            ["status", filters.status],
            ["category", filters.category],
            ["userId", filters.userId],
            ["page", filters.page?.toString()],
            ["size", filters.size?.toString()],
            ["direction", filters.direction]
        ]);

        return requestTicketPage(`${API_URL}/admin/ticket?${params.toString()}`);
    }

    static async resolveTicket(ticketId: string, body: ResolveTicketRequest) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/admin/ticket/${ticketId}/resolve`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }

        const response: HttpResponse<{ ticket: Ticket }> = await res.json();
        return response.data.ticket;
    }
}

export function formatCategory(category: TicketCategory): string {
    const labels: Record<TicketCategory, string> = {
        BUG: "Bug",
        FEEDBACK: "Feedback",
        SUGGESTION: "Sugestão",
        OTHER: "Outro"
    };
    return labels[category] ?? category;
}

export function formatStatus(status: TicketStatus): string {
    const labels: Record<TicketStatus, string> = {
        PENDING: "Pendente",
        RESOLVED: "Resolvido"
    };
    return labels[status] ?? status;
}

export function formatDateTime(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR") + " - " + date.toLocaleTimeString("pt-BR");
}

export const TICKET_CATEGORY_OPTIONS: TicketCategory[] = ["BUG", "FEEDBACK", "SUGGESTION", "OTHER"];
export const TICKET_STATUS_OPTIONS: TicketStatus[] = ["PENDING", "RESOLVED"];