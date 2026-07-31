import { useState, useEffect } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { AdminRequests } from "../../lib/Admins";
import styles from "./RegisterAdminPopup.module.css";   

interface RegisterAdminPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterAdminPopup({ isOpen, onClose }: RegisterAdminPopupProps) {
    const { notify } = useNotification();

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        setName("");
        setEmail("");
    }, [isOpen]);

    if (!isOpen) return;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await AdminRequests.registerAdmin({
                name,
                email
            });

            notify.success("Administrador cadastrado com sucesso!");

            setName("");
            setEmail("");

            onClose();
        } catch (err) {
            notify.error("Erro ao cadastrar Administrador");
        }
    };
    
    return (
        <div className={styles.overlay} onClick={onClose}>
            <form 
                className={styles.card} 
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <h1>Cadastrar Administrador</h1>

                <div className={styles.inputgroup}>
                    <label htmlFor="username" className={styles.label}>Nome</label>
                    <input
                        id="username"
                        className={styles.input}
                        type="text"
                        placeholder="Insira o nome do administrador"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputgroup}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input
                        id="email"
                        className={styles.input}
                        type="text"
                        placeholder="Insira o email do administrador"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={styles.submit}>Cadastrar Administrador</button>
            </form>
        </div>
    );
}