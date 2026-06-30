import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "./pages/login/Login";
import { HomePage } from "./pages/home/Home";
import { CosmeticsPage } from "./pages/cosmetics/Cosmetics";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path: "/home",
        element: <HomePage />
    },
    {
        path: "/cosmetic",
        element: <CosmeticsPage />
    }
]);