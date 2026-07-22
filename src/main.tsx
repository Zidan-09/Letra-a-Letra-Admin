import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import "./global.css";

import { router } from "./router";
import { NotificationProvider } from "./hooks/notification/useNotification";
import { RealtimeProvider } from "./contexts/websocket/RealtimeProvider";
import { AuthProvider } from "./contexts/auth/AuthProvider";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <RealtimeProvider>
                <NotificationProvider>
                    <RouterProvider router={router} />
                </NotificationProvider>
            </RealtimeProvider>
        </AuthProvider>
    </React.StrictMode>
);