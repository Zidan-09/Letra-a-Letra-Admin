import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../hooks/notification/useNotification";
import { type CosmeticTypes } from "../../../utils/cosmeticTypes";
import { CosmeticRequests } from "../../../lib/Cosmetic";
import styles from "./EditCosmetic.module.css";

interface CosmeticData {
  id: string;
  name: string;
  type: CosmeticTypes;
  assetPath: string;
}

interface EditCosmeticPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cosmetic: CosmeticData | null;
  onSuccess?: () => void;
}

export function EditCosmeticPopup({ isOpen, onClose, cosmetic, onSuccess }: EditCosmeticPopupProps) {
  const [name, setName] = useState<string>(cosmetic?.name || "");
  const [type, setType] = useState<CosmeticTypes>(cosmetic?.type || "AVATAR");
  const [asset, setAsset] = useState<File | null>(null);

  const assetsUrl = "https://pub-d49bc6f700bc45ba92fed050669b2690.r2.dev";

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (!asset) return `${assetsUrl}/${cosmetic?.assetPath}`;
    return URL.createObjectURL(asset);
  }, [asset]);

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

      formData.append("name", name);
      formData.append("type", type);
      
      if (asset) {
        formData.append("asset", asset);
      }

      formData.append("isNewImage", `${asset !== null}`);

      await CosmeticRequests.editCosmetic(formData, cosmetic.id);

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
          <span className={styles.label}>
            Arquivo (Asset)
          </span>
          <label htmlFor="cosmetic-asset" className={styles.fileUploadLabel}>
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
            id="cosmetic-asset"
            className={styles.fileInput}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            required
          />
        </div>

        <button type="submit" className={styles.submit}>Salvar Alterações</button>
      </form>
    </div>
  );
}