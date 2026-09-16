import { useState, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import {
  ItemRequests,
  CATEGORY_EFFECT_TYPE,
  CONSUMABLE_CATEGORIES,
  COSMETIC_CATEGORIES,
  type ItemCategory,
  type ItemContext,
  type ItemEffect,
  type ItemKind,
} from "../../lib/Item";
import styles from "./CreateItem.module.css";

interface CreateItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const KINDS: ItemKind[] = ["COSMETIC", "CONSUMABLE"];
const CONTEXTS: ItemContext[] = ["PROFILE", "MATCH"];

export function CreateItemPopup({ isOpen, onClose }: CreateItemPopupProps) {
  const [name, setName] = useState<string>("");
  const [kind, setKind] = useState<ItemKind>("COSMETIC");
  const [category, setCategory] = useState<ItemCategory>("AVATAR");
  const [context, setContext] = useState<ItemContext>("PROFILE");
  const [asset, setAsset] = useState<File | null>(null);

  const [magnitude, setMagnitude] = useState("50");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (!asset) return null;
    return URL.createObjectURL(asset);
  }, [asset]);

  if (!isOpen) return null;

  const consumable = kind === "CONSUMABLE";
  const categories = consumable ? CONSUMABLE_CATEGORIES : COSMETIC_CATEGORIES;
  const effectType = CATEGORY_EFFECT_TYPE[category];
  const isNicknameChange = consumable && category === "CHANGE_NICKNAME";
  const isBanner = category === "BANNER";

  const handleKindChange = (next: ItemKind) => {
    setKind(next);
    if (next === "CONSUMABLE") {
      setContext("PROFILE");
      setCategory((prev) =>
        (CONSUMABLE_CATEGORIES as ItemCategory[]).includes(prev) ? prev : "XP_BOOST"
      );
    } else {
      setCategory((prev) =>
        (COSMETIC_CATEGORIES as ItemCategory[]).includes(prev) ? prev : "AVATAR"
      );
    }
  };

  const handleCategoryChange = (next: ItemCategory) => {
    setCategory(next);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleClose = () => {
    onClose();
    setName("");
    setKind("COSMETIC");
    setCategory("AVATAR");
    setContext("PROFILE");
    setAsset(null);
    setMagnitude("50");
    setDurationMinutes("60");
  };

  const buildEffect = (): ItemEffect | null => {
    if (!consumable) return null;
    if (isNicknameChange) return { kind: "NICKNAME_CHANGE" };
    if (!effectType) return null;
    return {
      kind: "PERCENTAGE_TIMED",
      type: effectType,
      magnitude: Number(magnitude) || 1,
      durationMinutes: Number(durationMinutes) || 1,
    };
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      notify.error("Informe o nome do item.");
      return;
    }

    if (kind === "COSMETIC" && !asset) {
      notify.error("Cosmético exige imagem (asset) no cadastro.");
      return;
    }

    if (consumable && context !== "PROFILE") {
      notify.error("Consumível é sempre PROFILE — nunca MATCH.");
      return;
    }

    if (consumable && !effectType && !isNicknameChange) {
      notify.error("Efeito incompatível com a categoria.");
      return;
    }

    if (consumable && !isNicknameChange) {
      if (Number(magnitude) < 1 || Number(durationMinutes) < 1) {
        notify.error("Magnitude e duração devem ser maiores que zero.");
        return;
      }
    }

    if (asset && asset.size > 5 * 1024 * 1024) {
      notify.error("Imagem excede o limite de 5 MB.");
      return;
    }

    setLoading(true);

    try {
      await ItemRequests.createItem(
        {
          name: trimmedName,
          kind,
          category,
          context,
          consumable,
          effect: buildEffect(),
        },
        asset
      );

      notify.success("Item cadastrado com sucesso!");

      handleClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao cadastrar item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${loading ? styles.loading : ""}`} onClick={handleClose}>
      <form
        className={styles.card}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeButton} onClick={handleClose}>
          &times;
        </button>

        <h1>Criar Item</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="item-name" className={styles.label}>Nome</label>
          <input
            id="item-name"
            className={styles.input}
            type="text"
            placeholder="Digite o nome do item..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="item-kind" className={styles.label}>Tipo</label>
          <select
            id="item-kind"
            className={styles.select}
            value={kind}
            onChange={(e) => handleKindChange(e.target.value as ItemKind)}
            required
          >
            {KINDS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="item-category" className={styles.label}>Categoria</label>
          <select
            id="item-category"
            className={styles.select}
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ItemCategory)}
            required
          >
            {categories.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        {!consumable && (
          <div className={styles.inputgroup}>
            <label htmlFor="item-context" className={styles.label}>
              Contexto
            </label>
            <select
              id="item-context"
              className={styles.select}
              value={context}
              onChange={(e) => setContext(e.target.value as ItemContext)}
              disabled={consumable}
              required
            >
              {CONTEXTS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        )}

        {consumable && !isNicknameChange && effectType && (
          <>
            <div className={styles.inputgroup}>
              <span className={styles.label}>Efeito: {effectType} (PERCENTAGE_TIMED)</span>
            </div>

            <div className={styles.inputgroup}>
              <label htmlFor="item-magnitude" className={styles.label}>Magnitude (%)</label>
              <input
                id="item-magnitude"
                className={styles.input}
                type="number"
                min={1}
                value={magnitude}
                onChange={(e) => setMagnitude(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputgroup}>
              <label htmlFor="item-duration" className={styles.label}>Duração (minutos)</label>
              <input
                id="item-duration"
                className={styles.input}
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {isNicknameChange && (
          <div className={styles.inputgroup}>
            <span className={styles.label}>Efeito: NICKNAME_CHANGE (sem magnitude/duração)</span>
          </div>
        )}

        {!consumable && (
          <div className={styles.inputgroup}>
            <span className={styles.label}>
              Arquivo (Asset) *
            </span>
            <label htmlFor="item-asset" className={`${styles.fileUploadLabel} ${isBanner ? styles.bannerFileLabel : ""}`}>
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
              required={kind === "COSMETIC"}
            />
          </div>
        )}

        <button type="submit" className={`${styles.submit} ${loading ? styles.disabled : ""}`} disabled={loading}>Cadastrar Item</button>
      </form>
    </div>
  );
}
