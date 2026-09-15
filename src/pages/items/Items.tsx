import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { useProfile } from "../../hooks/profile/useProfile";
import { Table, type Column } from "../../components/Table/Table";
import { CreateItemPopup } from "./components/CreatePopup/CreateItemPopup";
import { EditItemPopup } from "./components/EditPopup/EditItemPopup";
import { type UserItem, type ItemKind, type ItemCategory, ItemRequests } from "./lib/Item";
import styles from "./Items.module.css";
import { ItemDetailsInfo } from "./components/ItemInfo/ItemDetailsModal";

const KIND_OPTIONS: ("ALL" | ItemKind)[] = ["ALL", "COSMETIC", "CONSUMABLE"];

const CATEGORY_OPTIONS: ("ALL" | ItemCategory)[] = [
  "ALL",
  "AVATAR",
  "BANNER",
  "FRAME",
  "EMOTE",
  "BOARD_SKIN",
  "CELL_SKIN",
  "XP_BOOST"
];

export function ItemsPage() {
  const { notify } = useNotification();
  const { permissions } = useProfile();

  const [items, setItems] = useState<UserItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const [kindFilter, setKindFilter] = useState<"ALL" | ItemKind>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ItemCategory>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const [canRegister, setCanRegister] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  useEffect(() => {
      const permission = permissions.find(p => p.key === "ITEMS");

      setCanRegister(permission?.actions.includes("CREATE") ?? false);
      setCanEdit(permission?.actions.includes("EDIT") ?? false);
      setCanToggle(permission?.actions.includes("TOGGLE") ?? false);

  }, [permissions]);

  const fetchItems = async (kind: "ALL" | ItemKind = kindFilter, category: "ALL" | ItemCategory = categoryFilter) => {
    try {
        const data = await ItemRequests.listItems({
          ...(kind !== "ALL" ? { kind } : {}),
          ...(category !== "ALL" ? { category } : {})
        });
        setItems(data);
    } catch {
      notify.error("Erro ao carregar a lista de itens.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const isAvailable = (item: UserItem) => availability[item.itemId] ?? true;

  const columns: Column<UserItem>[] = [
    {
      header: "Nome do Item",
      render: (item) => <strong className={styles.itemName}>{item.name}</strong>,
    },
    {
      header: "Tipo",
      render: (item) => (
        <span className={styles.badge}>
          {item.kind}
        </span>
      ),
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
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleToggleStatus = async (item: UserItem) => {
    try {
      const updated = await ItemRequests.setAvailable(item.itemId, !isAvailable(item));

      setAvailability((prev) => ({ ...prev, [item.itemId]: updated.available }));

      notify.success(`Item ${updated.available ? "ativado" : "desativado"} com sucesso!`);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Não foi possível alterar o status do item.");
    }
  };

  const handleKindChange = (kind: "ALL" | ItemKind) => {
    setKindFilter(kind);
    fetchItems(kind, categoryFilter);
  };

  const handleCategoryChange = (category: "ALL" | ItemCategory) => {
    setCategoryFilter(category);
    fetchItems(kindFilter, category);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Itens</h1>
          <p>Gerencie, visualize e edite os itens ativos no sistema.</p>
        </div>
        <button
          className={`${styles.addButton} ${canRegister ? "" : styles.disabled}`}
          onClick={() => setIsCreateOpen(true)}
          disabled={!canRegister}
        >
          Novo Item
        </button>
      </header>

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span>Tipo</span>
          <select value={kindFilter} onChange={(e) => handleKindChange(e.target.value as "ALL" | ItemKind)}>
            {KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>{kind === "ALL" ? "Todos" : kind}</option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Categoria</span>
          <select value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value as "ALL" | ItemCategory)}>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>{category === "ALL" ? "Todas" : category}</option>
            ))}
          </select>
        </label>
      </div>

      <main className={styles.content}>
        <Table<UserItem>
          data={items}
          columns={columns}
          renderActions={(item) => (
            <>
              <button className={styles.actionButton} onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}>
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

      <ItemDetailsInfo
        isOpen={isModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
      />

      <CreateItemPopup
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          fetchItems();
        }}
      />

      <EditItemPopup
        isOpen={isEditOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={fetchItems}
      />
    </div>
  );
}
