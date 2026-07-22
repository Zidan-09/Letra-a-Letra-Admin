import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {/* vazio por enquanto */}
            </div>

            <div className={styles.right}>
                <button>
                    Samuel
                </button>
            </div>
        </header>
    )
}