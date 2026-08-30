import { API_URL } from "../../../lib/config";

type DatesResponse = string[];
type GamesResponse = string[];
type FilesResponse = string[];
type AdminLogsResponse = string[];
type UntrackedLogsResponse = string[];

export class LogRequests {

    private static getHeaders() {
        const token = localStorage.getItem("token");

        return {
            "Authorization": `Bearer ${token}`
        };
    }

    static async getGameLogDates(): Promise<DatesResponse> {
        const res = await fetch(`${API_URL}/admin/logs/game`, {
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error();

        return await res.json();
    }

    static async getGames(date: string): Promise<GamesResponse> {
        const res = await fetch(
            `${API_URL}/admin/logs/game/${encodeURIComponent(date)}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!res.ok) throw new Error();

        return await res.json();
    }

    static async getGameFiles(
        date: string,
        gameId: string
    ): Promise<FilesResponse> {
        const res = await fetch(
            `${API_URL}/admin/logs/game/${encodeURIComponent(date)}/${encodeURIComponent(gameId)}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!res.ok) throw new Error();

        return await res.json();
    }

    static async getGameLog(
        date: string,
        gameId: string,
        file: string
    ): Promise<string> {
        const res = await fetch(
            `${API_URL}/admin/logs/game/${encodeURIComponent(date)}/${encodeURIComponent(gameId)}/${encodeURIComponent(file)}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!res.ok) throw new Error();

        return await res.text();
    }

    static async getUntrackedLogs(): Promise<UntrackedLogsResponse> {
        const res = await fetch(`${API_URL}/admin/logs/game/untracked`, {
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error();

        return await res.json();
    }

    static async getUntrackedLog(file: string): Promise<string> {
        const res = await fetch(
            `${API_URL}/admin/logs/game/untracked/${encodeURIComponent(file)}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!res.ok) throw new Error();

        return await res.text();
    }

    static async getAdminLogs(): Promise<AdminLogsResponse> {
        const res = await fetch(`${API_URL}/admin/logs/admin`, {
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error();

        return await res.json();
    }

    static async getAdminLog(file: string): Promise<string> {
        const res = await fetch(
            `${API_URL}/admin/logs/admin/${encodeURIComponent(file)}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!res.ok) throw new Error();

        return await res.text();
    }

}