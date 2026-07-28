import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  search: () => void;
}

export function SearchBar({
  value,
  placeholder = "Pesquisar...",
  onChange,
  search
}: SearchBarProps) {

    return (
        <div className={styles.container}>
            <Search size={18} className={styles.icon} />

            <input
                className={styles.input}
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    search();
                    }
                }}
            />
        </div>
    );
}