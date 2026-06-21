import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from "react";

import Notification, {
    type NotificationType
} from "../components/Notification/Notification";

import styles from "./useNotification.module.css";

type NotificationItem = {
    id: number;
    type: NotificationType;
    message: string;
};

type NotificationContextData = {
    notify: {
        success(message: string): void;
        warning(message: string): void;
        error(message: string): void;
    };
};

const NotificationContext = createContext<NotificationContextData | null>(null);


export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);


    function addNotification(
        type: NotificationType,
        message: string
    ) {
        const id = Date.now();

        setNotifications(old => [
            ...old,
            {
                id,
                type,
                message
            }
        ]);


        setTimeout(() => {
            setNotifications(old =>
                old.filter(notification => notification.id !== id)
            );
        }, 3000);
    }


    return (
        <NotificationContext.Provider
            value={{
                notify: {
                    success: message =>
                        addNotification("success", message),

                    warning: message =>
                        addNotification("warning", message),

                    error: message =>
                        addNotification("error", message),
                }
            }}
        >

            {children}


            <div className={styles.container}>
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        message={notification.message}
                    />
                ))}
            </div>


        </NotificationContext.Provider>
    );
}


export function useNotification() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotification deve ser usado dentro de NotificationProvider"
        );
    }

    return context;
}