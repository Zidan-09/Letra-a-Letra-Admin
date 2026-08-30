import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../hooks/notification/useNotification";
import type { FormEvent } from "react";
import { ActivateRequest } from "../lib/Activate";

export function useActivateAccount() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    if (loading) return;

    setLoading(true);

    event.preventDefault();

    if (password !== confirmPassword) {
      notify.error("As senhas devem ser iguais!");
      return;
    }

    if (!token) {
      notify.error("Token inválido");
      return;
    }

    try {
      await ActivateRequest.active({ token, password });

      notify.success("Conta ativada com sucesso!");

      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        notify.error(err.message);
        return;
      }

      notify.error("Ocorreu um erro inesperado...");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleSubmit,
    token
  };
}