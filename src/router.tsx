import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "./pages/login/Login";
import { HomePage } from "./pages/home/Home";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path: "/home",
        element: <HomePage />
    }
]);