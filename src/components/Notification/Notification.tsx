import styles from "./Notification.module.css";

export type NotificationType = "success" | "warning" | "error"

export type NotificationProps = {
    type: NotificationType;
    message: string;
}

function Notification({ type, message }: NotificationProps) {
    const emoji = type === "success" ?
        "✅" :
        type === "warning" ?
        "⚠️" :
        "❌";

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <p className={styles.text}>{emoji} {message}</p>
        </div>
    )
}

export default Notification;