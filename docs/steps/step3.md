# Step 3 — Autenticação (Keys + Reset com email)

## Implementado

- `src/pages/login/lib/Login.ts`: `Key` com 10 valores (`+AUDIT,TICKET`); `login/me/forgotPassword` migrados para `apiFetch` (retornam `data` direto, sem envelope legado).
- `src/contexts/profile/ProfileContext.tsx`: `Key` com 10 valores.
- `src/pages/login/Login.tsx`: adaptado ao retorno direto (`body.token`, `{ admin }`).
- `src/pages/reset/lib/ResetPassword.ts`: `validateToken({email,token})` e `reset({email,token,newPassword})` via `apiFetch`.
- `src/pages/reset/ResetPassword.tsx`: fluxo em 2 telas (validar com e-mail → redefinir com e-mail + senha 8–16).
- `src/pages/activate/lib/Activate.ts`: migrado para `apiFetch` (`SuccessResponseVoid`, sem retorno).

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos 6 arquivos tocados — passou.

## Observações

- `Admins.ts` já tinha `Key` com 10; modais de admins já listavam `AUDIT/TICKET`.
- `forgot-password` mantém só `{email}`, conforme contrato.
