import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/notification/useNotification";
import type { FormEvent } from "react";
import { login } from "../../lib/Login";
import styles from "./Login.module.css";
import { JwtDecoderUtil } from "../../utils/decodeToken";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await login(email, password);

      if (!response.success) throw new Error("Credenciais Inválidas");

      const { role } = JwtDecoderUtil.decode(response.data.token);

      if (role !== "ADMIN") throw new Error("Este painel é apenas para administradores!");

      localStorage.setItem("id", response.data.id);
      localStorage.setItem("token", response.data.token);

      notify.success("Usuário autenticado");

      navigate("/admin");

    } catch (err: unknown) {
      if (err instanceof Error) {
        notify.error(err.message);
        return;
      }

      notify.error("Ocorreu um erro inesperado...");
    }
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
