import { useState, useEffect } from "react";
import { RotateCcw, Filter, X } from "lucide-react";

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

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState<TicketFilters>({});

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    const [statusDraft, setStatusDraft] = useState<TicketStatus | "" >("");
    const [categoryDraft, setCategoryDraft] = useState<TicketCategory | "" >("");
    const [userIdDraft, setUserIdDraft] = useState("");

    const fetchTickets = async () => {
        if (loading || rotating) return;

        setLoading(true);

        try {
            const currentFilters: TicketFilters = {
                ...filters,
                page,
                size: PAGE_SIZE
            };

            const data = await TicketRequests.getTickets(currentFilters);

            setTickets(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);

            if (data.content.length === 0 && page > 0 && data.totalPages > 0 && page >= data.totalPages) {
                setPage(data.totalPages - 1);
            }
        } catch {
            notify.error("Erro ao carregar a lista de tickets.");
        } finally {
            setLoading(false);
            setTimeout(() => setRotating(false), 500);
        }
    };

    useEffect(() => {
        if (search.trim()) return;

        fetchTickets();
    }, [page, filters, refreshTick, search]);

    const applyFilter = (patch: Partial<TicketFilters>) => {
        setFilters(prev => ({ ...prev, ...patch }));
        setPage(0);
    };

    const handleRefresh = () => {
        if (loading || rotating) return;

        setRotating(true);
        setRefreshTick(tick => tick + 1);

        setTimeout(() => setRotating(false), 500);
    };

    const handleStatusChange = (value: TicketStatus | "") => {
        setStatusDraft(value);
        applyFilter({ status: value || undefined });
    };

    const handleCategoryChange = (value: TicketCategory | "") => {
        setCategoryDraft(value);
        applyFilter({ category: value || undefined });
    };

    const handleUserIdApply = () => {
        const value = userIdDraft.trim();

        const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (value && !UUID_PATTERN.test(value)) {
            notify.warning("Informe um UUID válido para o usuário.");
            return;
        }

        applyFilter({ userId: value || undefined });
    };

    const handleClearFilters = () => {
        setFilters({});
        setStatusDraft("");
        setCategoryDraft("");
        setUserIdDraft("");
        setPage(0);
    };

    const hasActiveFilters = !!(filters.status || filters.category || filters.userId);

    const columns: Column<Ticket>[] = [
        {
            header: "ID / Assunto",
            render: (item) => (
                <div className={styles.ticketInfo}>
                    <strong className={styles.ticketSubject}>{item.subject}</strong>
                    <span className={styles.ticketId}>{item.ticketId}</span>
                </div>
            ),
        },
        {
            header: "Usuário",
            render: (item) => (
                <div className={styles.userId}>
                    <code title={item.userId}>{item.userId}</code>
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
                    <span className={`${styles.statusBadge} ${isResolved ? styles.statusResolved : styles.statusPending}`}>
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

        try {
            const data = await TicketRequests.getTickets({ userId: search, page: 0, size: PAGE_SIZE });

            if (data.content.length > 0) {
                notify.success(`Tickets do usuário ${search} encontrados!`);
            } else {
                notify.warning(`Nenhum ticket encontrado para o usuário ${search}.`);
            }

            setTickets(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);

        } catch {
            notify.error(`Erro ao buscar tickets do usuário ${search}`);
        }
    };

    const handleTicketResolved = () => {
        fetchTickets();
    };

    const totalLabel = `${totalElements.toLocaleString("pt-BR")} ${totalElements === 1 ? "ticket" : "tickets"}`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Tickets</h1>
                    <p>Gerencie e acompanhe os tickets de suporte dos usuários.</p>
                </div>

                <div className={styles.headerButtons}>
                    <button
                        className={styles.refresh}
                        onClick={handleRefresh}
                        disabled={loading || rotating}
                    >
                        <RotateCcw className={rotating ? styles.rotating : ""} />
                    </button>

                    <SearchBar
                        value={search}
                        placeholder="Buscar por ID do usuário..."
                        onChange={setSearch}
                        search={handleSearchUser}
                    />
                </div>
            </header>

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
                        <span className={styles.fieldLabel}>ID do Usuário (UUID)</span>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.textInput}
                                type="text"
                                placeholder="Aplicar com Enter..."
                                value={userIdDraft}
                                onChange={(e) => setUserIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleUserIdApply();
                                }}
                            />
                            <button
                                className={styles.applyButton}
                                onClick={handleUserIdApply}
                                title="Aplicar filtro"
                            >
                                Aplicar
                            </button>
                        </div>
                    </label>
                </div>
            </section>

            {(loading || tickets.length > 0 || totalElements > 0) && (
                <div className={styles.tableMeta}>
                    <span>{totalLabel}</span>
                </div>
            )}

            <main className={styles.content}>
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
            </main>

            <TicketDetailsModal
                isOpen={!!selectedTicket}
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onTicketResolved={handleTicketResolved}
            />
        </div>
    );
}