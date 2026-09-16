import { useState, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import {
  ItemRequests,
  getCategoriesForKind,
  isCategoryValidForKind,
  ITEM_CONTEXTS,
  type ItemCategory,
  type ItemContext,
  type ItemKind,
} from "../../lib/Item";
import styles from "./CreateItem.module.css";

interface CreateItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const KINDS: ItemKind[] = ["COSMETIC", "CONSUMABLE"];

export function CreateItemPopup({ isOpen, onClose }: CreateItemPopupProps) {
  const [name, setName] = useState<string>("");
  const [kind, setKind] = useState<ItemKind>("COSMETIC");
  const [category, setCategory] = useState<ItemCategory | "">("AVATAR");
  const [contexts, setContexts] = useState<ItemContext[]>(["PROFILE"]);
  const [stackable, setStackable] = useState(false);
  const [maxStack, setMaxStack] = useState("1");
  const [asset, setAsset] = useState<File | null>(null);

  const [hasEffect, setHasEffect] = useState(false);
  const [magnitude, setMagnitude] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("1");

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  const previewUrl = useMemo(() => {
    if (!asset) return null;
    return URL.createObjectURL(asset);
  }, [asset]);

  if (!isOpen) return null;

  const consumable = kind === "CONSUMABLE";
  const isCosmetic = kind === "COSMETIC";
  const categories = getCategoriesForKind(kind);

  const toggleContext = (context: ItemContext) => {
    setContexts((prev) =>
      prev.includes(context) ? prev.filter((c) => c !== context) : [...prev, context]
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAsset(e.target.files[0]);
    }
  };

  const handleKindChange = (next: ItemKind) => {
    setKind(next);
    if (!isCategoryValidForKind(next, category as ItemCategory)) {
      setCategory("");
    }
    if (next === "COSMETIC") setHasEffect(false);
    if (next !== "COSMETIC") setAsset(null);
  };

  const handleClose = () => {
    onClose();
    setName("");
    setKind("COSMETIC");
    setCategory("AVATAR");
    setContexts(["PROFILE"]);
    setStackable(false);
    setMaxStack("1");
    setAsset(null);
    setHasEffect(false);
    setMagnitude("1");
    setDurationMinutes("1");
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    if (!category) {
      notify.error("Selecione uma categoria válida para o tipo escolhido.");
      return;
    }

    if (contexts.length === 0) {
      notify.error("Selecione ao menos um contexto de aplicabilidade.");
      return;
    }

    if (kind === "COSMETIC" && !asset) {
      notify.error("Por favor, selecione um arquivo de asset.");
      return;
    }

    if (hasEffect && !consumable) {
      notify.error("Efeito só é permitido para itens consumíveis.");
      return;
    }

    setLoading(true);

    try {
      await ItemRequests.createItem({
        name: name.trim(),
        kind,
        category,
        applicability: contexts,
        stackable,
        maxStack: stackable ? Number(maxStack) || 1 : undefined,
        consumable,
        effect: hasEffect ? {
          type: "XP_BOOST_PCT",
          magnitude: Number(magnitude) || 1,
          durationMinutes: Number(durationMinutes) || 1
        } : undefined
      }, asset);

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
        <p className={styles.subtitle}>Preencha os dados do catálogo. Campos com * são obrigatórios.</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações básicas</h2>

          <div className={styles.inputgroup}>
            <label htmlFor="item-name" className={styles.label}>Nome <span className={styles.required}>*</span></label>
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
            <span className={styles.label} id="item-kind-label">Tipo <span className={styles.required}>*</span></span>
            <div className={styles.segmented} role="radiogroup" aria-labelledby="item-kind-label">
              {KINDS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={kind === value}
                  className={`${styles.segment} ${kind === value ? styles.segmentActive : ""}`}
                  onClick={() => handleKindChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className={styles.hint}>
              {isCosmetic ? "Cosmético: visual equipável, exige asset." : "Consumível: uso único ou temporário, sem asset."}
            </span>
          </div>

          <div className={styles.inputgroup}>
            <label htmlFor="item-category" className={styles.label}>Categoria <span className={styles.required}>*</span></label>
            <select
              id="item-category"
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              required
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <span className={styles.hint}>
              {categories.length} {categories.length === 1 ? "opção disponível" : "opções disponíveis"} para {kind}.
            </span>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contexto de uso <span className={styles.required}>*</span></h2>
          <div className={styles.segmented} role="group" aria-label="Contextos">
            {ITEM_CONTEXTS.map((context) => {
              const active = contexts.includes(context);
              return (
                <button
                  key={context}
                  type="button"
                  aria-pressed={active}
                  className={`${styles.segment} ${active ? styles.segmentActive : ""}`}
                  onClick={() => toggleContext(context)}
                >
                  {context}
                </button>
              );
            })}
          </div>
          <span className={styles.hint}>Selecione ao menos um. É possível ativar os dois.</span>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Empilhamento e efeito <span className={styles.optional}>(opcional)</span></h2>

          <label className={styles.check}>
            <input
              type="checkbox"
              className={styles.checkInput}
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
            />
            <span className={styles.checkText}>Empilhável</span>
          </label>

          {stackable && (
            <div className={styles.inputgroup}>
              <label htmlFor="item-max-stack" className={styles.label}>Máximo por pilha</label>
              <input
                id="item-max-stack"
                className={styles.input}
                type="number"
                min={1}
                value={maxStack}
                onChange={(e) => setMaxStack(e.target.value)}
              />
            </div>
          )}

          {consumable && (
            <label className={styles.check}>
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={hasEffect}
                onChange={(e) => setHasEffect(e.target.checked)}
              />
              <span className={styles.checkText}>Possui efeito (XP_BOOST_PCT)</span>
            </label>
          )}

          {consumable && hasEffect && (
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
                />
              </div>
            </div>
          )}
        </section>

        {isCosmetic && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Asset <span className={styles.required}>*</span></h2>
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
              required={isCosmetic}
            />
            <span className={styles.hint}>Obrigatório para itens COSMETIC.</span>
          </section>
        )}

        <button type="submit" className={`${styles.submit} ${loading ? styles.disabled : ""}`} disabled={loading}>Cadastrar Item</button>
      </form>
    </div>
  );
}
