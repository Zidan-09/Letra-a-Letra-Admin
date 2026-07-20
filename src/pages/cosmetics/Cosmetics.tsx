import { useState, useEffect } from "react";
import { Table, type Column } from "../../components/Table/Table";
import { CreateCosmeticPopup } from "../../components/Cosmetic/CreatePopup/CreateCosmeticPopup";
import { EditCosmeticPopup } from "../../components/Cosmetic/EditPopup/EditCosmeticPopup";
import { useNotification } from "../../hooks/notification/useNotification";
import { type Cosmetic, CosmeticRequests } from "../../lib/Cosmetic";
import styles from "./Cosmetics.module.css";

export function CosmeticsPage() {
  const { notify } = useNotification();

  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCosmetic, setSelectedCosmetic] = useState<Cosmetic | null>(null);

  const assetsUrl = "https://pub-d49bc6f700bc45ba92fed050669b2690.r2.dev";

  const fetchCosmetics = async () => {
    try {
        const data = await CosmeticRequests.getCosmetics(page, 5);
        setCosmetics(data.cosmetics);
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

  const handleViewAsset = (item: Cosmetic) => {
    notify.success(`Abrindo visualização do asset: ${item.name}`);
    window.open(`${assetsUrl}/${item.assetPath}`, "_blank");
  };

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Cosméticos</h1>
          <p>Gerencie, visualize e edite os cosméticos ativos no sistema.</p>
        </div>
        <button className={styles.addButton} onClick={() => setIsCreateOpen(true)}>
          Novo Cosmético
        </button>
      </header>

      <main className={styles.content}>
        <Table<Cosmetic>
          data={cosmetics}
          columns={columns}
          renderActions={(item) => (
            <>
              <button className={styles.actionButton} onClick={() => handleViewAsset(item)}>
                Ver Asset
              </button>
              <button className={styles.actionButton} onClick={() => handleOpenEdit(item)}>
                Editar
              </button>
              <button
                className={`${styles.actionButton} ${item.available ? styles.btnDanger : styles.btnSuccess}`}
                onClick={() => handleToggleStatus(item)}
              >
                {item.available ? "Desabilitar" : "Ativar"}
              </button>
            </>
          )}
          page={page}
          totalPages={totalPages}
          nextPage={() => setPage(prev => prev + 1)}
          prevPage={() => setPage(prev => Math.max(0, prev - 1))}
        />
      </main>

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