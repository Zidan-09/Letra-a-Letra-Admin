import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import {
  ItemRequests,
  EQUIPPABLE_CATEGORIES,
  PERCENTAGE_TIMED_TYPES,
  getContextForCategory,
  type ItemDefinition,
  type ItemCategory,
  type PercentageTimedEffectType,
} from "../../lib/Item";
import styles from "./EditItem.module.css";

interface EditItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDefinition | null;
  onSuccess?: () => void;
}

export function EditItemPopup({ isOpen, onClose, item, onSuccess }: EditItemPopupProps) {
  const [name, setName] = useState<string>(item?.name || "");
  const [available, setAvailable] = useState<boolean>(item?.available ?? true);
  const [category, setCategory] = useState<ItemCategory>("AVATAR");
  const [effectType, setEffectType] = useState<PercentageTimedEffectType>("XP_BOOST_PCT");
  const [magnitude, setMagnitude] = useState("50");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [asset, setAsset] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (asset) return URL.createObjectURL(asset);
    return item?.assetPath || null;
  }, [asset, item]);

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name);
      setAvailable(item.available);
      setAsset(null);
      if (item.kind === "EQUIPPABLE") {
        setCategory(item.category ?? "AVATAR");
      }
      if (item.kind === "CONSUMABLE") {
        const effect = item.effect;
        if (effect?.kind === "PERCENTAGE_TIMED") {
          setEffectType(effect.type);
          setMagnitude(String(effect.magnitude));
          setDurationMinutes(String(effect.durationMinutes));
        }
      }
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const equippable = item.kind === "EQUIPPABLE";
  const consumableTimed = !equippable && item.effect?.kind === "PERCENTAGE_TIMED";
  const context = getContextForCategory(category);
  const categoryChanged = equippable && category !== item.category;
  const nameChanged = name.trim() !== "" && name.trim() !== item.name;
  const availableChanged = available !== item.available;
  const oldEffect = item.effect?.kind === "PERCENTAGE_TIMED" ? item.effect : null;
  const effectChanged =
    Boolean(consumableTimed && oldEffect) &&
    (effectType !== oldEffect!.type ||
      magnitude !== String(oldEffect!.magnitude) ||
      durationMinutes !== String(oldEffect!.durationMinutes));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      notify.error("Informe o nome do item.");
      return;
    }

    if (equippable && asset) {
      if (asset.type && !asset.type.startsWith("image/")) {
        notify.error("O asset precisa ser uma imagem.");
        return;
      }
      if (asset.size > 5 * 1024 * 1024) {
        notify.error("Imagem excede o limite de 5 MB.");
        return;
      }
    }

    if (!equippable && consumableTimed) {
      if (Number(magnitude) < 1 || Number(durationMinutes) < 1) {
        notify.error("Magnitude e duração devem ser maiores que zero.");
        return;
      }
    }

    if (!nameChanged && !availableChanged && !categoryChanged && !asset && !effectChanged) {
      notify.error("Nenhuma alteração para salvar.");
      return;
    }

    setLoading(true);

    try {
      if (equippable) {
        await ItemRequests.updateItem(
          item.itemId,
          {
            ...(nameChanged ? { name: trimmedName } : {}),
            ...(availableChanged ? { available } : {}),
            ...(categoryChanged ? { category, context } : {}),
            ...(asset ? { isNewAsset: true } : {}),
          },
          asset
        );
      } else {
        await ItemRequests.updateItem(item.itemId, {
          ...(nameChanged ? { name: trimmedName } : {}),
          ...(availableChanged ? { available } : {}),
          ...(effectChanged && consumableTimed
            ? {
                effectKind: "PERCENTAGE_TIMED" as const,
                effectType,
                magnitude: Number(magnitude),
                durationMinutes: Number(durationMinutes),
              }
            : {}),
        });
      }

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

        <div className={styles.metaRow}>
          <span className={styles.metaBadge}>{item.kind}</span>
          {item.category && <span className={styles.metaBadge}>{item.category}</span>}
          {item.effect && <span className={styles.metaBadge}>{item.effect.kind}</span>}
          <span className={styles.metaBadge}>v{item.version}</span>
        </div>

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
          {equippable && !asset && nameChanged && (
            <span className={styles.hint}>Sem novo asset, o arquivo atual é recopiado para o novo nome.</span>
          )}
        </div>

        {equippable && (
          <>
            <div className={styles.inputgroup}>
              <label htmlFor="edit-item-category" className={styles.label}>Categoria</label>
              <select
                id="edit-item-category"
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
              >
                {EQUIPPABLE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputgroup}>
              <span className={styles.label}>
                Arquivo (Asset) <span className={styles.optional}>(só com nova imagem)</span>
              </span>
              <label htmlFor="edit-item-asset" className={`${styles.fileUploadLabel} ${category === "BANNER" ? styles.bannerFileLabel : ""}`}>
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
                id="edit-item-asset"
                className={styles.fileInput}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              <span className={styles.hint}>Envie um arquivo apenas para trocar a imagem.</span>
            </div>
          </>
        )}

        {!equippable && consumableTimed && (
          <>
            <div className={styles.inputgroup}>
              <label htmlFor="edit-effect-type" className={styles.label}>Tipo de efeito</label>
              <select
                id="edit-effect-type"
                className={styles.select}
                value={effectType}
                onChange={(e) => setEffectType(e.target.value as PercentageTimedEffectType)}
              >
                {PERCENTAGE_TIMED_TYPES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputgroup}>
              <label htmlFor="edit-magnitude" className={styles.label}>Magnitude (%)</label>
              <input
                id="edit-magnitude"
                className={styles.input}
                type="number"
                min={1}
                value={magnitude}
                onChange={(e) => setMagnitude(e.target.value)}
              />
            </div>

            <div className={styles.inputgroup}>
              <label htmlFor="edit-duration" className={styles.label}>Duração (min)</label>
              <input
                id="edit-duration"
                className={styles.input}
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <span className={styles.hint}>Para trocar o efeito, o trio tipo/magnitude/duração é reenviado junto.</span>
          </>
        )}

        {!equippable && !consumableTimed && (
          <span className={styles.hint}>Item de troca de nome (NICKNAME_CHANGE): só nome e disponibilidade são editáveis.</span>
        )}

        <button type="submit" disabled={loading} className={`${styles.submit} ${loading ? styles.disabled : ""}`}>Salvar Alterações</button>
      </form>
    </div>
  );
}
