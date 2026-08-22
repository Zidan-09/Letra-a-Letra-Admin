import { useState, type ReactNode } from "react";
import { ProfileContext, type Profile } from "./ProfileContext";

interface Props {
    children: ReactNode;
}

export function ProfileProvider({ children }: Props) {
    const [profile, setProfile] = useState<Profile | null>(() => {
        const profile = localStorage.getItem("profile");

        if (!profile) return null;

        return JSON.parse(profile);
    });

    function set(profile: Profile) {
        localStorage.setItem("profile", JSON.stringify(profile));

        setProfile(profile);
    }

    function reset() {
        localStorage.removeItem("profile");

        setProfile(null);
    }

    return (
        <ProfileContext.Provider
            value={{
                ...profile,
                set,
                reset
            } as any}
        >
            {children}
        </ProfileContext.Provider>
    )
}