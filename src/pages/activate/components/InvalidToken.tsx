import styles from "../ActivateAccount.module.css";

export function InvalidToken() {
  return (
    <div className={styles.invalidToken}>
      <p>O token informado é inválido</p>
    </div>
  );
}