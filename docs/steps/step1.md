# Step 1 — Base HTTP (envelope + apiFetch)

## Implementado

- `src/lib/config.ts`: adicionados `SuccessResponse<T>`, `SuccessResponseVoid`, `ErrorResponse` e `isSuccess()`; `HttpResponse` mantido como legado para não quebrar os serviços existentes.
- `src/lib/http.ts`: criado `apiFetch()` com parse defensivo (`text` → `try JSON`), `HttpError{status,code,message}`, `401` → logout + redirect `/`, mensagens para `403/429`, suporte a `204`/corpo vazio.

## Testes

- `npx tsc -b` — passou.
- `npx eslint src/lib/config.ts src/lib/http.ts` — passou.
- `npm run lint` completo — 59 erros pré-existentes em páginas/libs, nenhum nos arquivos novos.

## Observações

- Nenhum serviço migrado ainda; migração será nas próximas etapas.
- `401` texto puro fora do envelope agora não quebra com `.json()`.
