import { apiFetch } from "../../../lib/http";

type DatesResponse = string[];
type GamesResponse = string[];
type FilesResponse = string[];
type AdminLogsResponse = string[];
type UntrackedLogsResponse = string[];

export class LogRequests {

    static async getGameLogDates(): Promise<DatesResponse> {
        return apiFetch<DatesResponse>("/admin/logs/game", {
            method: "GET"
        });
    }

    static async getGames(date: string): Promise<GamesResponse> {
        return apiFetch<GamesResponse>(`/admin/logs/game/${encodeURIComponent(date)}`, {
            method: "GET"
        });
    }

    static async getGameFiles(
        date: string,
        gameId: string
    ): Promise<FilesResponse> {
        return apiFetch<FilesResponse>(
            `/admin/logs/game/${encodeURIComponent(date)}/${encodeURIComponent(gameId)}`,
            {
                method: "GET"
            }
        );
    }

    static async getGameLog(
        date: string,
        gameId: string,
        file: string
    ): Promise<string> {
        return apiFetch<string>(
            `/admin/logs/game/${encodeURIComponent(date)}/${encodeURIComponent(gameId)}/${encodeURIComponent(file)}`,
            {
                method: "GET",
                response: "text"
            }
        );
    }

    static async getUntrackedLogs(): Promise<UntrackedLogsResponse> {
        return apiFetch<UntrackedLogsResponse>("/admin/logs/game/untracked", {
            method: "GET"
        });
    }

    static async getUntrackedLog(file: string): Promise<string> {
        return apiFetch<string>(
            `/admin/logs/game/untracked/${encodeURIComponent(file)}`,
            {
                method: "GET",
                response: "text"
            }
        );
    }

    static async getAdminLogs(): Promise<AdminLogsResponse> {
        return apiFetch<AdminLogsResponse>("/admin/logs/admin", {
            method: "GET"
        });
    }

    static async getAdminLog(file: string): Promise<string> {
        return apiFetch<string>(
            `/admin/logs/admin/${encodeURIComponent(file)}`,
            {
                method: "GET",
                response: "text"
            }
        );
    }

}
