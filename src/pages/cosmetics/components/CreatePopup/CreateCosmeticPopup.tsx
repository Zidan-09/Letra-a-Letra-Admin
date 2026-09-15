import { useState } from "react";
import type { FormEvent } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { CosmeticRequests, type ItemCategory, type ItemContext } from "../../lib/Cosmetic";
import styles from "./CreateCosmetic.module.css";

interface CreateCosmeticPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ItemCategory[] = ["AVATAR", "BANNER", "FRAME", "EMOTE", "BOARD_SKIN", "CELL_SKIN", "XP_BOOST"];
const CONTEXTS: ItemContext[] = ["PROFILE", "MATCH"];

export function CreateCosmeticPopup({ isOpen, onClose }: CreateCosmeticPopupProps) {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<ItemCategory>("AVATAR");
  const [assetPath, setAssetPath] = useState<string>("");
  const [contexts, setContexts] = useState<ItemContext[]>(["PROFILE"]);
  const [stackable, setStackable] = useState(false);
  const [maxStack, setMaxStack] = useState("1");

  const [loading, setLoading] = useState(false);

  const { notify } = useNotification();

  if (!isOpen) return null;

  const toggleContext = (context: ItemContext) => {
    setContexts((prev) =>
      prev.includes(context) ? prev.filter((c) => c !== context) : [...prev, context]
    );
  };

  const handleClose = () => {
    onClose();
    setName("");
    setCategory("AVATAR");
    setAssetPath("");
    setContexts(["PROFILE"]);
    setStackable(false);
    setMaxStack("1");
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await CosmeticRequests.createItem({
        name: name.trim(),
        kind: "COSMETIC",
        category,
        applicability: contexts,
        stackable,
        maxStack: Number(maxStack) || 1,
        consumable: false,
        assetPath: assetPath.trim() || undefined
      });

      notify.success("Cosmético cadastrado com sucesso!");

      handleClose();

    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Erro ao cadastrar cosmético.");
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
          <label htmlFor="cosmetic-category" className={styles.label}>Categoria</label>
          <select
            id="cosmetic-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as ItemCategory)}
            required
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="cosmetic-asset" className={styles.label}>Asset (URL/caminho)</label>
          <input
            id="cosmetic-asset"
            className={styles.input}
            type="text"
            placeholder="https://..."
            value={assetPath}
            onChange={(e) => setAssetPath(e.target.value)}
          />
        </div>

        <div className={styles.inputgroup}>
          <span className={styles.label}>Contextos</span>
          {CONTEXTS.map((context) => (
            <label key={context}>
              <input
                type="checkbox"
                checked={contexts.includes(context)}
                onChange={() => toggleContext(context)}
              />
              {context}
            </label>
          ))}
        </div>

        <div className={styles.inputgroup}>
          <label>
            <input
              type="checkbox"
              checked={stackable}
              onChange={(e) => setStackable(e.target.checked)}
            />
            Empilhável
          </label>
        </div>

        {stackable && (
          <div className={styles.inputgroup}>
            <label htmlFor="cosmetic-max-stack" className={styles.label}>Máximo por pilha</label>
            <input
              id="cosmetic-max-stack"
              className={styles.input}
              type="number"
              min={1}
              value={maxStack}
              onChange={(e) => setMaxStack(e.target.value)}
            />
          </div>
        )}

        <button type="submit" className={`${styles.submit} ${loading ? styles.disabled : ""}`} disabled={loading}>Cadastrar Cosmético</button>
      </form>
    </div>
  );
}
