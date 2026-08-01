import { useState, useEffect } from "react";
import { useProfile } from "../../hooks/profile/useProfile";
import styles from "./Header.module.css";

export function Header() {
    const [admin, setAdmin] = useState<{ id: string; username: string; email: string; }>();

    const { id, username, email } = useProfile();

    useEffect(() => {
        setAdmin({
            id,
            username,
            email
        });
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {/* vazio por enquanto */}
            </div>

            <div className={styles.right}>
                <button>
                    {admin?.username.split(" ")[0]}
                </button>
            </div>
        </header>
    )
}