import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FormEvent } from "react";

import { useNotification } from "../../hooks/notification/useNotification";
import { ResetPasswordRequests } from "./lib/ResetPassword";

import styles from "./ResetPassword.module.css";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await ResetPasswordRequests.validateToken(token);
        setValidToken(true);
      } catch {
        setValidToken(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      notify.error("As senhas devem ser iguais!");
      return;
    }

    try {
      await ResetPasswordRequests.reset({
        token: token!,
        newPassword: newPassword,
      });

      notify.success("Senha redefinida com sucesso!");

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        notify.error(err.message);
        return;
      }

      notify.error("Ocorreu um erro inesperado...");
    }
  };

  if (loading) {
    return (
      <div className={styles.invalidToken}>
        <p>Validando solicitação...</p>
      </div>
    );
  }

  if (!validToken || !token) {
    return (
      <div className={styles.invalidToken}>
        <p>O token informado é inválido ou expirou.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Redefinir Senha</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="password" className={styles.label}>
            Nova Senha
          </label>

          <div className={styles.passwordWrapper}>
            <input
              id="password"
              className={`${styles.input} ${styles.passwordInput} ${
                confirmPassword && newPassword !== confirmPassword
                  ? styles.notEquals
                  : ""
              }`}
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua nova senha..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.inputgroup}>
          <label htmlFor="confirm" className={styles.label}>
            Confirmar Senha
          </label>

          <div className={styles.passwordWrapper}>
            <input
              id="confirm"
              className={`${styles.input} ${styles.passwordInput} ${
                confirmPassword && newPassword !== confirmPassword
                  ? styles.notEquals
                  : ""
              }`}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme sua nova senha..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button className={styles.submit} type="submit">
          Redefinir Senha
        </button>
      </form>
    </div>
  );
}