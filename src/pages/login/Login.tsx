import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { useNotification } from "../../hooks/notification/useNotification";
import type { FormEvent } from "react";
import { Login } from "../../lib/Login";
import { JwtDecoderUtil } from "../../utils/decodeToken";
import styles from "./Login.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { notify } = useNotification();
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await Login.login(email, password);

      if (!response.success) throw new Error("Credenciais Inválidas");

      const { role } = JwtDecoderUtil.decode(response.data.token);

      if (role !== "ADMIN") throw new Error("Este painel é apenas para administradores!");

      login({
        id: response.data.id,
        token: response.data.token
      });

      notify.success("Usuário autenticado");

      navigate("/admin");

    } catch (err: unknown) {
      if (err instanceof Error) {
        notify.error(err.message);
        return;
      }

      notify.error("Ocorreu um erro inesperado...");
    }
  };

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
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              className={`${styles.input} ${styles.passwordInput}`}
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submit}>Entrar</button>
      </form>
    </div>
  );
}