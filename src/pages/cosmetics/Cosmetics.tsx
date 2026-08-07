import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { useProfile } from "../../hooks/profile/useProfile";
import { Table, type Column } from "../../components/Table/Table";
import { CreateCosmeticPopup } from "./components/CreatePopup/CreateCosmeticPopup";
import { EditCosmeticPopup } from "./components/EditPopup/EditCosmeticPopup";
import { type Cosmetic, CosmeticRequests } from "./lib/Cosmetic";
import { Trash2 } from "lucide-react";
import styles from "./Cosmetics.module.css";
import { CosmeticDetailsInfo } from "./components/CosmeticInfo/CosmeticDetailsModal";

export function CosmeticsPage() {
  const { notify } = useNotification();
  const { permissions } = useProfile();

  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [selectedCosmetic, setSelectedCosmetic] = useState<Cosmetic | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [ísModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  

  const [canRegister, setCanRegister] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
      const permission = permissions.find(p => p.key === "ADMIN");

      setCanRegister(permission?.actions.includes("CREATE") ?? false);
      setCanEdit(permission?.actions.includes("EDIT") ?? false);
      setCanToggle(permission?.actions.includes("TOGGLE") ?? false);
      setCanDelete(permission?.actions.includes("DELETE") ?? false);
      
  }, [permissions]);

  const fetchCosmetics = async () => {
    try {
        const data = await CosmeticRequests.getCosmetics(page, 5);
        setCosmetics(data.content);
        setTotalPages(data.totalPages);
      
    } catch {
      notify.error("Erro ao carregar a lista de cosméticos.");
    }
  };

  useEffect(() => {
    fetchCosmetics();
  }, [page]);

  const columns: Column<Cosmetic>[] = [
    {
      header: "Nome do Cosmético",
      render: (item) => <strong className={styles.cosmeticName}>{item.name}</strong>,
    },
    {
      header: "Tipo",
      render: (item) => (
        <span className={`${styles.badge} ${styles[item.type.toLowerCase()] || styles.defaultBadge}`}>
          {item.type}
        </span>
      ),
    },
    {
      header: "Ativo",
      render: (item) => (
        <span className={item.available ? styles.statusActive : styles.statusDisabled}>
          ● {item.available ? "Ativo" : "Desativado"}
        </span>
      ),
    },
  ];

  const handleOpenEdit = (item: Cosmetic) => {
    setSelectedCosmetic(item);
    setIsEditOpen(true);
  };

  const handleToggleStatus = async (item: Cosmetic) => {
    try {
      item.available ?
        await CosmeticRequests.disableCosmetic(item.id) : 
        await CosmeticRequests.enableCosmetic(item.id);

      const newStatus = !item.available;
      
      setCosmetics((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, available: newStatus } : c))
      );

      notify.success(`Cosmético ${newStatus ? "ativado" : "desativado"} com sucesso!`);
    } catch {
      notify.error("Não foi possível alterar o status do cosmético.");
    }
  };

  const handleDeleteCosmetic = async (item: Cosmetic) => {
    try {

      await CosmeticRequests.deleteCosmetic(item.id)

      notify.success(`Cosmético deletado com sucesso!`);

      fetchCosmetics();

    } catch {
      notify.error("Não foi possível alterar o status do cosmético.");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Cosméticos</h1>
          <p>Gerencie, visualize e edite os cosméticos ativos no sistema.</p>
        </div>
        <button
          className={`${styles.addButton} ${canRegister ? "" : styles.disabled}`} 
          onClick={() => setIsCreateOpen(true)}
          disabled={!canRegister}
        >
          Novo Cosmético
        </button>
      </header>

      <main className={styles.content}>
        <Table<Cosmetic>
          data={cosmetics}
          columns={columns}
          renderActions={(item) => (
            <>
              <button className={styles.actionButton} onClick={() => { setSelectedCosmetic(item); setIsModalOpen(true); console.trace("ABRINDO DETALHES"); }}>
                Detalhes
              </button>
              <button
                className={`${styles.actionButton} ${canEdit ? "" : styles.disabled}`} 
                onClick={() => handleOpenEdit(item)}
                disabled={!canEdit}
              >
                Editar
              </button>
              <button
                className={`${styles.actionButton} ${item.available ? styles.btnDanger : styles.btnSuccess} ${canToggle ? "" : styles.disabled}`}
                onClick={() => handleToggleStatus(item)}
                disabled={!canToggle}
              >
                {item.available ? "Desabilitar" : "Ativar"}
              </button>

              <button
                  className={`${styles.actionButton} ${styles.deleteButton} ${canDelete ? "" : styles.disabled}`} 
                  onClick={() => handleDeleteCosmetic(item)}
                  disabled={!canDelete}
              >
                  <Trash2 />
              </button>
            </>
          )}
          page={page}
          totalPages={totalPages}
          nextPage={() => setPage(prev => prev + 1)}
          prevPage={() => setPage(prev => Math.max(0, prev - 1))}
        />
      </main>

      <CosmeticDetailsInfo 
        isOpen={ísModalOpen}
        cosmetic={selectedCosmetic}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCosmetic(null);
        }}
      />

      <CreateCosmeticPopup 
        isOpen={isCreateOpen} 
        onClose={() => {
          setIsCreateOpen(false);
          fetchCosmetics();
        }} 
      />

      <EditCosmeticPopup
        isOpen={isEditOpen}
        cosmetic={selectedCosmetic}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedCosmetic(null);
        }}
        onSuccess={fetchCosmetics}
      />
    </div>
  );
}