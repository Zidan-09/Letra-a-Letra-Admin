import { API_URL, isSuccess } from "./config";

export class HttpError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.code = code;
    }
}

export type ApiFetchOptions = {
    method?: string;
    body?: unknown;
    auth?: boolean;
    headers?: HeadersInit;
};

function handleUnauthorized(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("profile");

    if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
    }
}

function statusCode(status: number): string {
    if (status === 401) return "UNAUTHORIZED";
    if (status === 403) return "PERMISSION_DENIED";
    if (status === 429) return "RATE_LIMIT_EXCEEDED";
    return "REQUEST_FAILED";
}

function statusMessage(status: number, fallback: string): string {
    if (status === 401) return "Sessão expirada. Faça login novamente.";
    if (status === 403) return "Sem permissão para esta ação.";
    if (status === 429) return fallback || "Limite de requisições excedido. Tente novamente.";
    return fallback || "Erro na requisição.";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (options.auth !== false) {
        const token = localStorage.getItem("token");
        if (token && !headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    const res = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (res.status === 401) {
        handleUnauthorized();
    }

    const text = await res.text();

    if (!text) {
        if (res.ok) return {} as T;
        throw new HttpError(res.status, statusCode(res.status), statusMessage(res.status, ""));
    }

    let payload: unknown;
    try {
        payload = JSON.parse(text);
    } catch {
        if (!res.ok) throw new HttpError(res.status, statusCode(res.status), statusMessage(res.status, text.slice(0, 300)));
        throw new HttpError(res.status, "INVALID_RESPONSE", "Resposta inválida do servidor.");
    }

    if (res.ok) {
        if (isSuccess<T>(payload)) return payload.data;
        return payload as T;
    }

    const record = payload as { code?: unknown; message?: unknown };
    const code = typeof record.code === "string" && record.code ? record.code : statusCode(res.status);
    const message = typeof record.message === "string" && record.message
        ? record.message
        : statusMessage(res.status, text.slice(0, 300));

    throw new HttpError(res.status, code, message);
}
