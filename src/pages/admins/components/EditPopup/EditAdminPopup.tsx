import { useEffect, useState } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { AdminRequests, type Action, type Admin, type Key } from "../../lib/Admins";
import styles from "./EditAdminPopup.module.css";

interface EditAdminPopupProps {
    isOpen: boolean;
    admin: Admin | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const KEYS: Key[] = [
    "USER",
    "LOGS",
    "ADMIN",
    "COSMETIC",
    "GAME",
    "LEVELS",
    "OFFERS",
    "TRANSACTIONS"
];

const ACTIONS: Action[] = [
    "VIEW",
    "CREATE",
    "EDIT",
    "DELETE",
    "TOGGLE"
];

export function EditAdminPopup({
    isOpen,
    admin,
    onClose,
    onSuccess
}: EditAdminPopupProps) {
    const { notify } = useNotification();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [permissions, setPermissions] = useState<
        Map<Key, Set<Action>>
    >(new Map());
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const [loading, setLoading] = useState(false);

    function createSuperAdminPermissions(): Map<Key, Set<Action>> {
        return new Map(
            KEYS.map(key => [
                key,
                new Set(ACTIONS)
            ])
        );
    }

    useEffect(() => {
        if (isSuperAdmin) {
            setPermissions(createSuperAdminPermissions());
        } else {
            setPermissions(new Map());
        }

    }, [isSuperAdmin]);

    useEffect(() => {
        if (!admin) return;

        setUsername(admin.username);
        setEmail(admin.email);

        const map = new Map<Key, Set<Action>>();

        admin.permissions.forEach(permission => {
            map.set(
                permission.key,
                new Set(permission.actions)
            );
        });

        setPermissions(map);

    }, [admin]);


    if (!isOpen || !admin) return null;


    function togglePermission(
        key: Key,
        action: Action
    ) {

        setPermissions(previous => {

            const updated = new Map(previous);

            const actions = new Set(
                updated.get(key) ?? []
            );


            if (actions.has(action)) {
                actions.delete(action);
            } else {
                actions.add(action);
            }


            updated.set(key, actions);

            return updated;
        });
    }

    const handleSubmit = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const payload = {
                id: admin?.id,
                username,
                email,
                isSuperAdmin,
                permissions: Array.from(
                    permissions.entries()
                ).map(([key, actions]) => ({
                    key,
                    actions: Array.from(actions)
                }))
            };

            await AdminRequests.updateAdmin(payload);

            notify.success("Administrador atualizado com sucesso!");

            setUsername("");
            setEmail("");
            setPermissions(new Map())

            onSuccess?.();
            onClose();  
        } catch (err) {
            notify.error("Erro ao editar Administrador");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className={`${styles.overlay} ${loading ? styles.loading : ""}`}
            onClick={onClose}
        >

            <div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
            >

                <header className={styles.header}>

                    <div>

                        <span className={styles.typeBadge}>
                            EDIT ADMIN
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


                        <div className={styles.formGrid}>

                            <div className={styles.field}>

                                <label>
                                    Usuário
                                </label>

                                <input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />

                            </div>


                            <div className={styles.field}>

                                <label>
                                    Email
                                </label>

                                <input
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />

                            </div>

                        </div>

                    </section>



                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Permissões
                        </h3>
                        
                        <div className={styles.superAdminContainer}>
                            <label className={styles.checkbox}>
                                <button
                                    key="isAdmin"
                                    id="isSuperAdmin"
                                    className={`${styles.permissionToggle} ${
                                        isSuperAdmin ? styles.enabled : styles.disabled
                                    }`}
                                    onClick={() => setIsSuperAdmin(!isSuperAdmin)}
                                >
                                    <span />
                                </button>

                                Super Admin
                            </label>
                        </div>


                        <div className={styles.permissionTable}>


                            <div className={styles.permissionRowHeader}>

                                <span>
                                    Recurso
                                </span>


                                {ACTIONS.map(action => (
                                    <span key={action}>
                                        {action}
                                    </span>
                                ))}

                            </div>



                            {
                                KEYS.map(key => (

                                    <div
                                        key={key}
                                        className={styles.permissionRow}
                                    >

                                        <strong>
                                            {key}
                                        </strong>


                                        {
                                            ACTIONS.map(action => {

                                                const active =
                                                    permissions
                                                        .get(key)
                                                        ?.has(action) ?? false;

                                                return (
                                                    <button
                                                        key={action}
                                                        className={`${styles.permissionToggle} ${
                                                            active ? styles.enabled : styles.disabled
                                                        }`}
                                                        onClick={() => togglePermission(key, action)}
                                                    >
                                                        <span />
                                                    </button>
                                                );

                                            })
                                        }


                                    </div>

                                ))
                            }


                        </div>


                    </section>


                </div>



                <footer className={styles.footer}>

                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>


                    <button
                        className={`${styles.saveButton} ${loading ? styles.disabled : ""}`}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Salvar
                    </button>

                </footer>


            </div>

        </div>
    );
}