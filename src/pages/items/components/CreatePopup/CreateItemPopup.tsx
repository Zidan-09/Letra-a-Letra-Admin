import { useState, useMemo, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import {
  ItemRequests,
  EQUIPPABLE_CATEGORIES,
  EFFECT_KINDS,
  PERCENTAGE_TIMED_TYPES,
  getContextForCategory,
  type ItemCategory,
  type ItemKind,
  type EffectKind,
  type PercentageTimedEffectType,
} from "../../lib/Item";
import styles from "./CreateItem.module.css";

interface CreateItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const KINDS: ItemKind[] = ["EQUIPPABLE", "CONSUMABLE"];

export function CreateItemPopup({ isOpen, onClose }: CreateItemPopupProps) {
  const [name, setName] = useState<string>("");
  const [kind, setKind] = useState<ItemKind>("EQUIPPABLE");
  const [category, setCategory] = useState<ItemCategory>("AVATAR");
  const [effectKind, setEffectKind] = useState<EffectKind>("PERCENTAGE_TIMED");
  const [effectType, setEffectType] = useState<PercentageTimedEffectType>("XP_BOOST_PCT");
  const [asset, setAsset] = useState<File | null>(null);

  const [magnitude, setMagnitude] = useState("50");
  const [durationMinutes, setDurationMinutes] = useState("60");

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (!asset) return null;
    return URL.createObjectURL(asset);
  }, [asset]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const equippable = kind === "EQUIPPABLE";
  const context = getContextForCategory(category);
  const percentageTimed = !equippable && effectKind === "PERCENTAGE_TIMED";
  const isBanner = equippable && category === "BANNER";

  const handleKindChange = (next: ItemKind) => {
    setKind(next);
    setAsset(null);
    if (next === "EQUIPPABLE") {
      setCategory("AVATAR");
    } else {
      setEffectKind("PERCENTAGE_TIMED");
      setEffectType("XP_BOOST_PCT");
      setMagnitude("50");
      setDurationMinutes("60");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleClose = () => {
    onClose();
    setName("");
    setKind("EQUIPPABLE");
    setCategory("AVATAR");
    setEffectKind("PERCENTAGE_TIMED");
    setEffectType("XP_BOOST_PCT");
    setAsset(null);
    setMagnitude("50");
    setDurationMinutes("60");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      notify.error("Informe o nome do item.");
      return;
    }

    if (equippable) {
      if (!asset) {
        notify.error("Equipável exige imagem (asset) no cadastro.");
        return;
      }
      if (asset.type && !asset.type.startsWith("image/")) {
        notify.error("O asset precisa ser uma imagem.");
        return;
      }
      if (asset.size > 5 * 1024 * 1024) {
        notify.error("Imagem excede o limite de 5 MB.");
        return;
      }
    }

    if (!equippable && percentageTimed) {
      if (Number(magnitude) < 1 || Number(durationMinutes) < 1) {
        notify.error("Magnitude e duração devem ser maiores que zero.");
        return;
      }
    }

    setLoading(true);

    try {
      if (equippable) {
        await ItemRequests.createItem({
          name: trimmedName,
          kind: "EQUIPPABLE",
          category,
          context,
          asset: asset as File,
        });
      } else if (percentageTimed) {
        await ItemRequests.createItem({
          name: trimmedName,
          kind: "CONSUMABLE",
          effectKind: "PERCENTAGE_TIMED",
          effectType,
          magnitude: Number(magnitude),
          durationMinutes: Number(durationMinutes),
        });
      } else {
        await ItemRequests.createItem({
          name: trimmedName,
          kind: "CONSUMABLE",
          effectKind: "NICKNAME_CHANGE",
        });
      }

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

        {equippable && (
          <>
            <div className={styles.inputgroup}>
              <label htmlFor="item-category" className={styles.label}>Categoria</label>
              <select
                id="item-category"
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                required
              >
                {EQUIPPABLE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputgroup}>
              <label htmlFor="item-context" className={styles.label}>Contexto</label>
              <select
                id="item-context"
                className={styles.select}
                value={context}
                disabled
                required
              >
                <option value={context}>{context}</option>
              </select>
              <span className={styles.hint}>Contexto definido pela categoria: AVATAR/BANNER/FRAME → PROFILE; EMOTE/BOARD/CELL → MATCH.</span>
            </div>

            <div className={styles.inputgroup}>
              <span className={styles.label}>
                Arquivo (Asset) <span className={styles.required}>*</span>
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
                required
              />
              <span className={styles.hint}>Imagem de até 5 MB. A API converte para WebP.</span>
            </div>
          </>
        )}

        {!equippable && (
          <>
            <div className={styles.inputgroup}>
              <label htmlFor="item-effect-kind" className={styles.label}>Efeito</label>
              <select
                id="item-effect-kind"
                className={styles.select}
                value={effectKind}
                onChange={(e) => setEffectKind(e.target.value as EffectKind)}
                required
              >
                {EFFECT_KINDS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            {percentageTimed && (
              <>
                <div className={styles.inputgroup}>
                  <label htmlFor="item-effect-type" className={styles.label}>Tipo de efeito</label>
                  <select
                    id="item-effect-type"
                    className={styles.select}
                    value={effectType}
                    onChange={(e) => setEffectType(e.target.value as PercentageTimedEffectType)}
                    required
                  >
                    {PERCENTAGE_TIMED_TYPES.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.row}>
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
                    <label htmlFor="item-duration" className={styles.label}>Duração (min)</label>
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
                </div>
                <span className={styles.hint}>Para RANKING_POINTS_SHIELD, a duração equivale ao nº de partidas.</span>
              </>
            )}

            {!percentageTimed && (
              <span className={styles.hint}>NICKNAME_CHANGE não usa tipo, magnitude ou duração.</span>
            )}
          </>
        )}

        <button type="submit" className={`${styles.submit} ${loading ? styles.disabled : ""}`} disabled={loading}>Cadastrar Item</button>
      </form>
    </div>
  );
}
