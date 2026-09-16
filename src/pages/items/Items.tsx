import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { useProfile } from "../../hooks/profile/useProfile";
import { Table, type Column } from "../../components/Table/Table";
import { CreateItemPopup } from "./components/CreatePopup/CreateItemPopup";
import { EditItemPopup } from "./components/EditPopup/EditItemPopup";
import { type ItemDefinition, type ItemKind, type ItemCategory, ItemRequests } from "./lib/Item";
import styles from "./Items.module.css";
import { ItemDetailsInfo } from "./components/ItemInfo/ItemDetailsModal";
import { Trash2 } from "lucide-react";

const PAGE_SIZE = 8;

const KIND_OPTIONS: ("ALL" | ItemKind)[] = ["ALL", "COSMETIC", "CONSUMABLE"];

const CATEGORY_OPTIONS: ("ALL" | ItemCategory)[] = [
  "ALL",
  "AVATAR",
  "BANNER",
  "FRAME",
  "EMOTE",
  "BOARD_SKIN",
  "CELL_SKIN",
  "XP_BOOST",
  "RANKING_POINTS_BOOST",
  "COIN_BOOST",
  "RANKING_POINTS_PROTECTION",
  "CHANGE_NICKNAME"
];

const AVAILABILITY_OPTIONS = ["ALL", "AVAILABLE", "UNAVAILABLE"] as const;

type AvailabilityFilter = typeof AVAILABILITY_OPTIONS[number];

export function ItemsPage() {
  const { notify } = useNotification();
  const { permissions } = useProfile();

  const [items, setItems] = useState<ItemDefinition[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [kindFilter, setKindFilter] = useState<"ALL" | ItemKind>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ItemCategory>("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const [canRegister, setCanRegister] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
      const permission = permissions.find(p => p.key === "ITEMS");

      setCanRegister(permission?.actions.includes("CREATE") ?? false);
      setCanEdit(permission?.actions.includes("EDIT") ?? false);
      setCanToggle(permission?.actions.includes("TOGGLE") || permission?.actions.includes("EDIT") || false);
      setCanDelete(permission?.actions.includes("DELETE") ?? false);

  }, [permissions]);

  const fetchItems = async (
    nextPage: number = page,
    kind: "ALL" | ItemKind = kindFilter,
    category: "ALL" | ItemCategory = categoryFilter,
    availability: AvailabilityFilter = availabilityFilter
  ) => {
    try {
        const data = await ItemRequests.listDefinitions(nextPage, PAGE_SIZE, {
          ...(kind !== "ALL" ? { kind } : {}),
          ...(category !== "ALL" ? { category } : {}),
          ...(availability !== "ALL" ? { available: availability === "AVAILABLE" } : {})
        });
        setItems(data.content);
        setTotalPages(data.totalPages);
    } catch {
      notify.error("Erro ao carregar a lista de itens.");
    }
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  const columns: Column<ItemDefinition>[] = [
    {
      header: "Nome do Item",
      render: (item) => (
        <div className={styles.itemInfo}>
          <strong className={styles.itemName}>{item.name}</strong>
          <span className={styles.itemId}>{item.itemId}</span>
        </div>
      ),
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
      header: "Contexto",
      render: (item) => (
        <span className={styles.badge}>
          {item.context}
        </span>
      ),
    },
    {
      header: "Versão",
      render: (item) => <span>v{item.version}</span>,
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

  const handleOpenEdit = (item: ItemDefinition) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleToggleStatus = async (item: ItemDefinition) => {
    try {
      const updated = await ItemRequests.setAvailable(item.itemId, !item.available);

      setItems((prev) =>
        prev.map((entry) => (entry.itemId === item.itemId ? updated : entry))
      );

      notify.success(`Item ${updated.available ? "ativado" : "desativado"} com sucesso!`);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Não foi possível alterar o status do item.");
    }
  };

  const handleDeleteItem = async (item: ItemDefinition) => {
    try {
      await ItemRequests.deleteItem(item.itemId);

      notify.success("Item excluído com sucesso!");

      fetchItems(page);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Não foi possível excluir o item.");
    }
  };

  const applyFilters = (kind: "ALL" | ItemKind, category: "ALL" | ItemCategory, availability: AvailabilityFilter) => {
    setKindFilter(kind);
    setCategoryFilter(category);
    setAvailabilityFilter(availability);
    setPage(0);
    fetchItems(0, kind, category, availability);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Itens</h1>
          <p>Gerencie, visualize e edite os itens do catálogo.</p>
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
          <select value={kindFilter} onChange={(e) => applyFilters(e.target.value as "ALL" | ItemKind, categoryFilter, availabilityFilter)}>
            {KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>{kind === "ALL" ? "Todos" : kind}</option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Categoria</span>
          <select value={categoryFilter} onChange={(e) => applyFilters(kindFilter, e.target.value as "ALL" | ItemCategory, availabilityFilter)}>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>{category === "ALL" ? "Todas" : category}</option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Disponibilidade</span>
          <select value={availabilityFilter} onChange={(e) => applyFilters(kindFilter, categoryFilter, e.target.value as AvailabilityFilter)}>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "Todos" : option === "AVAILABLE" ? "Disponíveis" : "Indisponíveis"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <main className={styles.content}>
        <Table<ItemDefinition>
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
                className={`${styles.actionButton} ${item.available ? styles.btnDanger : styles.btnSuccess} ${canToggle ? "" : styles.disabled}`}
                onClick={() => handleToggleStatus(item)}
                disabled={!canToggle}
              >
                {item.available ? "Desabilitar" : "Ativar"}
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton} ${canDelete ? "" : styles.disabled}`}
                onClick={() => handleDeleteItem(item)}
                disabled={!canDelete}
                aria-label="Excluir item"
              >
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
          fetchItems(page);
        }}
      />

      <EditItemPopup
        isOpen={isEditOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={() => fetchItems(page)}
      />
    </div>
  );
}
