import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import "./global.css";

import { router } from "./router";
import { NotificationProvider } from "./hooks/notification/useNotification";
import { RealtimeProvider } from "./contexts/websocket/RealtimeProvider";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { ProfileProvider } from "./contexts/profile/ProfileProvider";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <ProfileProvider>
                <RealtimeProvider>
                    <NotificationProvider>
                        <RouterProvider router={router} />
                    </NotificationProvider>
                </RealtimeProvider>
            </ProfileProvider>
        </AuthProvider>
    </React.StrictMode>
);