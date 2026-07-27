import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { OfferRequests, type Offer } from "../../lib/Offers";
import { Table, type Column } from "../../components/Table/Table";
import { CreateOfferPopup } from "./components/CreatePopup/CreateOfferPopup";
import { OfferDetailsModal } from "./components/OfferInfo/OfferDetailsModal";
import { getRemainingTime } from "../../utils/getRemainingTime";
import { Trash2 } from "lucide-react";
import styles from "./Offers.module.css";

export function OffersPage() {
    const { notify } = useNotification();

    const [offers, setOffers] = useState<Offer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(v => v + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchOffers = async () => {    
        try {
          const data = await OfferRequests.getOffers(page, 5);
    
          setOffers(data.content);
          setTotalPages(data.totalPages);

        } catch (e) {
          console.error(e);
          notify.error("Erro ao carregar a lista de níveis.");
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [page]);

    const columns: Column<Offer>[] = [
        {
            header: "ID / Título",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.offerTitle}>{item.title || "Título da Oferta Inválido"}</strong>
                    <span className={styles.offerId}>{item.offerId}</span>
                </div>
            ),
        },
        {
            header: "Tipo de Moeda",
            render: (item) => (
                <div className={styles.columnContainer}>
                    <span className={styles.value}>
                        {item.coinType}
                    </span>
                </div>
            ),
        },
        {
            header: "Valor",
            render: (item) => (
                <div className={styles.columnContainer}>
                    <span className={styles.value}>
                        {item.coinType === "REAL" ? `R$ ${item.price}` : item.price}
                    </span>
                </div>
            ),
        },
        {
            header: "Ativo",
            render: (item) => (
                <span className={item.active ? styles.statusActive : styles.statusDisabled}>
                ● {item.active ? "Ativo" : "Desativado"}
                </span>
            ),
        },
        {
            header: "Tempo de Expiração",
            render: (item) => (
                <div className={styles.columnContainer}>
                    <span className={styles.value}>
                        {item.hasExpiration ? getRemainingTime(item.expiresAt) : "Sem Expiração"}
                    </span>
                </div>
            ),
        },
    ];

    const handleInspectLevel = (item: Offer) => {
        setIsModalOpen(true);
        setSelectedOffer(item);
    }

    const handleToggleStatus = async (item: Offer) => {
        try {
            item.active ?
            await OfferRequests.disableOffer(item.offerId) : 
            await OfferRequests.enableOffer(item.offerId);

            const newStatus = !item.active;
            
            await fetchOffers();

            notify.success(`Oferta ${newStatus ? "ativada" : "desativada"} com sucesso!`);
        } catch {
            notify.error("Não foi possível alterar o status da Oferta.");
        }
    };

    const handleDeleteOffer = async (item: Offer) => {
        try {
            await OfferRequests.deleteOffer(item.offerId);
            
            await fetchOffers();

            notify.success(`Oferta deletada com sucesso!`);
        } catch {
            notify.error("Não foi possível alterar o status da Oferta.");
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Ofertas</h1>
                    <p>Gerencie, visualize e edite as Ofertas e suas recompensas ativas no sistema.</p>
                </div>

                <button className={styles.addButton} onClick={() => setIsCreateOpen(true)}>
                    Nova Oferta
                </button>
            </header>

            <main className={styles.content}>
                <Table<Offer>
                    data={offers}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button className={styles.actionButton} onClick={() => handleInspectLevel(item)}>
                                Detalhes
                            </button>
                            
                            <button
                                className={`${styles.actionButton} ${item.active ? styles.btnDanger : styles.btnSuccess}`}
                                onClick={() => handleToggleStatus(item)}
                            >
                                {item.active ? "Desabilitar" : "Ativar"}
                            </button>

                            <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteOffer(item)}>
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

            <CreateOfferPopup
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchOffers();
                }}
            />

            <OfferDetailsModal
                isOpen={isModalOpen}
                offer={selectedOffer}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}