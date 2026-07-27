import type { Offer } from "../../../../lib/Offers";
import styles from "./OfferDetailsModal.module.css";

interface OfferDetailsModalProps {
    isOpen: boolean;
    offer: Offer | null;
    onClose: () => void;
}

export function OfferDetailsModal({ isOpen, offer, onClose }: OfferDetailsModalProps) {
    return (
        <div>

        </div>
    );
}