import styles from "../ActivateAccount.module.css";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  error?: boolean;
  required?: boolean;
  autoComplete?: string;
}

const EyeOpen = () => (
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
);

const EyeClosed = () => (
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
);

export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onToggleShow,
  error = false,
  required = true,
  autoComplete = "current-password"
}: PasswordInputProps) {
  return (
    <div className={styles.inputgroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.passwordWrapper}>
        <input
          id={id}
          className={`${styles.input} ${styles.passwordInput} ${error ? styles.notEquals : ""}`}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggleShow}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </div>
  );
}