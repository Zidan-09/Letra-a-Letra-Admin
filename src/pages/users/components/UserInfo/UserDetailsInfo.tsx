import { useState, useEffect } from "react";
import { UserRequests, type User, type BanType, type ItemInventory, type RevokeWallet } from "../../lib/Users";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { Shield, ShieldAlert, Gift, User as UserIcon, AlertTriangle, Shirt, Trash2, Wallet } from "lucide-react";
import type { CreateReward } from "../../../../lib/Rewards";
import { RewardInput } from "../../../../components/RewardEditor/RewardInput";
import { Table, type Column } from "../../../../components/Table/Table";
import styles from "./UserDetailsInfo.module.css";
import { useProfile } from "../../../../hooks/profile/useProfile";
import type { CoinType } from "../../../offers/lib/Offers";

interface UserDetailsInfoProps {
    user: User | null;
    onClose: () => void;
    onUserUpdated?: () => void;
}

type TabType = "info" | "moderation" | "grant" | "inventory" | "wallet";

export function UserDetailsInfo({ user, onClose, onUserUpdated }: UserDetailsInfoProps) {
    const { notify } = useNotification();
    const { permissions } = useProfile();
    
    const [activeTab, setActiveTab] = useState<TabType>("info");
    
    const [banType, setBanType] = useState<BanType>("TEMPORARY");
    const [expiresIn, setExpiresIn] = useState<number>(20);
    const [banReason, setBanReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [reward, setReward] = useState<CreateReward>({
        rewardType: "COIN",
        quantity: 1,
        rewardReference: ""
    });

    const [inventory, setInventory] = useState<ItemInventory[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [canDelete, setCanDelete] = useState(false);

    const [wallet, setWallet] = useState<RevokeWallet>({
        type: "SOFT",
        amount: 1
    });

    useEffect(() => {
        const permission = permissions.find(p => p.key === "ADMIN");

        setCanDelete(permission?.actions.includes("DELETE") ?? false);
      
    }, [permissions]);

    const fetchInventory = async () => {
        if (!user) return;

        const data = await UserRequests.getUserInventory(user.userId, page, 5);
        
        setInventory(data.content);
        setTotalPages(data.totalPages);
    }

    useEffect(() => {
        if (activeTab !== "inventory" || !user) return;

        fetchInventory();

    }, [activeTab]);

    useEffect(() => {
        if (!user) return;
        setActiveTab("info");
        setBanReason("");

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [user, onClose]);

    if (!user) return null;

    function formatBanType(banType: BanType | null) {
        if (!banType) return "";

        switch (banType) {
            case "PERMANENT":
                return "PERMANENTE"
            case "TEMPORARY":
                return "TEMPORÁRIO"
        }
    }

    const isBanned = Boolean(user.banInfo && user.banInfo.type);

    const handleBan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!banReason.trim()) {
            notify.error("Informe um motivo para o banimento.");
            return;
        }

        try {
            setIsSubmitting(true);
            await UserRequests.banUser(user.userId, {
                type: banType,
                expiresIn: banType === "TEMPORARY" ? Number(expiresIn) : undefined,
                reason: banReason
            });

            notify.success(`Usuário ${user.nickname} foi banido com sucesso!`);
            onUserUpdated?.();
            onClose();
        } catch {
            notify.error("Erro ao aplicar banimento no usuário.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnban = async () => {
        try {
            setIsSubmitting(true);
            await UserRequests.unbanUser(user.userId);
            notify.success(`Banimento de ${user.nickname} foi removido!`);
            onUserUpdated?.();
            onClose();
        } catch {
            notify.error("Erro ao remover banimento.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGrant = async () => {
        try {
            await UserRequests.grantReward(user.userId, reward);

            notify.success(`${reward.rewardType.toLowerCase()} concedidas ao usuário com sucesso`);

            onUserUpdated?.();
            onClose();
        } catch {
            notify.error(`Erro ao conceder ${reward.rewardType.toLowerCase()} ao usuário`)
        }
    }

    const handleDelete = async (item: ItemInventory) => {
        try {
            await UserRequests.revokeUserCosmetic(user.userId, item.cosmeticId);

            notify.success(`O cosmético ${item.name} foi removido do inventário do usuário`);

            fetchInventory();

        } catch (e) {
            notify.error(`Erro ao remover o cosmético ${item.name} do usuário`)
        }
    }

    const handleRevokeWallet = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await UserRequests.revokeUserWallet(user.userId, wallet);

            notify.success("Saldo removido com sucesso.");

            onUserUpdated?.();
            onClose();
        } catch {
            notify.error("Erro ao remover saldo do usuário.");
        }
    };

    const columns: Column<ItemInventory>[] = [
        {
            header: "Nome do Cosmético",
            render: (item) => (
                <div className={styles.info}>
                    <strong className={styles.cosmeticName}>{item.name || "Nome inválido"}</strong>
                    <span className={styles.cosmeticId}>{item.cosmeticId}</span>
                </div>
            )
        },
        {
            header: "Tipo",
            render: (item) => (
                <span className={`${styles.badge} ${styles[item.type.toLowerCase()] || styles.defaultBadge}`}>
                {item.type}
                </span>
            ),
        },
        {
            header: "Ativo",
            render: (item) => (
                <span className={item.equipped ? styles.statusActive : styles.statusDisabled}>
                    ● {item.equipped ? "Equipado" : "Desequipado"}
                </span>
            ),
        },
    ]

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <div>
                        <div className={styles.badgeGroup}>
                            <span className={styles.typeBadge}>USER</span>
                            {isBanned && (
                                <span className={styles.bannedBadge}>
                                    BANIDO ({formatBanType(user.banInfo.type)})
                                </span>
                            )}
                        </div>

                        <h2 className={styles.title}>{user.nickname}</h2>
                        <span className={styles.levelId}>ID: {user.userId}</span>
                    </div>

                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </header>

                <nav className={styles.tabsNav}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === "info" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("info")}
                    >
                        <UserIcon size={16} />
                        Informações
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === "moderation" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("moderation")}
                    >
                        <ShieldAlert size={16} />
                        Moderação
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === "grant" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("grant")}
                    >
                        <Gift size={16} />
                        Conceder Recurso
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === "inventory" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("inventory")}
                    >
                        <Shirt size={16} />
                        Inventário
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === "wallet" ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab("wallet")}
                    >
                        <Wallet size={16} />
                        Carteira
                    </button>
                </nav>

                <div className={styles.body}>
                    {activeTab === "info" && (
                        <>
                            {isBanned && (
                                <div className={styles.banCardNotice}>
                                    <AlertTriangle size={20} className={styles.warningIcon} />
                                    <div>
                                        <strong>UsuárioAtualmente Banido</strong>
                                        <p>Motivo: {user.banInfo.reason || "Não especificado"}</p>
                                        {user.banInfo.expiresAt && (
                                            <small>Expira em: {new Date(user.banInfo.expiresAt).toLocaleString()}</small>
                                        )}
                                    </div>
                                </div>
                            )}

                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Estatísticas</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Nível</span>
                                        <strong>{user.stats.level}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Experiência</span>
                                        <strong>{user.stats.experience} XP</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Pontos</span>
                                        <strong>{user.stats.points}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Partidas</span>
                                        <strong>{user.stats.totalMatches}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Vitórias</span>
                                        <strong>{user.stats.totalWins}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Sequência</span>
                                        <strong>{user.stats.winStreak}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Taxa de Vitória</span>
                                        <strong>
                                            {user.stats.totalMatches === 0
                                                ? "0%"
                                                : `${((user.stats.totalWins / user.stats.totalMatches) * 100).toFixed(1)}%`}
                                        </strong>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Carteira</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Moedas</span>
                                        <strong>{user.wallet.coins}</strong>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Gemas</span>
                                        <strong>{user.wallet.gems}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Cosméticos Equipados</h3>
                                {user.equipped.length === 0 ? (
                                    <p className={styles.empty}>Nenhum cosmético equipado.</p>
                                ) : (
                                    <div className={styles.infoGrid}>
                                        {user.equipped.map((item) => (
                                            <div key={item.cosmeticId} className={styles.infoCard}>
                                                <span className={styles.infoLabel}>{item.type}</span>
                                                <strong>{item.name}</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {activeTab === "moderation" && (
                        <div className={styles.tabContent}>
                            {isBanned ? (
                                <div className={styles.unbanContainer}>
                                    <div className={styles.banCardNotice}>
                                        <Shield size={24} />
                                        <div>
                                            <h4>Banimento Ativo</h4>
                                            <p>Tipo: <strong>{formatBanType(user.banInfo.type)}</strong></p>
                                            <p>Motivo: {user.banInfo.reason || "Nenhum"}</p>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.unbanButton} 
                                        onClick={handleUnban}
                                        disabled={isSubmitting}
                                    >
                                        Remover Banimento do Jogador
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBan} className={styles.formContainer} id="moderation">
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Banimento</label>
                                        <select 
                                            value={banType} 
                                            onChange={(e) => setBanType(e.target.value as BanType)}
                                            className={styles.input}
                                        >
                                            <option value="TEMPORARY">Temporário</option>
                                            <option value="PERMANENT">Permanente</option>
                                        </select>
                                    </div>

                                    {banType === "TEMPORARY" && (
                                        <div className={styles.formGroup}>
                                            <label>Duração (Minutos)</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={expiresIn} 
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    if (value === "" || Number(value) >= 0) {

                                                        value.startsWith("0") ? setExpiresIn(Number(value.replace(/^0+(?!$)/, ""))) : setExpiresIn(Number(value));

                                                    }
                                                }}
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className={styles.formGroup}>
                                        <label>Motivo da Punição</label>
                                        <textarea 
                                            rows={3}
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            placeholder="Descreva o motivo da aplicação da sanção..."
                                            className={styles.input}
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className={styles.dangerButton}
                                        disabled={isSubmitting}
                                    >
                                        Aplicar Banimento
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === "grant" && (
                        <div className={styles.tabContent}>
                            <form onSubmit={handleGrant} className={`${styles.formContainer} ${styles.rewardContainer}`} id="grant">
                                <div className={styles.formGroup}>                                    
                                    <RewardInput
                                        value={reward}
                                        onChange={setReward}
                                    />
                                </div>
                                <button
                                    className={styles.confirmButton} 
                                    disabled={!reward}
                                    onClick={handleGrant}
                                >
                                    Conceder
                                </button>

                            </form>
                        </div>
                    )}

                    {activeTab === "inventory" && (
                        <div className={styles.tabContent}>
                            <Table
                                data={inventory}
                                columns={columns}
                                renderActions={(item) => (
                                    <>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton} ${canDelete ? "" : styles.disabled}`} 
                                            onClick={() => handleDelete(item)}
                                            disabled={!canDelete}
                                        >
                                            <Trash2 />
                                        </button>
                                    </>
                                )}
                                page={page}
                                totalPages={totalPages}
                                nextPage={() => setPage(prev => prev + 1)}
                                prevPage={() => setPage(prev => Math.max(0, prev - 1))}
                            />
                        </div>
                    )}

                    {activeTab === "wallet" && (
                        <div className={styles.tabContent}>
                            <form
                                onSubmit={handleRevokeWallet}
                                className={styles.formContainer}
                            >
                                <div className={styles.formGroup}>
                                    <label>Tipo</label>
                                    <select
                                        className={styles.input}
                                        value={wallet.type}
                                        onChange={(e) =>
                                            setWallet({
                                                ...wallet,
                                                type: e.target.value as CoinType
                                            })
                                        }
                                    >
                                        <option value="COIN">Moedas</option>
                                        <option value="GEM">Gemas</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Quantidade</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className={styles.input}
                                        value={wallet.amount}
                                        onChange={(e) =>
                                            setWallet({
                                                ...wallet,
                                                amount: Number(e.target.value)
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.dangerButton}
                                    disabled={wallet.amount <= 0}
                                >
                                    Remover Saldo
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}