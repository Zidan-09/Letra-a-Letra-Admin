import { useEffect } from "react";
import type { Transaction } from "../../lib/Transaction";
import styles from "./TransactionDetailsModal.module.css";
import { normalizeCoinType } from "../../../../utils/normalizeCoinType";

interface TransactionDetailsModalProps {
    isOpen: boolean;
    transaction: Transaction | null;
    onClose: () => void;
}

export function TransactionDetailsModal({
    isOpen,
    transaction,
    onClose
}: TransactionDetailsModalProps) {

    useEffect(() => {
        if (!transaction) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [transaction, onClose]);

    if (!isOpen || !transaction) return null;

    const transactionDate = new Date(transaction.transactionDate);

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
                            TRANSAÇÃO
                        </span>

                        <h2 className={styles.title}>
                            {transaction.reason.replaceAll("_", " ")}
                        </h2>

                        <span className={styles.transactionId}>
                            ID: {transaction.transactionId}
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
                                            Operação
                                        </span>

                                        <strong>
                                            {transaction.operation}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Moeda
                                        </span>

                                        <strong>
                                            {normalizeCoinType(transaction.coinType)}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Quantidade
                                        </span>

                                        <strong>
                                            {transaction.amount}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Motivo
                                        </span>

                                        <strong>
                                            {transaction.reason.replaceAll("_", " ")}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Data
                                        </span>

                                        <strong>
                                            {transactionDate.toLocaleDateString("pt-BR") + " - " + transactionDate.toLocaleTimeString("pt-BR")}
                                        </strong>
                                    </div>

                                </div>

                            </section>

                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Saldos
                                </h3>

                                <div className={styles.balanceGrid}>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Saldo Anterior
                                        </span>

                                        <strong>
                                            {transaction.balanceBefore}
                                        </strong>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>
                                            Saldo Atual
                                        </span>

                                        <strong>
                                            {transaction.balanceAfter}
                                        </strong>
                                    </div>

                                </div>

                            </section>
                        </div>

                        <div className={styles.rightColumn}>
                            <section className={styles.section}>

                                <h3 className={styles.sectionTitle}>
                                    Referências
                                </h3>

                                <div className={styles.referenceGrid}>

                                    <div className={styles.infoCard}>

                                        <span className={styles.infoLabel}>
                                            Usuário
                                        </span>

                                        <div className={styles.referenceItem}>
                                            <span className={styles.referenceLabel}>
                                                Nome
                                            </span>

                                            <strong>
                                                {transaction.username}
                                            </strong>
                                        </div>

                                        <div className={styles.referenceItem}>
                                            <span className={styles.referenceLabel}>
                                                ID
                                            </span>

                                            <code>
                                                {transaction.userId}
                                            </code>
                                        </div>

                                    </div>

                                    <div className={styles.infoCard}>

                                        <span className={styles.infoLabel}>
                                            Referência
                                        </span>

                                        <div className={styles.referenceItem}>
                                            <span className={styles.referenceLabel}>
                                                Nome
                                            </span>

                                            <strong>
                                                {transaction.referenceName ?? "-"}
                                            </strong>
                                        </div>

                                        <div className={styles.referenceItem}>
                                            <span className={styles.referenceLabel}>
                                                Tipo
                                            </span>

                                            <span className={styles.referenceBadge}>
                                                {transaction.referenceType ?? "-"}
                                            </span>
                                        </div>

                                        <div className={styles.referenceItem}>
                                            <span className={styles.referenceLabel}>
                                                ID
                                            </span>

                                            <code>
                                                {transaction.referenceId ?? "-"}
                                            </code>
                                        </div>

                                    </div>

                                </div>

                            </section>
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