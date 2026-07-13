import { HTTP, type HttpResponse } from "./config"

type ApplicationMetrics = {
    players: number;
    online: number;
    games: number;
}

type SystemMetrics = {
    uptime: number;
    cpu: { systemUsage: number, processUsage: number };
    memory: { used: number, max: number, usage: number };
    storage: { used: number, free: number, total: number, usage: number };
    health: string;
}

class Metrics {
    public static async getApplication() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTP}/admin/application`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<ApplicationMetrics> = await res.json();

        return response.data;
    }

    public static async getSystem() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTP}/admin/system`, {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<SystemMetrics> = await res.json();

        return response.data;
    }
}

export { Metrics }