# Step 5 — Levels (wrapper {level}, rewards ITEM)

## Implementado

- `src/pages/levels/lib/Levels.ts`: migrado para `apiFetch`; tipos `Reward` sem cosmético aninhado (da Etapa 2); `createLevel`/`updateLevel` desembrulham `{level}`; `GET` lista retorna `PageResponse<Level>`.
- `CreateLevel.tsx`/`EditLevel.tsx`: mensagens de erro agora exibem `err.message` (código da API via `HttpError`).

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — só erros pré-existentes (`set-state-in-effect`, ternários).

## Observações

- `rewardReference` UUID obrigatório para `ITEM` depende da seleção via catálogo (Etapa 4); moeda ainda envia `""` — pendente confirmação do backend (P17, UNCERTAIN).
- Mapeamento `level` (request) vs `value` (response) mantido conforme contrato.
