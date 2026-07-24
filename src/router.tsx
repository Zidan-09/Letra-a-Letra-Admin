import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedLayout } from "./layout/ProtectedLayout";
import { LoginPage } from "./pages/login/Login";
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./pages/dashboard/Dashboard";
import { AdminsPage } from "./pages/admins/Admins";
import { GamesPage } from "./pages/games/Games";
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
        element: <ProtectedLayout />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />
                    },
                    {
                        path: "users",
                        element: <UsersPage />
                    },
                    {
                        path: "games",
                        element: <GamesPage />
                    },
                    {
                        path: "admins",
                        element: <AdminsPage />
                    },
                    {
                        path: "cosmetics",
                        element: <CosmeticsPage />
                    },
                    {
                        path: "offers",
                        element: <OffersPage />
                    },
                    {
                        path: "levels",
                        element: <LevelsPage />
                    }
                ]
            }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/admin" replace />
    }
]);