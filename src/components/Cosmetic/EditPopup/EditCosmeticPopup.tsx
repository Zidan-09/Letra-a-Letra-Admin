import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../hooks/useNotification";
import { type CosmeticTypes } from "../../../utils/cosmeticTypes";
import { CosmeticRequests } from "../../../lib/Cosmetic";
import styles from "./EditCosmetic.module.css";

interface CosmeticData {
  id: string;
  name: string;
  type: CosmeticTypes;
}

interface EditCosmeticPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cosmetic: CosmeticData | null;
  onSuccess?: () => void;
}

export function EditCosmeticPopup({ isOpen, onClose, cosmetic, onSuccess }: EditCosmeticPopupProps) {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<CosmeticTypes>("AVATAR");
  const [asset, setAsset] = useState<File | null>(null);

  const { notify } = useNotification();

  useEffect(() => {
    if (cosmetic) {
      setName(cosmetic.name);
      setType(cosmetic.type);
      setAsset(null);
    }
  }, [cosmetic, isOpen]);

  if (!isOpen || !cosmetic) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("id", cosmetic.id);
      formData.append("name", name);
      formData.append("type", type);
      
      if (asset) {
        formData.append("asset", asset);
      }

      await CosmeticRequests.editCosmetic(formData);

      notify.success("Cosmético atualizado com sucesso!");
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      notify.error("Erro ao atualizar cosmético.");
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

        <h1>Editar Cosmético</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="edit-cosmetic-id" className={styles.label}>ID (Não editável)</label>
          <input
            id="edit-cosmetic-id"
            className={`${styles.input} styles.disabled`}
            type="text"
            value={cosmetic.id}
            disabled
          />
        </div>

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
          <label htmlFor="edit-cosmetic-type" className={styles.label}>Tipo</label>
          <select
            id="edit-cosmetic-type"
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as CosmeticTypes)}
            required
          >
            <option value="AVATAR">Avatar</option>
            <option value="BACKGROUND">Background</option>
            <option value="BORDER">Borda</option>
          </select>
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="edit-cosmetic-asset" className={styles.label}>Novo Arquivo (Opcional)</label>
          <label htmlFor="edit-cosmetic-asset" className={styles.fileUploadLabel}>
            {asset ? asset.name : "Substituir arquivo existente..."}
          </label>
          <input
            id="edit-cosmetic-asset"
            className={styles.fileInput}
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </div>

        <button type="submit" className={styles.submit}>Salvar Alterações</button>
      </form>
    </div>
  );
}