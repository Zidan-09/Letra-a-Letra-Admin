import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FormEvent } from "react";

import { useNotification } from "../../hooks/notification/useNotification";
import { ResetPasswordRequests } from "./lib/ResetPassword";

import styles from "./ResetPassword.module.css";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validToken, setValidToken] = useState(false);

  const [loadingReq, setLoadingReq] = useState(false);
  const [validating, setValidating] = useState(false);

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleValidate = async (event: FormEvent) => {
    event.preventDefault();

    if (validating) return;
    if (!token) return;
    if (!email.trim()) {
      notify.error("Informe o e-mail da conta.");
      return;
    }

    setValidating(true);

    try {
      await ResetPasswordRequests.validateToken({ email: email.trim(), token });
      setValidToken(true);
    } catch (err: unknown) {
      setValidToken(false);
      notify.error(err instanceof Error ? err.message : "Token inválido ou expirado.");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (loadingReq) return;
    setLoadingReq(true);

    if (!email.trim()) {
      notify.error("Informe o e-mail da conta.");
      setLoadingReq(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      notify.error("A senha deve ter entre 8 e 16 caracteres.");
      setLoadingReq(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("As senhas devem ser iguais!");
      setLoadingReq(false);
      return;
    }

    try {
      await ResetPasswordRequests.reset({
        email: email.trim(),
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
    } finally {
      setLoadingReq(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.invalidToken}>
        <p>O token informado é inválido ou expirou.</p>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className={styles.container}>
        <form className={styles.card} onSubmit={handleValidate}>
          <h1>Redefinir Senha</h1>

          <div className={styles.inputgroup}>
            <label htmlFor="email" className={styles.label}>
              E-mail
            </label>

            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="Digite o e-mail da conta..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className={`${styles.submit} ${validating ? styles.disabled : ""}`}
            type="submit"
            disabled={validating}
          >
            Validar solicitação
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${loadingReq ? styles.loading : ""}`}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Redefinir Senha</h1>

        <div className={styles.inputgroup}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>

          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="Digite o e-mail da conta..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

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

        <button 
          className={`${styles.submit} ${loadingReq ? styles.disabled : ""}`} 
          type="submit"
          disabled={loadingReq}
        >
          Redefinir Senha
        </button>
      </form>
    </div>
  );
}