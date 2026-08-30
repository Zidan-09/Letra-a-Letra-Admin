import { useActivateAccount } from "./hooks/useActivateAccount";
import { ActivateForm, InvalidToken } from "./components";

export function ActivateAccount() {
  const { token, ...form } = useActivateAccount();

  if (!token) return <InvalidToken />;

  return <ActivateForm {...form} />;
}