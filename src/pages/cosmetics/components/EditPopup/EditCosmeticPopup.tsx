import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { CosmeticRequests, type UserItem } from "../../lib/Cosmetic";
import styles from "./EditCosmetic.module.css";

interface EditCosmeticPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cosmetic: UserItem | null;
  onSuccess?: () => void;
}

export function EditCosmeticPopup({ isOpen, onClose, cosmetic, onSuccess }: EditCosmeticPopupProps) {
  const [name, setName] = useState<string>(cosmetic?.name || "");
  const [assetPath, setAssetPath] = useState<string>(cosmetic?.assetPath || "");
  const [available, setAvailable] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  useEffect(() => {
    if (cosmetic) {
      setName(cosmetic.name);
      setAssetPath(cosmetic.assetPath);
    }
  }, [cosmetic, isOpen]);

  if (!isOpen || !cosmetic) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      await CosmeticRequests.updateItem(cosmetic.itemId, {
        name: name.trim(),
        assetPath: assetPath.trim(),
        available
      });

      notify.success("Cosmético atualizado com sucesso!");

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao atualizar cosmético.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${loading ? styles.loading : ""}`} onClick={onClose}>
      <form
        className={styles.card}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <h1>Editar Cosmético</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="edit-cosmetic-name" className={styles.label}>Nome</label>
          <input
            id="edit-cosmetic-name"
            className={styles.input}
            type="text"
            placeholder="Digite o novo nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="edit-cosmetic-asset" className={styles.label}>Asset (URL/caminho)</label>
          <input
            id="edit-cosmetic-asset"
            className={styles.input}
            type="text"
            placeholder="https://..."
            value={assetPath}
            onChange={(e) => setAssetPath(e.target.value)}
          />
        </div>

        <div className={styles.inputgroup}>
          <label>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Disponível
          </label>
        </div>

        <button type="submit" disabled={loading} className={`${styles.submit} ${loading ? styles.disabled : ""}`}>Salvar Alterações</button>
      </form>
    </div>
  );
}
