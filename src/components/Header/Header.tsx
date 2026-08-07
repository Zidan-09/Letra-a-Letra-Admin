import { useState, useEffect } from "react";
import { useProfile } from "../../hooks/profile/useProfile";
import { Bell } from "lucide-react";
import styles from "./Header.module.css";

export function Header() {
    const [admin, setAdmin] = useState<{ id: string; username: string; email: string; }>();
    const [notifications, setNotifications] = useState<string[]>([]);
    const [profilePanelOpen, setProfilePanelOpen] = useState(false);

    const { id, username, email } = useProfile();

    useEffect(() => {
        setAdmin({
            id,
            username,
            email
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setProfilePanelOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {/* vazio por enquanto */}
            </div>

            <div className={styles.right}>
                <div className={styles.notifications}>
                    {notifications.length > 0 && <span className={styles.notificationDot}></span>}
                    <Bell />
                </div>

                <button onClick={() => setProfilePanelOpen(true)}>
                    {admin?.username.split(" ")[0]}
                </button>
            </div>

            <div
                className={`${styles.overlay} ${profilePanelOpen ? styles.showOverlay : styles.hideOverlay}`}
                onClick={() => setProfilePanelOpen(false)}
            >
                <div
                    className={`${styles.profilePanel} ${
                        profilePanelOpen ? styles.show : styles.hide
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.profileHeader}>
                        <h3>{admin?.username}</h3>
                        <span>Administrador</span>
                    </div>

                    <div className={styles.profileContent}>
                        {/* Conteúdo */}
                    </div>
                </div>
            </div>
        </header>
    )
}