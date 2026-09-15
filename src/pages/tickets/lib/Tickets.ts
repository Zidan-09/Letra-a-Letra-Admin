import { apiFetch } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";

export type TicketCategory = "BUG" | "FEEDBACK" | "SUGGESTION" | "OTHER";
export type TicketStatus = "PENDING" | "RESOLVED";

export type Ticket = {
    ticketId: string;
    userId: string;
    username: string;
    category: TicketCategory;
    status: TicketStatus;
    subject: string;
    description: string;
    resolutionNote: string | null;
    resolvedByAdminId: string | null;
    adminName: string | null;
    resolvedAt: string | null;
    createdAt: string;
};

export type TicketFilters = {
    status?: TicketStatus;
    category?: TicketCategory;
    userId?: string;
    page?: number;
    size?: number;
};

export type ResolveTicketRequest = {
    resolutionNote?: string;
};

export class TicketRequests {
    static async getTickets(filters: TicketFilters = {}) {
        const params = new URLSearchParams();

        if (filters.status) params.append("status", filters.status);
        if (filters.category) params.append("category", filters.category);
        if (filters.userId) params.append("userId", filters.userId);
        if (filters.page !== undefined) params.append("page", filters.page.toString());
        if (filters.size !== undefined) params.append("size", filters.size.toString());

        return apiFetch<PageResponse<Ticket>>(`/admin/ticket?${params.toString()}`, {
            method: "GET"
        });
    }

    static async getTicketsByUserUsername(username: string, page: number, size: number) {
        const encodedUsername = encodeURIComponent(username.trim());

        return apiFetch<PageResponse<Ticket>>(`/admin/ticket/user/username/${encodedUsername}?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async resolveTicket(ticketId: string, body: ResolveTicketRequest) {
        const response = await apiFetch<{ ticket: Ticket }>(`/admin/ticket/${encodeURIComponent(ticketId)}/resolve`, {
            method: "PATCH",
            body
        });

        return response.ticket;
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
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR") + " - " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const TICKET_CATEGORY_OPTIONS: TicketCategory[] = ["BUG", "FEEDBACK", "SUGGESTION", "OTHER"];
export const TICKET_STATUS_OPTIONS: TicketStatus[] = ["PENDING", "RESOLVED"];