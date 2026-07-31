import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { AdminRequests, type Admin } from "./lib/Admins";
import { Table, type Column } from "../../components/Table/Table";
import { RegisterAdminPopup } from "./components/CreatePopup/RegisterAdminPopup";
import { EditAdminPopup } from "./components/EditPopup/EditAdminPopup";
import { AdminDetailsModal } from "./components/AdminInfo/AdminDetailsModal";
import { Trash2 } from "lucide-react";
import styles from "./Admins.module.css";

export function AdminsPage() {
    const { notify } = useNotification();

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchAdmins = async () => {    
        try {
            const data = await AdminRequests.getAdmins(page, 5);
    
            setAdmins(data.content);
            setTotalPages(data.totalPages);

        } catch (e) {
            notify.error("Erro ao carregar a lista de administradores.");
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [page]);

    const columns: Column<Admin>[] = [
        {
            header: "ID / Nome do Administrador",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.adminUsername}>{item.username || "Nome de Administrador Inválido"}</strong>
                    <span className={styles.adminId}>{item.id}</span>
                </div>
            ),
        },
        {
            header: "Email",
            render: (item) => (
                <span className={styles.adminEmail}>
                    {item.email}
                </span>
            ),
        },
    ];

    const handleInspectAdmin = (item: Admin) => {
        setIsModalOpen(true);
        setSelectedAdmin(item);
    }

    const handleEditAdmin = (item: Admin) => {
        setIsEditOpen(true);
        setSelectedAdmin(item);
    }

    const handleDeleteAdmin = async (item: Admin) => {
        try {
            await AdminRequests.removeAdmin(item.id);
            
            await fetchAdmins();

            notify.success(`Administrador removido com sucesso!`);
        } catch {
            notify.error("Não foi possível remover o Administrador.");
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Administradores</h1>
                    <p>Gerencie, visualize e edite os administradores e suas permissões no sistema.</p>
                </div>

                <button className={styles.addButton} onClick={() => setIsCreateOpen(true)}>
                    Novo Administrador
                </button>
            </header>

            <main className={styles.content}>
                <Table<Admin>
                    data={admins}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button className={styles.actionButton} onClick={() => handleInspectAdmin(item)}>
                                Detalhes
                            </button>

                            <button className={styles.actionButton} onClick={() => handleEditAdmin(item)}>
                                Editar
                            </button>
                            
                            <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteAdmin(item)}>
                                <Trash2 />
                            </button>
                        </>
                    )}
                    page={page}
                    totalPages={totalPages}
                    nextPage={() => setPage((prev) => prev + 1)}
                    prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
                />   
            </main>

            <RegisterAdminPopup
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchAdmins();
                }}
            />

            <EditAdminPopup 
                isOpen={isEditOpen}
                admin={selectedAdmin}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedAdmin(null);
                }}
                onSuccess={() => fetchAdmins()}
            />

            <AdminDetailsModal
                isOpen={isModalOpen}
                admin={selectedAdmin}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedAdmin(null);
                }}
            />
        </div>
    );
}