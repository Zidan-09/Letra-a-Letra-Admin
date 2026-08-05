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
import { TransactionsPage } from "./pages/transactions/Transactions";
import { LogsPage } from "./pages/logs/Logs";
import { ActivateAccount } from "./pages/activate/ActivateAccount";
import { ResetPasswordPage } from "./pages/reset/ResetPassword";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path: "/ativar-conta",
        element: <ActivateAccount />
    },
    {
        path: "/redefinir-senha",
        element: <ResetPasswordPage />
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
                        path: "transactions",
                        element: <TransactionsPage />
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
                    },
                    {
                        path: "logs",
                        element: <LogsPage />
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