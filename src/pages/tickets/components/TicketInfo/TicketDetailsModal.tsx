import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import { useNotification } from "../../../../hooks/notification/useNotification";
import { TicketRequests, formatCategory, formatStatus, formatDateTime, type Ticket, type ResolveTicketRequest } from "../../lib/Tickets";
import styles from "./TicketDetailsModal.module.css";

interface TicketDetailsModalProps {
    isOpen: boolean;
    ticket: Ticket | null;
    onClose: () => void;
    onTicketResolved: () => void;
}

export function TicketDetailsModal({
    isOpen,
    ticket,
    onClose,
    onTicketResolved
}: TicketDetailsModalProps) {

    const { notify } = useNotification();
    const [resolving, setResolving] = useState(false);
    const [resolutionNote, setResolutionNote] = useState("");

    useEffect(() => {
        if (!ticket) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [ticket, onClose]);

    const handleResolve = async () => {
        if (!ticket || resolving) return;

        setResolving(true);

        try {
            const body: ResolveTicketRequest = { resolutionNote };
            await TicketRequests.resolveTicket(ticket.ticketId, body);

            notify.success("Ticket resolvido com sucesso!");
            onTicketResolved();
            onClose();
        } catch (e) {
            notify.error("Erro ao resolver o ticket.");
        } finally {
            setResolving(false);
        }
    };

    if (!isOpen || !ticket) return null;

    const isResolved = ticket.status === "RESOLVED";

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
                            TICKET
                        </span>

                        <h2 className={styles.title}>
                            {ticket.subject}
                        </h2>

                        <span className={styles.ticketId} title={ticket.ticketId}>
                            ID: {ticket.ticketId}
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
                                            Status
                                        </span>

                                        <span className={`${styles.statusBadge} ${isResolved ? styles.statusResolved : styles.statusPending}`}>
                                            {isResolved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {formatStatus(ticket.status)}
                                        </span>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Categoria
                                        </span>

                                        <span className={styles.badge}>
                                            {formatCategory(ticket.category)}
                                        </span>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Criado em
                                        </span>

                                        <strong>
                                            {formatDateTime(ticket.createdAt)}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Resolvido em
                                        </span>

                                        <strong>
                                            {isResolved ? formatDateTime(ticket.resolvedAt!) : "Pendente"}
                                        </strong>
                                    </div>
                                </div>

                            </section>

                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Usuário
                                </h3>

                                <div className={styles.infoCard}>
                                    <span className={styles.infoLabel}>
                                        ID do Usuário
                                    </span>

                                    <code title={ticket.userId}>
                                        {ticket.userId}
                                    </code>

                                    <span className={styles.infoLabel}>
                                        Username do Usuário
                                    </span>

                                    <code title={ticket.username}>
                                        {ticket.username}
                                    </code>
                                </div>

                            </section>

                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Administrador
                                </h3>

                                <div className={styles.infoCard}>
                                    <span className={styles.infoLabel}>
                                        ID do Administrador
                                    </span>

                                    <code title={ticket.resolvedByAdminId ?? "Pendente"}>
                                        {ticket.resolvedByAdminId ?? "Pendente"}
                                    </code>

                                    <span className={styles.infoLabel}>
                                        Nome do Administrador
                                    </span>

                                    <code title={ticket.adminName ?? "Pendente"}>
                                        {ticket.adminName ?? "Pendente"}
                                    </code>
                                </div>

                            </section>

                        </div>

                        <div className={styles.rightColumn}>
                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Assunto
                                </h3>

                                <div className={styles.infoCard} style={{ width: "100%" }}>
                                    <strong className={styles.subjectText}>
                                        {ticket.subject}
                                    </strong>
                                </div>

                            </section>

                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Descrição
                                </h3>

                                <div className={styles.infoCard} style={{ width: "100%" }}>
                                    <pre className={styles.descriptionText}>
                                        {ticket.description}
                                    </pre>
                                </div>

                            </section>

                            {isResolved && (
                                <section className={`${styles.section} ${styles.resolutionSection}`}>

                                    <h3 className={styles.sectionTitle}>
                                        Observação de Resolução
                                    </h3>

                                    <div className={`${styles.infoCard} ${styles.resolutionCard}`} style={{ width: "100%" }}>
                                        <pre className={styles.resolutionText}>
                                            {ticket.resolutionNote ?? "A resolução não possui mensagem..."}
                                        </pre>
                                    </div>

                                </section>
                            )}

                            {!isResolved && (
                                <section className={`${styles.section} ${styles.resolveSection}`}>

                                    <h3 className={styles.sectionTitle}>
                                        Resolver Ticket
                                    </h3>

                                    <div className={`${styles.infoCard} ${styles.resolveCard}`} style={{ width: "100%" }}>
                                        <textarea
                                            className={styles.resolutionInput}
                                            placeholder="Observação de resolução (opcional)..."
                                            value={resolutionNote}
                                            onChange={(e) => setResolutionNote(e.target.value)}
                                            rows={4}
                                            maxLength={1000}
                                        />
                                        <div className={styles.charCount}>
                                            {resolutionNote.length}/1000
                                        </div>
                                    </div>

                                    <button
                                        className={styles.resolveButton}
                                        onClick={handleResolve}
                                        disabled={resolving}
                                    >
                                        {resolving ? "Resolvendo..." : "Marcar como Resolvido"}
                                    </button>

                                </section>
                            )}
                        </div>
                    </div>
                </div>

                <footer className={styles.footer}>

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