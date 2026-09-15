import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { ItemRequests, type ItemDefinition } from "../../lib/Item";
import styles from "./EditItem.module.css";

interface EditItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDefinition | null;
  onSuccess?: () => void;
}

export function EditItemPopup({ isOpen, onClose, item, onSuccess }: EditItemPopupProps) {
  const [name, setName] = useState<string>(item?.name || "");
  const [available, setAvailable] = useState<boolean>(true);
  const [asset, setAsset] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (asset) return URL.createObjectURL(asset);
    return item?.assetPath || null;
  }, [asset, item]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setAvailable(item.available);
      setAsset(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      await ItemRequests.updateItem(item.itemId, {
        name: name.trim(),
        available,
        isNewAsset: asset !== null
      }, asset);

      notify.success("Item atualizado com sucesso!");

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao atualizar item.");
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

        <h1>Editar Item</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="edit-item-name" className={styles.label}>Nome</label>
          <input
            id="edit-item-name"
            className={styles.input}
            type="text"
            placeholder="Digite o novo nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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

        <div className={styles.inputgroup}>
          <span className={styles.label}>
            Arquivo (Asset)
          </span>
          <label htmlFor="item-asset" className={styles.fileUploadLabel}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className={styles.previewImage}
              />
            ) : (
              <span>Selecionar imagem</span>
            )}
          </label>
          <input
            id="item-asset"
            className={styles.fileInput}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <button type="submit" disabled={loading} className={`${styles.submit} ${loading ? styles.disabled : ""}`}>Salvar Alterações</button>
      </form>
    </div>
  );
}
