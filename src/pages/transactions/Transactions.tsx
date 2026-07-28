import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { Table, type Column } from "../../components/Table/Table";
import { type Transaction, TransactionRequests } from "../../lib/Transaction";
import { TransactionDetailsModal } from "./components/TransactionInfo/TransactionDetailsModal";
import { SearchBar } from "../../components/Search/SearchBar";
import { RotateCcw } from "lucide-react";
import styles from "./Transactions.module.css";

export function TransactionsPage() {
    const { notify } = useNotification();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [search, setSearch] = useState("");

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [rotating, setRotating] = useState(false);

    const fetchTransactions = async () => {
        if (rotating) return;

        setRotating(true);

        try {
            const data = await TransactionRequests.getTransactions(page, 8);
    
            setTransactions(data.content);
            setTotalPages(data.totalPages);

        } catch (e) {
            console.error(e);
            notify.error("Erro ao carregar a lista de transações.");
        } finally {
            setTimeout(() => setRotating(false), 500);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const columns: Column<Transaction>[] = [
        {
            header: "ID / ID Usuário",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.userId}>{item.userId || "Id de Usuário Inválido"}</strong>
                    <span className={styles.transactionId}>{item.transactionId}</span>
                </div>
            ),
        },
        {
            header: "Tipo de Moeda",
            render: (item) => (
                <div className={styles.coinType}>
                    <span className={styles.coinTypeValue}>
                        {item.coinType}
                    </span>
                </div>
            ),
        },
        {
            header: "Valor",
            render: (item) => (
                <div className={styles.valueWrapper}>
                    <span className={styles.value}>
                        {item.amount}
                    </span>
                </div>
            ),
        },
        {
            header: "Valor",
            render: (item) => (
                <div className={styles.operationWrapper}>
                    <span className={styles.operation}>
                        {item.operation}
                    </span>
                </div>
            ),
        },
    ];

    const handleInspectTransaction = (item: Transaction) => {
        setSelectedTransaction(item);
    }

    const handleSearchUserTransaction = async () => {
        try {
            const data = await TransactionRequests.findTransactionsByNickname(search, page, 8);

            notify.success(`Transações de ${search} encontradas com sucesso!`);

            console.log(data);

            setTransactions(data.content);
            setTotalPages(data.totalPages);

        } catch {
            notify.error(`Erro ao buscar as Transações de ${search}`);
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Transações</h1>
                    <p>Acompanhe e monitore as transações registradas no jogo.</p>
                </div>

                <div className={styles.headerButtons}>
                    <button
                        className={styles.refresh}
                        onClick={fetchTransactions}
                    >
                        <RotateCcw className={rotating ? styles.rotating : ""} />
                    </button>

                    <SearchBar
                        value={search}
                        placeholder="Pesquisar por jogador..."
                        onChange={setSearch}
                        search={handleSearchUserTransaction}
                    />
                </div>
            </header>

            <main className={styles.content}>
                <Table<Transaction>
                    data={transactions}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button className={styles.actionButton} onClick={() => handleInspectTransaction(item)}>
                                Detalhes
                            </button>
                        </>
                    )}
                    page={page}
                    totalPages={totalPages}
                    nextPage={() => setPage((prev) => prev + 1)}
                    prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
                />   
            </main>

            <TransactionDetailsModal
                isOpen={!!selectedTransaction}
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />
        </div>
    );
}