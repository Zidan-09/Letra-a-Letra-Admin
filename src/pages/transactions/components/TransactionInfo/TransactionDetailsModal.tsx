import type { Transaction } from "../../../../lib/Transaction";
import styles from "./TransactionDetailsModal.module.css";

interface TransactionDetailsModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {

    if (!transaction) return;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            </div>
        </div>
    )
}