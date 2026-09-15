# Step 13 — Itens = catálogo, Users = inventário do jogador

## Contexto

A API separou os domínios: tag `Items` (`GET/POST /admin/items`, `GET/PUT/DELETE /admin/items/{itemId}` — catálogo paginado com filtros `kind,category,available`) vs tag `Inventory` (`GET /user/items`, `GET /user/{userId}/items`, `DELETE /user/items/{itemId}`, `equip/consume` — posse do jogador). A seção Itens lia o inventário próprio do admin (`GET /user/items`), por isso a lista ficava vazia após cadastrar (cadastro escreve no catálogo, lista lia o inventário).

## Implementado

- `src/pages/items/lib/Item.ts`: `ItemRequests` agora é só catálogo — `listDefinitions(page,size,{kind,category,available})` (`GET /admin/items` paginado), `getItem`, `deleteItem` (novo), `createItem`/`updateItem` multipart mantidos; removidos `listItems`/`getUserItems` (inventário próprio) e tipo `UserItem` duplicado.
- `src/pages/items/Items.tsx`: tabela do catálogo (`ItemDefinition`: nome/id, tipo, categoria, versão, disponível real da resposta); paginação (`page/totalPages`, 8/pág); filtros tipo/categoria/disponibilidade; botão Excluir (`DELETE`, permissão `DELETE`); toggle atualiza a linha com o retorno.
- `ItemDetailsModal`: campos do catálogo (versão, disponível, empilhável/máx, consumível, efeito, contextos) em vez de quantidade.
- `EditItemPopup`: prop `ItemDefinition`, `available` inicializado do item.
- `RewardModal`/`RewardInput`: busca de `ITEM` via catálogo (`listDefinitions(0,20,{available:true})` + filtro cliente).
- Permissão `ITEMS`: já estava correta em login/admins/profile/modais/Items (novo enum da API) — verificado, sem mudança.
- Seção Users/inventário: já usava `GET /user/{userId}/items` + `DELETE /user/items/{itemId}` — conforme o novo contrato, sem mudança.

## Testes

- `npx tsc -b` — passou.
- `npm run build` — passou.
- `npx eslint` nos arquivos — só padrões pré-existentes (`set-state-in-effect`, ternários, unused vars).

## Observações

- `equip/consume` do inventário não têm UI no admin (só jogador) — não implementados, fora do escopo.
- `ItemKind COSMETIC` e eventos `COSMETIC_*` de auditoria permanecem (valores do contrato).
