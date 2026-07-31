import { useEffect } from "react";
import type { Admin } from "../../lib/Admins";
import styles from "./AdminDetailsModal.module.css";

interface AdminDetailsModalProps {
    isOpen: boolean;
    admin: Admin | null;
    onClose: () => void;
}

export function AdminDetailsModal({
    isOpen,
    admin,
    onClose
}: AdminDetailsModalProps) {

    useEffect(() => {
        if (!admin) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [admin, onClose]);

    if (!isOpen || !admin) return null;

    const permissions = Array.from(admin.permissions);

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >

                <header className={styles.header}>

                    <div>

                        <span className={styles.typeBadge}>
                            ADMIN
                        </span>

                        <h2 className={styles.title}>
                            {admin.username}
                        </h2>

                        <span className={styles.adminId}>
                            ID: {admin.id}
                        </span>

                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        &times;
                    </button>

                </header>

                <div className={styles.body}>

                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Informações Gerais
                        </h3>

                        <div className={styles.infoGrid}>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Usuário
                                </span>

                                <strong>
                                    {admin.username}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Permissões
                                </span>

                                <strong>
                                    {permissions.length}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Email
                                </span>

                                <strong className={styles.email}>
                                    {admin.email}
                                </strong>
                            </div>

                        </div>

                    </section>

                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Permissões
                        </h3>

                        {
                            permissions.length === 0
                                ? (
                                    <p className={styles.emptyText}>
                                        Este administrador não possui permissões.
                                    </p>
                                )
                                : (
                                    <div className={styles.permissionList}>

                                        {
                                            permissions.map(permission => (
                                                <div
                                                    key={permission.key}
                                                    className={styles.permissionCard}
                                                >

                                                    <div className={styles.permissionHeader}>
                                                        <span className={styles.permissionKey}>
                                                            {permission.key}
                                                        </span>
                                                    </div>

                                                    <div className={styles.actions}>

                                                        {
                                                            Array.from(permission.actions).map(action => (
                                                                <span
                                                                    key={action}
                                                                    className={styles.actionBadge}
                                                                >
                                                                    {action}
                                                                </span>
                                                            ))
                                                        }

                                                    </div>

                                                </div>
                                            ))
                                        }

                                    </div>
                                )
                        }

                    </section>

                </div>

                <footer className={styles.footer}>

                    <button
                        className={styles.confirmButton}
                        onClick={onClose}
                    >
                        Fechar
                    </button>

                </footer>

            </div>
        </div>
    );
}