import styles from "../ActivateAccount.module.css";
import { PasswordInput } from "./PasswordInput";

interface ActivateFormProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
}

export function ActivateForm({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  handleSubmit
}: ActivateFormProps) {
  const passwordMismatch = Boolean(confirmPassword && password !== confirmPassword);

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Ativar a Conta</h1>

        <PasswordInput
          id="password"
          label="Crie sua Senha"
          placeholder="Digite sua senha..."
          value={password}
          onChange={setPassword}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          error={passwordMismatch}
          required
          autoComplete="new-password"
        />

        <PasswordInput
          id="confirm"
          label="Confirme sua Senha"
          placeholder="Digite sua senha novamente..."
          value={confirmPassword}
          onChange={setConfirmPassword}
          showPassword={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
          error={passwordMismatch}
          required
          autoComplete="new-password"
        />

        <button type="submit" className={`${styles.submit} ${loading ? styles.disabled : ""}`} disabled={loading}>
          Ativar
        </button>
      </form>
    </div>
  );
}