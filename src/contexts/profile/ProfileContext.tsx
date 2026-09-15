import { createContext } from "react";

type Key =
"USER" |
"LOGS" |
"ADMIN" |
"ITEMS" |
"GAME" |
"LEVELS" |
"OFFERS" |
"TRANSACTIONS" |
"AUDIT" |
"TICKET";

type Action = 
"VIEW" | 
"CREATE" | 
"EDIT" | 
"DELETE" | 
"TOGGLE";

type Permission = {
    key: Key;
    actions: Action[];
}

export type Profile = {
    id: string;
    username: string;
    email: string;
    permissions: Permission[];
}

export type ProfileContextData = {
    id: string;
    username: string;
    email: string;
    permissions: Permission[];
    set: (profile: Profile) => void;
    reset: () => void;
}

export const ProfileContext = createContext<ProfileContextData | null>(null);