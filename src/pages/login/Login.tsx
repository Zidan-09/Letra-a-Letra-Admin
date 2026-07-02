import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";
import type { FormEvent } from "react";
import { login } from "../../lib/Login";
import styles from "./Login.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const data = await login(email, password);

    if (!data) return notify.error("Credenciais inválidas");

    localStorage.setItem("id", data.id);
    localStorage.setItem("token", data.token);

    navigate("/cosmetic");

    notify.success("Usuário autenticado")
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Entrar</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="email" className={styles.label}>E-mail</label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="Digite seu e-mail..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="password" className={styles.label}>Senha</label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="Digite sua senha..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submit}>Entrar</button>
      </form>
    </div>
  );
}
