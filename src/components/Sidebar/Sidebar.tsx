import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Shield,
    Palette,
    Gift,
    ChartColumn
} from "lucide-react";

import styles from "./Sidebar.module.css";

const items = [
    {
        label: "Dashboard",
        to: "/admin",
        icon: LayoutDashboard
    },
    {
        label: "Usuários",
        to: "/admin/users",
        icon: Users
    },
    {
        label: "Administradores",
        to: "/admin/admins",
        icon: Shield
    },
    {
        label: "Cosméticos",
        to: "/admin/cosmetics",
        icon: Palette
    },
    {
        label: "Ofertas",
        to: "/admin/offers",
        icon: Gift
    },
    {
        label: "Níveis",
        to: "/admin/levels",
        icon: ChartColumn
    }
];

export function Sidebar() {
    return (
        <aside className={styles.container}>
            <div className={styles.logo}>
                <img src="/logo2.png" alt="Letra a Letra" />
                <span>Painel Administrativo</span>
            </div>

            <nav className={styles.navigation}>
                {items.map(({ label, to, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/admin"}
                        className={({ isActive }) =>
                            `${styles.item} ${isActive ? styles.active : ""}`
                        }
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}