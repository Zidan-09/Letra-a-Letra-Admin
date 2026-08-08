import { useState } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { LoginRequests } from "../../lib/Login";
import styles from "./ForgotPasswordPopup.module.css";

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordPopup({
  isOpen,
  onClose,
}: ForgotPasswordPopupProps) {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!email.trim()) return;

    if (loading) return;
    setLoading(true);

    try {
        await LoginRequests.forgotPassword(email);

        notify.success("Email enviado com sucesso!");

        onClose();

    } catch {
        notify.error("Erro ao solicitar redefinição de senha")
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className={`${styles.overlay} ${loading ? styles.loading : ""}`} onClick={onClose}>
      <div className={styles.card} onClick={(event) => event.stopPropagation()}>
        <h1>Redefinir Senha</h1>

        <p className={styles.description}>
          Informe o e-mail da sua conta de administrador. Caso ele exista, um
          código de redefinição será enviado.
        </p>

        <div className={styles.inputgroup}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>

          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="Digite seu e-mail..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancelar
          </button>

          <button
            type="button"
            className={`${styles.submit} ${loading ? styles.disabled : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            Enviar Link
          </button>
        </div>
      </div>
    </div>
  );
}
