import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "./pages/login/Login";
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./pages/dashboard/Dashboard";
import { AdminsPage } from "./pages/admins/Admins";
import { CosmeticsPage } from "./pages/cosmetics/Cosmetics";
import { LevelsPage } from "./pages/levels/Levels";
import { OffersPage } from "./pages/offers/Offers";
import { UsersPage } from "./pages/users/Users";

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
            },
            {
                path: "admins",
                element: <AdminsPage />
            },
            {
                path: "levels",
                element: <LevelsPage />
            },
            {
                path: "offers",
                element: <OffersPage />
            },
            {
                path: "users",
                element: <UsersPage />
            }
        ]
    }
]);