import type { Admin } from "../../lib/Admins";
import styles from "./EditAdminPopup.module.css";

interface EditAdminPopupProps {
    isOpen: boolean;
    admin: Admin | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditAdminPopup({ isOpen, admin, onClose, onSuccess }: EditAdminPopupProps) {
    if (!isOpen) return;

    return (
        <div className={styles.overlay} onClick={onClose}>
            
        </div>
    );
}