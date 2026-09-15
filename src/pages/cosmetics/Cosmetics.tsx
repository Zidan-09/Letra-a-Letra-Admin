import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { useProfile } from "../../hooks/profile/useProfile";
import { Table, type Column } from "../../components/Table/Table";
import { CreateCosmeticPopup } from "./components/CreatePopup/CreateCosmeticPopup";
import { EditCosmeticPopup } from "./components/EditPopup/EditCosmeticPopup";
import { type UserItem, CosmeticRequests } from "./lib/Cosmetic";
import styles from "./Cosmetics.module.css";
import { CosmeticDetailsInfo } from "./components/CosmeticInfo/CosmeticDetailsModal";

export function CosmeticsPage() {
  const { notify } = useNotification();
  const { permissions } = useProfile();

  const [cosmetics, setCosmetics] = useState<UserItem[]>([]);
  const [selectedCosmetic, setSelectedCosmetic] = useState<UserItem | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const [ísModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const [canRegister, setCanRegister] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  useEffect(() => {
      const permission = permissions.find(p => p.key === "COSMETIC");

      setCanRegister(permission?.actions.includes("CREATE") ?? false);
      setCanEdit(permission?.actions.includes("EDIT") ?? false);
      setCanToggle(permission?.actions.includes("TOGGLE") ?? false);

  }, [permissions]);

  const fetchCosmetics = async () => {
    try {
        const items = await CosmeticRequests.listItems({ kind: "COSMETIC" });
        setCosmetics(items);
    } catch {
      notify.error("Erro ao carregar a lista de cosméticos.");
    }
  };

  useEffect(() => {
    fetchCosmetics();
  }, []);

  const isAvailable = (item: UserItem) => availability[item.itemId] ?? true;

  const columns: Column<UserItem>[] = [
    {
      header: "Nome do Cosmético",
      render: (item) => <strong className={styles.cosmeticName}>{item.name}</strong>,
    },
    {
      header: "Categoria",
      render: (item) => (
        <span className={`${styles.badge} ${styles[item.category.toLowerCase()] || styles.defaultBadge}`}>
          {item.category}
        </span>
      ),
    },
    {
      header: "Quantidade",
      render: (item) => <span>{item.quantity}</span>,
    },
    {
      header: "Ativo",
      render: (item) => {
        const available = isAvailable(item);

        return (
          <span className={available ? styles.statusActive : styles.statusDisabled}>
            ● {available ? "Ativo" : "Desativado"}
          </span>
        );
      },
    },
  ];

  const handleOpenEdit = (item: UserItem) => {
    setSelectedCosmetic(item);
    setIsEditOpen(true);
  };

  const handleToggleStatus = async (item: UserItem) => {
    try {
      const updated = await CosmeticRequests.setAvailable(item.itemId, !isAvailable(item));

      setAvailability((prev) => ({ ...prev, [item.itemId]: updated.available }));

      notify.success(`Cosmético ${updated.available ? "ativado" : "desativado"} com sucesso!`);
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
        <button
          className={`${styles.addButton} ${canRegister ? "" : styles.disabled}`}
          onClick={() => setIsCreateOpen(true)}
          disabled={!canRegister}
        >
          Novo Cosmético
        </button>
      </header>

      <main className={styles.content}>
        <Table<UserItem>
          data={cosmetics}
          columns={columns}
          renderActions={(item) => (
            <>
              <button className={styles.actionButton} onClick={() => { setSelectedCosmetic(item); setIsModalOpen(true); }}>
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
                className={`${styles.actionButton} ${isAvailable(item) ? styles.btnDanger : styles.btnSuccess} ${canToggle ? "" : styles.disabled}`}
                onClick={() => handleToggleStatus(item)}
                disabled={!canToggle}
              >
                {isAvailable(item) ? "Desabilitar" : "Ativar"}
              </button>
            </>
          )}
          page={0}
          totalPages={1}
          nextPage={() => {}}
          prevPage={() => {}}
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
