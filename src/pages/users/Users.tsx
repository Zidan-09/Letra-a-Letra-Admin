import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { Table, type Column } from "../../components/Table/Table";
import { UserDetailsInfo } from "./components/UserInfo/UserDetailsInfo";
import { UserRequests, type User } from "../../lib/Users";
import { RotateCcw } from "lucide-react";
import styles from "./Users.module.css";

export function UsersPage() {
    const { notify } = useNotification();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [rotating, setRotating] = useState(false);

    const fetchUsers = async () => {
        if (rotating) return;

        setRotating(true);

        try {
            const data = await UserRequests.getUsers(page, 8);
    
            setUsers(data.content);
            setTotalPages(data.totalPages);

        } catch (e) {
            console.error(e);
            notify.error("Erro ao carregar a lista de usuários.");
        } finally {
            setTimeout(() => setRotating(false), 500);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const columns: Column<User>[] = [
        {
            header: "ID / Nome do Usuário",
            render: (item) => (
                <div className={styles.userInfo}>
                    <strong className={styles.userNickname}>{item.nickname || "Nickname inválido"}</strong>
                    <span className={styles.userId}>{item.userId}</span>
                </div>
            ),
        },
        {
            header: "Email",
            render: (item) => (
                <div className={styles.userEmail}>
                    <span className={styles.userEmailValue}>
                        {item.email}
                    </span>
                </div>
            ),
        },
    ];

    const handleInspectUser = (item: User) => {
        setSelectedUser(item);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Usuários</h1>
                    <p>Acompanhe e monitore os jogadores registrados no jogo.</p>
                </div>

                <button
                    className={styles.refresh}
                    onClick={fetchUsers}
                >
                    <RotateCcw className={rotating ? styles.rotating : ""} />
                </button>
            </header>

            <main className={styles.content}>
                <Table<User>
                    data={users}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button className={styles.actionButton} onClick={() => handleInspectUser(item)}>
                                Detalhes
                            </button>
                        </>
                    )}
                    page={page}
                    totalPages={totalPages}
                    nextPage={() => setPage((prev) => prev + 1)}
                    prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
                />   
            </main>

            <UserDetailsInfo
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />

        </div>  
    )
}