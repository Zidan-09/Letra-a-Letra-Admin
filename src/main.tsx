import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import "./global.css";

import { router } from "./router";
import { NotificationProvider } from "./hooks/useNotification";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <NotificationProvider>
            <RouterProvider router={router} />
        </NotificationProvider>
    </React.StrictMode>
);