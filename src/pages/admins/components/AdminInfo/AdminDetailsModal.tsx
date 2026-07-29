import type { Admin } from "../../lib/Admins";

interface AdminDetailsModalProps {
    isOpen: boolean;
    admin: Admin | null;
    onClose: () => void;
}

export function AdminDetailsModal({ isOpen, admin, onClose }: AdminDetailsModalProps) {
    if (!isOpen) return;
    
    return (
        <div></div>
    );
}