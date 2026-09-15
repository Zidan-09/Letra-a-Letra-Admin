# Step 4 — Inventário/Cosméticos (P10–P15)

## Implementado

- `src/pages/cosmetics/lib/Cosmetic.ts`: reescrito — tipos `ItemKind`, `ItemCategory`, `ItemContext`, `ItemEffect`, `ItemDefinition`, `UserItem`, `CreateItemRequest`, `UpdateItemRequest`; métodos `createItem` (`POST /admin/items`), `updateItem`/`setAvailable` (`PUT /admin/items/{itemId}`), `listItems` (`GET /user/items`), `getUserItems` (`GET /user/{userId}/items`), todos via `apiFetch` com filtros `kind/category/context/equipped`. Removidos: `FormData`, `disable/enable` separados, `deleteCosmetic`, `search`, modelo `Cosmetic` antigo.
- `src/pages/cosmetics/Cosmetics.tsx`: lista via `listItems({kind:COSMETIC})` (sem paginação — contrato retorna `{items}`); colunas `nome/categoria/quantidade/status`; permissão `ADMIN`→`COSMETIC`; toggle via `PUT {available}`; botão delete removido (sem endpoint de exclusão de definição no contrato).
- `CreateCosmeticPopup`: JSON com `name/kind/category/applicability/stackable/maxStack/assetPath` (texto, sem upload).
- `EditCosmeticPopup`: só `name/assetPath/available` (únicos editáveis no `UpdateItemDefinitionRequest`).
- `CosmeticDetailsModal`: exibe `itemId/category/quantity/assetPath` (sem URL R2 hardcoded).
- `RewardModal`/`RewardInput`: seleção de `ITEM` via `listItems` + filtro cliente (substitui `/cosmetic/search`).

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos 7 arquivos — só erros do padrão pré-existente (`set-state-in-effect`, ternários); antes eram 12 problems nos mesmos arquivos, agora 9.

## Observações

- `revokeUserCosmetic` em Users permanece — será tratado na etapa de Users.
- Status `available` da listagem mantido em estado local (listagem retorna `UserItem` sem `available`); o toggle persiste via `PUT` e reflete o retorno.
- Sem `DELETE` de definição nem busca server-side no contrato — remoção de catálogo = `available=false`.
