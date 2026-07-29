
interface RegisterAdminPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterAdminPopup({ isOpen, onClose }: RegisterAdminPopupProps) {
    if (!isOpen) return;
    
    return (
        <div></div>
    );
}