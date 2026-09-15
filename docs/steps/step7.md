# Step 7 — Users (busca paginada, items, revoke 204, banned)

## Implementado

- `src/pages/users/lib/Users.ts`: migrado para `apiFetch`; `findUserByUsername(username,page,size)` retorna `PageResponse<User>`; `getUserInventory(userId)` usa `GET /user/{userId}/items` → `{items}` sem paginação; `revokeUserItem(itemId)` usa `DELETE /user/items/{itemId}` (sem `userId`, 204 sem JSON); `grantReward` com `CreateReward` ITEM; `BanInfo` com `banned: boolean`; `equipped: InventoryItem[]` (`itemId/kind/category/context/quantity/equipped/assetPath`); `COSMETIC_TYPES` → `ITEM_CATEGORIES` (7 categorias).
- `Users.tsx`: busca lê `content[0]` (lista) com mensagem quando vazio.
- `UserDetailsInfo.tsx`: moderação usa `banInfo.banned`; inventário sem paginação (`UserItem` com quantidade); revoke via novo endpoint; equipados por categoria.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — só erros pré-existentes.

## Observações

- `DELETE` retorna 204/200 vazio — `apiFetch` trata corpo vazio sem `.json()`.
- `BanUserRequest` mantém `expiresIn?`; contrato tem também `expiresInValid?` (não usado pela UI).
