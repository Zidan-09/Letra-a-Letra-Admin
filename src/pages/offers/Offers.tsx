import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { OfferRequests, type Offer } from "./lib/Offers";
import { Table, type Column } from "../../components/Table/Table";
import { CreateOfferPopup } from "./components/CreatePopup/CreateOfferPopup";
import { OfferDetailsModal } from "./components/OfferInfo/OfferDetailsModal";
import { getRemainingTime } from "../../utils/getRemainingTime";
import { Trash2 } from "lucide-react";
import { normalizeCoinType } from "../../utils/normalizeCoinType";
import styles from "./Offers.module.css";
import { useProfile } from "../../hooks/profile/useProfile";

export function OffersPage() {
    const { notify } = useNotification();
    const { permissions } = useProfile();

    const [offers, setOffers] = useState<Offer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [canRegister, setCanRegister] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        const permission = permissions.find(p => p.key === "OFFERS");

        setCanRegister(permission?.actions.includes("CREATE") ?? false);
        setCanToggle(permission?.actions.includes("TOGGLE") ?? false);
        setCanDelete(permission?.actions.includes("DELETE") ?? false);
      
  }, [permissions]);

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
                        {normalizeCoinType(item.coinType)}
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

                <button 
                    className={`${styles.addButton} ${canRegister ? "" : styles.disabled}`} 
                    onClick={() => setIsCreateOpen(true)}
                    disabled={!canRegister}
                >
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
                                className={`${styles.actionButton} ${item.active ? styles.btnDanger : styles.btnSuccess} ${canToggle ? "" : styles.disabled}`}
                                onClick={() => handleToggleStatus(item)}
                                disabled={!canToggle}
                            >
                                {item.active ? "Desabilitar" : "Ativar"}
                            </button>

                            <button 
                                className={`${styles.actionButton} ${styles.deleteButton} ${canDelete ? "" : styles.disabled}`} 
                                onClick={() => handleDeleteOffer(item)}
                                disabled={!canDelete}
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