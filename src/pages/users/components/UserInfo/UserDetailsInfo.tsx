import { useState, useEffect } from "react";
import { UserRequests, type User, type BanType } from "../../lib/Users";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { Shield, ShieldAlert, Gift, User as UserIcon, AlertTriangle } from "lucide-react";
import styles from "./UserDetailsInfo.module.css";

interface UserDetailsInfoProps {
    user: User | null;
    onClose: () => void;
    onUserUpdated?: () => void;
}

type TabType = "info" | "moderation" | "grant";

export function UserDetailsInfo({ user, onClose, onUserUpdated }: UserDetailsInfoProps) {
    const { notify } = useNotification();
    const [activeTab, setActiveTab] = useState<TabType>("info");
    
    const [banType, setBanType] = useState<BanType>("TEMPORARY");
    const [expiresIn, setExpiresIn] = useState<number>(20);
    const [banReason, setBanReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <div>
                        <div className={styles.badgeGroup}>
                            <span className={styles.typeBadge}>USER</span>
                            {isBanned && (
                                <span className={styles.bannedBadge}>
                                    BANIDO ({user.banInfo.type})
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

                {/* Navegação por Abas */}
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
                                            <p>Tipo: <strong>{user.banInfo.type}</strong></p>
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
                                <form onSubmit={handleBan} className={styles.formContainer}>
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

                    {/* ABA 3: CONCEDER RECURSOS (FUTURO) */}
                    {activeTab === "grant" && (
                        <div className={styles.tabContent}>
                            <div className={styles.placeholderBox}>
                                <Gift size={32} />
                                <h3>Conceder Itens & Recursos</h3>
                                <p>Esta funcionalidade está sendo preparada para permitir a injeção manual de Moedas, Gemas ou Cosméticos em casos de suporte ao jogador.</p>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className={styles.formContainer} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Recurso</label>
                                    <select className={styles.input} disabled>
                                        <option>Selecione um tipo...</option>
                                        <option>Moedas / Gemas</option>
                                        <option>Cosmético / Item</option>
                                    </select>
                                </div>
                                <button className={styles.confirmButton} disabled>Em breve</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}