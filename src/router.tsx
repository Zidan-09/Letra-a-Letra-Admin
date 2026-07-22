import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "./pages/login/Login";
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./pages/dashboard/Dashboard";
import { CosmeticsPage } from "./pages/cosmetics/Cosmetics";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: "cosmetics",
                element: <CosmeticsPage />
            }
        ]
    }
]);