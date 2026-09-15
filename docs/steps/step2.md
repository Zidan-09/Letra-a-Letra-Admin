# Step 2 — Tipos compartilhados + Rewards (PageResponse, ITEM)

## Implementado

- `src/lib/shared.ts`: adicionado `PageResponse<T>` (ordem do contrato: `content,page,size,totalElements,totalPages,first,last`); `GetBody<T>` mantido como alias; `RewardType` agora `"COIN"|"GEMS"|"ITEM"`.
- `src/lib/Rewards.ts`: `Reward` sem objeto `cosmetic` aninhado (`{type,amount}` + `definitionId?`); `convertReward` usa `ITEM`/`definitionId`.
- Ajustes mínimos para manter compilação: `RewardCard`, `RewardEditor`, `RewardInput`, `RewardModal` (`COSMETIC`→`ITEM`, rótulo "Item"); `LevelDetailsModal` e `OfferDetailsModal` leem `definitionId`.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos tocados — só erros pré-existentes em `RewardInput`/`RewardModal` (confirmado via `git stash`).

## Observações

- Busca de cosmético em `RewardModal`/`RewardInput` ainda usa `/cosmetic/search`; troca pela listagem de itens fica para a etapa de inventário.
- `rewardReference` vazio para moeda mantido; exigência de UUID será tratada nas etapas de levels/offers.
