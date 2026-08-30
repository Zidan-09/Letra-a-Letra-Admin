import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

import { Table, type Column } from "../../components/Table/Table";
import { useNotification } from "../../hooks/notification/useNotification";
import styles from "./Audit.module.css";

import {
    AuditRequests,
    AUDIT_CATEGORY_OPTIONS,
    AUDIT_EVENT_TYPE_OPTIONS,
    AUDIT_OUTCOME_OPTIONS,
    AUDIT_RESOURCE_TYPE_OPTIONS,
    formatCategory,
    formatDateTime,
    formatEnumValue,
    formatEventType,
    formatOutcome,
    formatResourceType,
    isValidUuid,
    type AuditDirection,
    type AuditEvent,
    type AuditFilters
} from "./lib/Audit";
import { AuditDetailsModal } from "./components/AuditDetailsModal/AuditDetailsModal";

const PAGE_SIZE = 8;

type AuditScope =
    | { mode: "general" }
    | { mode: "resource"; resourceType: string; resourceId: string };

function toOption<T extends string>(options: readonly T[], value: string): T | undefined {
    if (!value) return undefined;
    return options.find(option => option === value);
}

export function AuditPage() {
    const { notify } = useNotification();

    const notifyRef = useRef(notify);

    useEffect(() => {
        notifyRef.current = notify;
    }, [notify]);

    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

    const [filters, setFilters] = useState<AuditFilters>({});
    const [direction, setDirection] = useState<AuditDirection>("DESC");
    const [scope, setScope] = useState<AuditScope>({ mode: "general" });

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(false);
    const [rotating, setRotating] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    const [advancedOpen, setAdvancedOpen] = useState(false);

    const [targetUserDraft, setTargetUserDraft] = useState("");
    const [actorDraft, setActorDraft] = useState("");
    const [resourceIdDraft, setResourceIdDraft] = useState("");
    const [requestIdDraft, setRequestIdDraft] = useState("");
    const [operationIdDraft, setOperationIdDraft] = useState("");
    const [correlationIdDraft, setCorrelationIdDraft] = useState("");
    const [transactionIdDraft, setTransactionIdDraft] = useState("");

    useEffect(() => {
        const invalidUuid =
            (filters.targetUserId && !isValidUuid(filters.targetUserId)) ||
            (filters.actorId && !isValidUuid(filters.actorId)) ||
            (filters.operationId && !isValidUuid(filters.operationId)) ||
            (filters.transactionId && !isValidUuid(filters.transactionId));

        if (invalidUuid) return;

        if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) return;

        let cancelled = false;

        const run = async () => {
            setLoading(true);

            try {
                const data = scope.mode === "general"
                    ? await AuditRequests.getEvents(filters, page, PAGE_SIZE, direction)
                    : await AuditRequests.getEventsByResource(
                        scope.resourceType,
                        scope.resourceId,
                        filters,
                        page,
                        PAGE_SIZE
                    );

                if (cancelled) return;

                setEvents(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);

                if (data.content.length === 0 && page > 0 && data.totalPages > 0 && page >= data.totalPages) {
                    setPage(data.totalPages - 1);
                }
            } catch {
                if (!cancelled) {
                    notifyRef.current.error("Erro ao carregar os registros de auditoria.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [filters, page, direction, scope, refreshTick]);

    const applyFilter = (patch: Partial<AuditFilters>) => {
        setFilters(prev => ({ ...prev, ...patch }));
        setPage(0);
    };

    const handleRefresh = () => {
        if (loading || rotating) return;

        setRotating(true);
        setRefreshTick(tick => tick + 1);

        setTimeout(() => setRotating(false), 500);
    };

    const handleDirectionChange = (next: AuditDirection) => {
        if (next === direction) return;

        setDirection(next);
        setPage(0);
    };

    const handleFromChange = (value: string) => {
        if (value && filters.to && new Date(value) > new Date(filters.to)) {
            notifyRef.current.warning("O início do período deve ser anterior ou igual ao fim.");
            return;
        }

        applyFilter({ from: value || undefined });
    };

    const handleToChange = (value: string) => {
        if (value && filters.from && new Date(value) < new Date(filters.from)) {
            notifyRef.current.warning("O fim do período deve ser posterior ou igual ao início.");
            return;
        }

        applyFilter({ to: value || undefined });
    };

    const handleApplyTargetUser = () => {
        const value = targetUserDraft.trim();

        if (value && !isValidUuid(value)) {
            notifyRef.current.warning("Informe um UUID válido para o usuário alvo.");
            return;
        }

        setFilters(prev => ({ ...prev, targetUserId: value || undefined }));
        setPage(0);
    };

    const handleApplyActor = () => {
        const value = actorDraft.trim();

        if (value && !isValidUuid(value)) {
            notifyRef.current.warning("Informe um UUID válido para o ator.");
            return;
        }

        setFilters(prev => ({ ...prev, actorId: value || undefined }));
        setPage(0);
    };

    const handleApplyResource = () => {
        const value = resourceIdDraft.trim();

        setFilters(prev => ({ ...prev, resourceId: value || undefined }));
        setPage(0);
    };

    const handleApplyAdvanced = () => {
        const requestId = requestIdDraft.trim();
        const correlationId = correlationIdDraft.trim();
        const operationId = operationIdDraft.trim();
        const transactionId = transactionIdDraft.trim();

        if (
            (operationId && !isValidUuid(operationId)) ||
            (transactionId && !isValidUuid(transactionId))
        ) {
            notifyRef.current.warning("operationId e transactionId devem ser UUIDs válidos.");
            return;
        }

        setFilters(prev => ({
            ...prev,
            requestId: requestId || undefined,
            correlationId: correlationId || undefined,
            operationId: operationId || undefined,
            transactionId: transactionId || undefined
        }));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({});
        setTargetUserDraft("");
        setActorDraft("");
        setResourceIdDraft("");
        setRequestIdDraft("");
        setOperationIdDraft("");
        setCorrelationIdDraft("");
        setTransactionIdDraft("");

        if (scope.mode !== "general") {
            setScope({ mode: "general" });
        }

        setPage(0);
    };

    const handleFilterByTargetUser = (userId: string) => {
        setTargetUserDraft(userId);
        setFilters(prev => ({ ...prev, targetUserId: userId }));
        setPage(0);
    };

    const handleViewResourceHistory = (event: AuditEvent) => {
        if (!event.resourceType || !event.resourceId) return;

        setSelectedEvent(null);
        setResourceIdDraft(event.resourceId);
        setScope({
            mode: "resource",
            resourceType: event.resourceType,
            resourceId: event.resourceId
        });
        setPage(0);
    };

    const handleExitResourceHistory = () => {
        setScope({ mode: "general" });
        setPage(0);
    };

    const columns: Column<AuditEvent>[] = [
        {
            header: "Evento",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.eventName}>{formatEventType(item.eventType)}</strong>
                    <span className={styles.mono} title={item.eventId}>
                        {item.eventId}
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
            header: "Ator",
            render: (item) => (
                <div className={styles.info}>
                    <strong>{item.actorName ?? formatEnumValue(item.actorType)}</strong>
                    {item.actorId && (
                        <span className={styles.mono} title={item.actorId}>
                            {item.actorId}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Alvo",
            render: (item) => {
                if (!item.targetUserId) {
                    return <span className={styles.emptyCell}>—</span>;
                }

                const targetUserId = item.targetUserId;

                return (
                    <button
                        className={styles.linkMono}
                        title={`Filtrar eventos deste usuário alvo: ${targetUserId}`}
                        onClick={() => handleFilterByTargetUser(targetUserId)}
                    >
                        {targetUserId}
                    </button>
                );
            },
        },
        {
            header: "Recurso",
            render: (item) => (
                <div className={styles.info}>
                    <span className={styles.badge}>{formatResourceType(item.resourceType)}</span>
                    {item.resourceId && (
                        <span className={styles.mono} title={item.resourceId}>
                            {item.resourceId}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Resultado",
            render: (item) => {
                const outcomeClass =
                    item.outcome === "FAILURE"
                        ? styles.failure
                        : item.outcome === "SUCCESS"
                            ? styles.success
                            : styles.neutral;

                return (
                    <span
                        className={`${styles.statusBadge} ${outcomeClass}`}
                        title={item.outcome === "FAILURE" ? item.failureReason || undefined : undefined}
                    >
                        ● {formatOutcome(item.outcome)}
                    </span>
                );
            },
        },
        {
            header: "Data / Hora",
            render: (item) => (
                <span className={styles.date}>{formatDateTime(item.occurredAt)}</span>
            ),
        },
    ];

    const totalLabel = `${totalElements.toLocaleString("pt-BR")} ${totalElements === 1 ? "registro" : "registros"}`;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Auditoria</h1>
                    <p>Investigue os eventos de negócio registrados pelo sistema.</p>
                </div>

                <div className={styles.actions}>
                    {scope.mode === "general" && (
                        <div className={styles.filterGroup}>
                            <button
                                className={`${styles.filterButton} ${direction === "DESC" ? styles.filterActive : ""}`}
                                onClick={() => handleDirectionChange("DESC")}
                            >
                                Mais recentes
                            </button>
                            <button
                                className={`${styles.filterButton} ${direction === "ASC" ? styles.filterActive : ""}`}
                                onClick={() => handleDirectionChange("ASC")}
                            >
                                Mais antigas
                            </button>
                        </div>
                    )}

                    <button
                        className={styles.refresh}
                        onClick={handleRefresh}
                        disabled={loading || rotating}
                    >
                        <RotateCcw className={rotating ? styles.rotating : ""} />
                    </button>
                </div>
            </header>

            <div className={styles.mainLayout}>
                <aside className={styles.sidebar}>
                    <section className={styles.filters}>
                        <div className={styles.filtersHeader}>
                            <h2 className={styles.filtersTitle}>Filtros</h2>

                            <button className={styles.clearButton} onClick={handleClearFilters}>
                                Limpar filtros
                            </button>
                        </div>

                        <div className={styles.filterGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Categoria</span>
                        <select
                            className={styles.select}
                            value={filters.category ?? ""}
                            onChange={(e) => applyFilter({ category: toOption(AUDIT_CATEGORY_OPTIONS, e.target.value) })}
                        >
                            <option value="">Todas</option>
                            {AUDIT_CATEGORY_OPTIONS.map(category => (
                                <option key={category} value={category}>
                                    {formatCategory(category)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Evento</span>
                        <select
                            className={styles.select}
                            value={filters.eventType ?? ""}
                            onChange={(e) => applyFilter({ eventType: toOption(AUDIT_EVENT_TYPE_OPTIONS, e.target.value) })}
                        >
                            <option value="">Todos</option>
                            {AUDIT_EVENT_TYPE_OPTIONS.map(eventType => (
                                <option key={eventType} value={eventType}>
                                    {formatEventType(eventType)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Tipo de recurso</span>
                        <select
                            className={styles.select}
                            value={filters.resourceType ?? ""}
                            onChange={(e) => applyFilter({ resourceType: toOption(AUDIT_RESOURCE_TYPE_OPTIONS, e.target.value) })}
                        >
                            <option value="">Todos</option>
                            {AUDIT_RESOURCE_TYPE_OPTIONS.map(resourceType => (
                                <option key={resourceType} value={resourceType}>
                                    {formatResourceType(resourceType)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Resultado</span>
                        <select
                            className={styles.select}
                            value={filters.outcome ?? ""}
                            onChange={(e) => applyFilter({ outcome: toOption(AUDIT_OUTCOME_OPTIONS, e.target.value) })}
                        >
                            <option value="">Todos</option>
                            {AUDIT_OUTCOME_OPTIONS.map(outcome => (
                                <option key={outcome} value={outcome}>
                                    {formatOutcome(outcome)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>De</span>
                        <input
                            className={styles.dateTimeInput}
                            type="datetime-local"
                            value={filters.from ?? ""}
                            onChange={(e) => handleFromChange(e.target.value)}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Até</span>
                        <input
                            className={styles.dateTimeInput}
                            type="datetime-local"
                            value={filters.to ?? ""}
                            onChange={(e) => handleToChange(e.target.value)}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Usuário alvo (UUID)</span>
                        <input
                            className={styles.textInput}
                            type="text"
                            placeholder="Aplicar com Enter..."
                            value={targetUserDraft}
                            onChange={(e) => setTargetUserDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyTargetUser();
                            }}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Ator (UUID)</span>
                        <input
                            className={styles.textInput}
                            type="text"
                            placeholder="Aplicar com Enter..."
                            value={actorDraft}
                            onChange={(e) => setActorDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyActor();
                            }}
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>ID do recurso</span>
                        <input
                            className={styles.textInput}
                            type="text"
                            placeholder="Aplicar com Enter..."
                            value={resourceIdDraft}
                            onChange={(e) => setResourceIdDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyResource();
                            }}
                        />
                    </label>
                </div>

                <button
                    className={styles.advancedToggle}
                    onClick={() => setAdvancedOpen(open => !open)}
                >
                    Filtros avançados
                    {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {advancedOpen && (
                    <div className={styles.advancedGrid}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>requestId</span>
                            <input
                                className={styles.textInput}
                                type="text"
                                placeholder="Aplicar com Enter..."
                                value={requestIdDraft}
                                onChange={(e) => setRequestIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleApplyAdvanced();
                                }}
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>operationId (UUID)</span>
                            <input
                                className={styles.textInput}
                                type="text"
                                placeholder="Aplicar com Enter..."
                                value={operationIdDraft}
                                onChange={(e) => setOperationIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleApplyAdvanced();
                                }}
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>correlationId</span>
                            <input
                                className={styles.textInput}
                                type="text"
                                placeholder="Aplicar com Enter..."
                                value={correlationIdDraft}
                                onChange={(e) => setCorrelationIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleApplyAdvanced();
                                }}
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>transactionId (UUID)</span>
                            <input
                                className={styles.textInput}
                                type="text"
                                placeholder="Aplicar com Enter..."
                                value={transactionIdDraft}
                                onChange={(e) => setTransactionIdDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleApplyAdvanced();
                                }}
                            />
                        </label>
                    </div>
                )}
            </section>
        </aside>

        <div className={styles.contentArea}>
            {(loading || events.length > 0 || totalElements > 0) && (
                <div className={styles.tableMeta}>
                    <span>{totalLabel}</span>

                    {scope.mode === "resource" && (
                        <button
                            className={styles.scopeChip}
                            onClick={handleExitResourceHistory}
                            title="Retornar à consulta geral de eventos"
                        >
                            <ArrowLeft size={14} />
                            Histórico do recurso: {scope.resourceType} · {scope.resourceId}
                        </button>
                    )}
                </div>
            )}

            <main className={styles.content}>
                {loading && events.length === 0 ? (
                    <div className={styles.loading}>Carregando eventos...</div>
                ) : (
                    <div className={`${styles.tableWrapper} ${loading ? styles.dimmed : ""}`}>
                        <Table<AuditEvent>
                            data={events}
                            columns={columns}
                            renderActions={(item) => (
                                <button
                                    className={styles.actionButton}
                                    onClick={() => setSelectedEvent(item)}
                                >
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
        </div>
    </div>

            <AuditDetailsModal
                isOpen={!!selectedEvent}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onViewResourceHistory={handleViewResourceHistory}
            />
        </div>
    );
}
