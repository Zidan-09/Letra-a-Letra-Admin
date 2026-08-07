import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  search: () => void;
  variant?: "default" | "modal";
  trigger?: "default" | "on-change"
}

export function SearchBar({
  value,
  placeholder = "Pesquisar...",
  onChange,
  search,
  variant = "default",
  trigger = "default"
}: SearchBarProps) {

    return (
        <div className={`${styles.container} ${variant === "modal" ? styles.containerModal : ""}`}>
            <Search size={18} className={styles.icon} />

            <input
                className={styles.input}
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value)

                    if (trigger === "on-change") {
                        search();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    search();
                    }
                }}
            />
        </div>
    );
}