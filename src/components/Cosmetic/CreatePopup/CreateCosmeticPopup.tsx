import { useState, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../hooks/notification/useNotification";
import { type CosmeticTypes } from "../../../utils/cosmeticTypes";
import { CosmeticRequests } from "../../../lib/Cosmetic";
import styles from "./CreateCosmetic.module.css";

interface CreateCosmeticPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCosmeticPopup({ isOpen, onClose }: CreateCosmeticPopupProps) {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<CosmeticTypes>("AVATAR");
  const [asset, setAsset] = useState<File | null>(null);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (!asset) return null;
    return URL.createObjectURL(asset);
  }, [asset]);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!asset) {
      return notify.error("Por favor, selecione um arquivo de asset.");
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("cosmeticType", type);
      formData.append("asset", asset);

      await CosmeticRequests.createCosmetic(formData);

      notify.success("Cosmético cadastrado com sucesso!");
      
      onClose();
      
      setName("");
      setType("AVATAR");
      setAsset(null);
    } catch (error) {
      notify.error("Erro ao cadastrar cosmético.");
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

        <h1>Criar Cosmético</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="cosmetic-name" className={styles.label}>Nome</label>
          <input
            id="cosmetic-name"
            className={styles.input}
            type="text"
            placeholder="Digite o nome do cosmético..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="cosmetic-type" className={styles.label}>Tipo</label>
          <select
            id="cosmetic-type"
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as CosmeticTypes)}
            required
          >
            <option value="AVATAR">Avatar</option>
            <option value="BANNER">Banner</option>
            <option value="FRAME">Moldura</option>
            <option value="EMOTE">Emote</option>
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

        <button type="submit" className={styles.submit}>Cadastrar Cosmético</button>
      </form>
    </div>
  );
}