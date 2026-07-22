import { createContext } from "react";

type Cpu = {
    systemUsage: number;
    processUsage: number;
};

type Memory = {
    used: number;
    max: number;
    usage: number;
};

type Storage = {
    used: number;
    free: number;
    total: number;
    usage: number;
};

export type ApplicationMetrics = {
    players: number;
    online: number;
    games: number;
};

export type SystemMetrics = {
    uptime: number;
    cpu: Cpu;
    memory: Memory;
    storage: Storage;
    health: string;
};

export type RealtimeContextData = {
    connected: boolean;

    application?: ApplicationMetrics;

    system?: SystemMetrics;

    logs: string[];
};

export const RealtimeContext =
    createContext<RealtimeContextData | null>(null);