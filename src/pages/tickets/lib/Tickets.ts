import { type HttpResponse, API_URL } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

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
    username?: string;
    page?: number;
    size?: number;
    direction?: "DESC" | "ASC";
};

export type ResolveTicketRequest = {
    resolutionNote: string;
};

export class TicketRequests {
    private static getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token ?? ""}`
        };
    }

    static async getTickets(filters: TicketFilters = {}) {
        const params = new URLSearchParams();

        if (filters.status) params.append("status", filters.status);
        if (filters.category) params.append("category", filters.category);
        if (filters.userId) params.append("userId", filters.userId);
        if (filters.username) params.append("username", filters.username.trim());
        if (filters.page !== undefined) params.append("page", filters.page.toString());
        if (filters.size !== undefined) params.append("size", filters.size.toString());
        if (filters.direction) params.append("direction", filters.direction);

        const res = await fetch(`${API_URL}/admin/ticket?${params.toString()}`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });

        if (!res.ok) throw new Error("Falha ao buscar tickets.");

        const response: HttpResponse<GetBody<Ticket>> = await res.json();
        return response.data;
    }

    static async getTicketsByUserUsername(username: string, page: number, size: number) {
        const encodedUsername = encodeURIComponent(username.trim());
        const res = await fetch(`${API_URL}/admin/ticket/user/username/${encodedUsername}?page=${page}&size=${size}`, {
            method: "GET",
            headers: this.getAuthHeaders()
        });

        if (!res.ok) throw new Error("Falha ao buscar tickets do usuário.");

        const response: HttpResponse<GetBody<Ticket>> = await res.json();
        return response.data;
    }

    static async resolveTicket(ticketId: string, body: ResolveTicketRequest) {
        const res = await fetch(`${API_URL}/admin/ticket/${ticketId}/resolve`, {
            method: "PATCH",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Falha ao resolver ticket.");

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
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR") + " - " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const TICKET_CATEGORY_OPTIONS: TicketCategory[] = ["BUG", "FEEDBACK", "SUGGESTION", "OTHER"];
export const TICKET_STATUS_OPTIONS: TicketStatus[] = ["PENDING", "RESOLVED"];