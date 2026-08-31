import { useEffect, useRef, useState } from "react";
import { Filter, RotateCcw, X } from "lucide-react";

import { useNotification } from "../../hooks/notification/useNotification";
import { Table, type Column } from "../../components/Table/Table";
import { TicketDetailsModal } from "./components/TicketInfo/TicketDetailsModal";
import { SearchBar } from "../../components/Search/SearchBar";
import {
    TicketRequests,
    type Ticket,
    type TicketFilters,
    type TicketCategory,
    type TicketStatus,
    formatCategory,
    formatStatus,
    formatDateTime,
    TICKET_CATEGORY_OPTIONS,
    TICKET_STATUS_OPTIONS
} from "./lib/Tickets";
import styles from "./Tickets.module.css";

const PAGE_SIZE = 8;

export function TicketsPage() {
    const { notify } = useNotification();

    const notifyRef = useRef(notify);

    useEffect(() => {
        notifyRef.current = notify;
    }, [notify]);

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState<TicketFilters>({});
    const [direction, setDirection] = useState<"DESC" | "ASC">("DESC");

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [_totalElements, setTotalElements] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    const [statusDraft, setStatusDraft] = useState<TicketStatus | "">("");
    const [categoryDraft, setCategoryDraft] = useState<TicketCategory | "">("");

    const fetchTickets = async () => {
        if (loading || rotating) return;

        setLoading(true);

        try {
            const currentFilters: TicketFilters = {
                ...filters,
                page,
                size: PAGE_SIZE,
                direction
            };

            const data = await TicketRequests.getTickets(currentFilters);

            setTickets(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);

            if (data.content.length === 0 && page > 0 && data.totalPages > 0 && page >= data.totalPages) {
                setPage(data.totalPages - 1);
            }
        } catch {
            notifyRef.current.error("Erro ao carregar a lista de tickets.");
        } finally {
            setLoading(false);
            setTimeout(() => setRotating(false), 500);
        }
    };

    useEffect(() => {
        if (search.trim()) return;

        fetchTickets();
    }, [page, filters, direction, refreshTick, search]);

    const applyFilter = (patch: Partial<TicketFilters>) => {
        setFilters(prev => ({ ...prev, ...patch }));
        setPage(0);
    };

    const handleRefresh = () => {
        if (loading || rotating) return;

        setRotating(true);
        setRefreshTick(tick => tick + 1);
        fetchTickets();

        setTimeout(() => setRotating(false), 500);
    };

    const handleDirectionChange = (next: "DESC" | "ASC") => {
        if (next === direction) return;

        setDirection(next);
        setPage(0);
    };

    const handleStatusChange = (value: TicketStatus | "") => {
        setStatusDraft(value);
        applyFilter({ status: value || undefined });
    };

    const handleCategoryChange = (value: TicketCategory | "") => {
        setCategoryDraft(value);
        applyFilter({ category: value || undefined });
    };

    const handleClearFilters = () => {
        setFilters({});
        setStatusDraft("");
        setCategoryDraft("");
        setPage(0);
    };

    const hasActiveFilters = !!(filters.status || filters.category || filters.userId);

    const columns: Column<Ticket>[] = [
        {
            header: "ID / Assunto",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.eventName}>{item.subject}</strong>
                    <span className={styles.mono} title={item.ticketId}>
                        {item.ticketId}
                    </span>
                </div>
            ),
        },
        {
            header: "Usuário",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.eventName}>{item.username}</strong>
                    <span className={styles.mono} title={item.ticketId}>
                        {item.userId}
                    </span>
                </div>
            ),
        },
        {
            header: "Categoria",
            render: (item) => (
                <span className={styles.badge}>{formatCategory(item.category)}</span>
            ),
        },
        {
            header: "Status",
            render: (item) => {
                const isResolved = item.status === "RESOLVED";

                return (
                    <span className={`${styles.statusBadge} ${isResolved ? styles.success : styles.statusPending}`}>
                        ● {formatStatus(item.status)}
                    </span>
                );
            },
        },
        {
            header: "Criado em",
            render: (item) => (
                <span className={styles.date}>{formatDateTime(item.createdAt)}</span>
            ),
        },
    ];

    const handleInspectTicket = (item: Ticket) => {
        setSelectedTicket(item);
    };

    const handleSearchUser = async () => {
        if (!search.trim()) return;

        setPage(0);

        try {
            const data = await TicketRequests.getTicketsByUserUsername(search, page, 20);

            if (data.content.length > 0) {
                notifyRef.current.success(`Tickets do usuário ${search} encontrados!`);
            } else {
                notifyRef.current.warning(`Nenhum ticket encontrado para o usuário ${search}.`);
            }

            setTickets(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);

        } catch {
            notifyRef.current.error(`Erro ao buscar tickets do usuário ${search}`);
        }
    };

    const handleTicketResolved = () => {
        fetchTickets();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Tickets</h1>
                    <p>Gerencie e acompanhe os tickets de suporte dos usuários.</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.refresh}
                        onClick={handleRefresh}
                        disabled={loading || rotating}
                    >
                        <RotateCcw className={rotating ? styles.rotating : ""} />
                    </button>

                    <SearchBar
                        value={search}
                        placeholder="Pesquisar por jogador..."
                        onChange={setSearch}
                        search={handleSearchUser}
                    />
                </div>
            </header>

            <div className={styles.mainLayout}>
                <aside className={styles.sidebar}>
                    <section className={styles.filters}>
                        <div className={styles.filtersHeader}>
                            <h2 className={styles.filtersTitle}>
                                <Filter size={18} /> Filtros
                            </h2>

                            {hasActiveFilters && (
                                <button className={styles.clearButton} onClick={handleClearFilters}>
                                    <X size={14} /> Limpar filtros
                                </button>
                            )}
                        </div>

                        <div className={styles.filterGrid}>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Status</span>
                                <select
                                    className={styles.select}
                                    value={statusDraft}
                                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus | "")}
                                >
                                    <option value="">Todos</option>
                                    {TICKET_STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>
                                            {formatStatus(status)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Categoria</span>
                                <select
                                    className={styles.select}
                                    value={categoryDraft}
                                    onChange={(e) => handleCategoryChange(e.target.value as TicketCategory | "")}
                                >
                                    <option value="">Todas</option>
                                    {TICKET_CATEGORY_OPTIONS.map(category => (
                                        <option key={category} value={category}>
                                            {formatCategory(category)}
                                        </option>
                                    ))}
                                </select>
                            </label> 

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Ordem</span>
                                <select
                                    className={styles.select}
                                    value={direction}
                                    onChange={(e) => handleDirectionChange(e.target.value as any)}
                                >
                                    <option key="ASC" value={"ASC"}>
                                        Mais Recentes
                                    </option>
                                    <option key="DESC" value={"DESC"}>
                                        Mais Antigas
                                    </option>
                                </select>
                            </label> 
                        </div>
                    </section>
                </aside>

                <div className={styles.contentArea}>
                    <div className={styles.content}>
                        {loading && tickets.length === 0 ? (
                            <div className={styles.loading}>Carregando tickets...</div>
                        ) : (
                            <div className={`${styles.tableWrapper} ${loading ? styles.dimmed : ""}`}>
                                <Table<Ticket>
                                    data={tickets}
                                    columns={columns}
                                    renderActions={(item) => (
                                        <button className={styles.actionButton} onClick={() => handleInspectTicket(item)}>
                                            Detalhes
                                        </button>
                                    )}
                                    page={page}
                                    totalPages={totalPages}
                                    nextPage={() => setPage((prev) => prev + 1)}
                                    prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TicketDetailsModal
                isOpen={!!selectedTicket}
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onTicketResolved={handleTicketResolved}
            />
        </div>
    );
}