import { useState, useEffect } from "react";
import { Login } from "../../lib/Login";
import styles from "./Header.module.css";

export function Header() {
    const [admin, setAdmin] = useState<{ id: string; username: string; email: string; }>();

    useEffect(() => {
        async function getMe() {
            const res = await Login.me();

            setAdmin(res.data.admin);
        }
        
        getMe();
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