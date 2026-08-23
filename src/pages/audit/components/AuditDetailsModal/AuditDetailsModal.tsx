import { useEffect } from "react";
import { History } from "lucide-react";

import { useNotification } from "../../../../hooks/notification/useNotification";
import styles from "./AuditDetailsModal.module.css";
import {
    formatCategory,
    formatDateTime,
    formatEventType,
    formatEnumValue,
    formatOutcome,
    formatResourceType,
    hasJsonContent,
    type AuditEvent
} from "../../lib/Audit";

interface AuditDetailsModalProps {
    isOpen: boolean;
    event: AuditEvent | null;
    onClose: () => void;
    onViewResourceHistory: (event: AuditEvent) => void;
}

export function AuditDetailsModal({
    isOpen,
    event,
    onClose,
    onViewResourceHistory
}: AuditDetailsModalProps) {

    const { notify } = useNotification();

    useEffect(() => {
        if (!event) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [event, onClose]);

    if (!isOpen || !event) return null;

    const isFailure = event.outcome === "FAILURE";
    const outcomeClass = isFailure ? styles.failure : event.outcome === "SUCCESS" ? styles.success : styles.neutral;

    const trackingItems = [
        { label: "requestId", value: event.requestId },
        { label: "correlationId", value: event.correlationId },
        { label: "operationId", value: event.operationId },
        { label: "transactionId", value: event.transactionId }
    ].filter(item => item.value);

    const sourceItems = [
        { label: "sourceType", value: event.sourceType },
        { label: "sourceDetail", value: event.sourceDetail }
    ].filter(item => item.value);

    const jsonSections = [
        { title: "Antes", value: event.beforeState },
        { title: "Depois", value: event.afterState },
        { title: "Delta", value: event.delta },
        { title: "Metadados", value: event.metadata }
    ].filter((section): section is { title: string; value: Record<string, unknown> } =>
        hasJsonContent(section.value)
    );

    const handleCopyJson = async (title: string, value: Record<string, unknown>) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
            notify.success(`${title} copiado para a área de transferência.`);
        } catch {
            notify.error(`Não foi possível copiar "${title}".`);
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >

                <header className={styles.header}>

                    <div>

                        <span className={styles.typeBadge}>
                            AUDITORIA
                        </span>

                        <h2 className={styles.title}>
                            {formatEventType(event.eventType)}
                        </h2>

                        <span className={styles.eventId} title={event.eventId}>
                            ID: {event.eventId}
                        </span>

                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        &times;
                    </button>

                </header>

                <div className={styles.body}>

                    <div className={styles.contentGrid}>
                        <div className={styles.leftColumn}>
                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Informações Gerais
                                </h3>

                                <div className={styles.infoGrid}>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Data / Hora
                                        </span>

                                        <strong>
                                            {formatDateTime(event.occurredAt)}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Categoria
                                        </span>

                                        <span className={styles.badge}>
                                            {formatCategory(event.category)}
                                        </span>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Resultado
                                        </span>

                                        <span
                                            className={`${styles.statusBadge} ${outcomeClass}`}
                                            title={isFailure ? event.failureReason ?? undefined : undefined}
                                        >
                                            ● {formatOutcome(event.outcome)}
                                        </span>
                                    </div>

                                    {isFailure && event.failureReason && (
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>
                                                Motivo da Falha
                                            </span>

                                            <strong className={styles.dangerText}>
                                                {event.failureReason}
                                            </strong>
                                        </div>
                                    )}

                                    {event.reasonCode && (
                                        <div className={styles.infoCard}>
                                            <span className={styles.infoLabel}>
                                                Código do Motivo
                                            </span>

                                            <code>
                                                {event.reasonCode}
                                            </code>
                                        </div>
                                    )}

                                </div>

                            </section>

                            <section className={styles.section}>

                                {(event.actorId || event.actorName || event.actorType) && (
                                    <div className={styles.infoCard}>

                                        <span className={styles.infoLabel}>
                                            Ator
                                        </span>

                                        <strong>
                                            {event.actorName ?? formatEnumValue(event.actorType)}
                                        </strong>

                                        {event.actorType && (
                                            <div className={styles.referenceItem}>
                                                <span className={styles.referenceLabel}>
                                                    Tipo
                                                </span>

                                                <span className={styles.referenceBadge}>
                                                    {formatEnumValue(event.actorType)}
                                                </span>
                                            </div>
                                        )}

                                        {event.actorId && (
                                            <div className={styles.referenceItem}>
                                                <span className={styles.referenceLabel}>
                                                    ID
                                                </span>

                                                <code title={event.actorId}>
                                                    {event.actorId}
                                                </code>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {event.targetUserId && (
                                    <div className={styles.infoCard}>

                                        <span className={styles.infoLabel}>
                                            Usuário Alvo
                                        </span>

                                        <code title={event.targetUserId}>
                                            {event.targetUserId}
                                        </code>

                                    </div>
                                )}

                                {(event.resourceType || event.resourceId) && (
                                    <div className={styles.infoCard}>

                                        <span className={styles.infoLabel}>
                                            Recurso
                                        </span>

                                        <span className={styles.badge}>
                                            {formatResourceType(event.resourceType)}
                                        </span>

                                        {event.resourceId && (
                                            <div className={styles.referenceItem}>
                                                <span className={styles.referenceLabel}>
                                                    ID
                                                </span>

                                                <code title={event.resourceId}>
                                                    {event.resourceId}
                                                </code>
                                            </div>
                                        )}

                                    </div>
                                )}

                            </section>
                        </div>

                        <div className={styles.rightColumn}>
                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Rastreamento
                                </h3>

                                <div className={styles.referenceGrid}>

                                    {(trackingItems.length > 0 || sourceItems.length > 0) ? (
                                        <div className={styles.infoCard}>

                                            {trackingItems.map(item => (
                                                <div key={item.label} className={styles.referenceItem}>
                                                    <span className={styles.referenceLabel}>
                                                        {item.label}
                                                    </span>

                                                    <code title={item.value ?? ""}>
                                                        {item.value}
                                                    </code>
                                                </div>
                                            ))}

                                            {sourceItems.map(item => (
                                                <div key={item.label} className={styles.referenceItem}>
                                                    <span className={styles.referenceLabel}>
                                                        {item.label}
                                                    </span>

                                                    <strong>
                                                        {item.value}
                                                    </strong>
                                                </div>
                                            ))}

                                        </div>
                                    ) : (
                                        <div className={styles.infoCard}>
                                            <span className={styles.referenceLabel}>
                                                Nenhum dado de rastreamento registrado para este evento.
                                            </span>
                                        </div>
                                    )}

                                </div>

                            </section>
                        </div>
                    </div>

                    {jsonSections.length > 0 && (
                        <section className={styles.section}>

                            <h3 className={styles.sectionTitle}>
                                Alterações de Estado
                            </h3>

                            <div className={styles.jsonList}>

                                {jsonSections.map(section => (
                                    <div key={section.title} className={styles.jsonBlock}>

                                        <div className={styles.jsonHeader}>
                                            <span className={styles.jsonTitle}>
                                                {section.title}
                                            </span>

                                            <button
                                                className={styles.copyButton}
                                                onClick={() => handleCopyJson(section.title, section.value)}
                                            >
                                                Copiar
                                            </button>
                                        </div>

                                        <pre className={styles.jsonContent}>
                                            {JSON.stringify(section.value, null, 2)}
                                        </pre>

                                    </div>
                                ))}

                            </div>

                        </section>
                    )}

                </div>

                <footer className={styles.footer}>

                    {event.resourceType && event.resourceId && (
                        <button
                            className={styles.historyButton}
                            onClick={() => onViewResourceHistory(event)}
                        >
                            <History size={16} />
                            Ver histórico do recurso
                        </button>
                    )}

                    <button
                        className={styles.confirmButton}
                        onClick={onClose}
                    >
                        Fechar
                    </button>

                </footer>

            </div>
        </div>
    );
}
