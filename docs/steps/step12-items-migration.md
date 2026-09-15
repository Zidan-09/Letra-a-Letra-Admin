# Migração Cosméticos → Itens

## Arquivos principais alterados

- `src/pages/items/lib/Item.ts` (antes `cosmetics/lib/Cosmetic.ts`): tipos fiéis ao contrato real (`CreateItemDefinitionRequest` sem `assetPath`, `UpdateItemDefinitionRequest{name?,available?,isNewAsset}`, `effect` obrigatório `magnitude`/`durationMinutes`); `createItem`/`updateItem` via `multipart/form-data` (parte `item` JSON + parte `asset` binária); `listItems`/`getUserItems` via `GET /user[/{id}]/items`.
- `src/pages/items/Items.tsx` (antes `Cosmetics.tsx`): título "Itens", colunas tipo/categoria/quantidade/status, filtros `kind`/`category` (query do contrato), toggle via `PUT {available, isNewAsset:false}`.
- `src/pages/items/components/CreatePopup/CreateItemPopup.tsx`: formulário reconstruído — `kind` (COSMETIC/CONSUMABLE), `category`, `applicability`, `stackable/maxStack`, `effect` XP_BOOST_PCT (só se consumível), upload de arquivo obrigatório para COSMETIC (regra do backend).
- `src/pages/items/components/EditPopup/EditItemPopup.tsx`: só `name/available` + upload opcional com `isNewAsset`.
- `src/pages/items/components/ItemInfo/ItemDetailsModal.tsx`: exibe `kind/category/contexts/quantity`.
- `src/router.tsx`: rota `/admin/cosmetics` → `/admin/items`.
- `src/components/Sidebar/Sidebar.tsx`: "Cosméticos" → "Itens".
- Consumidores: `RewardModal`, `RewardInput` (import `ItemRequests`), `Users.ts` (import de tipos).

## Arquivos renomeados/removidos

- `src/pages/cosmetics/` → `src/pages/items/` (via cópia + remoção; `git mv` negado por permissão).
- `lib/Cosmetic.ts` → `lib/Item.ts`; `Cosmetics.tsx` → `Items.tsx`; `Cosmetics.module.css` → `Items.module.css`.
- `CosmeticDetailsModal.*` → `ItemDetailsModal.*`; `CreateCosmeticPopup.*` → `CreateItemPopup.*`; `EditCosmeticPopup.*` → `EditItemPopup.*`.
- Classe `CosmeticRequests` → `ItemRequests`.
- CSS: `.cosmeticName` → `.itemName`, `.cosmeticId` → `.itemId`, `.infoCosmeticGrid` → `.infoItemGrid`, containers/badges de games/levels/offers → `item*`; texto "Cosméticos Equipados" → "Itens Equipados".

## Principais mudanças

- Contrato real apurado no backend (não só `api.json`): `POST/PUT /admin/items[/{id}]` consomem `multipart/form-data` com partes `item` + `asset` — a migração anterior (JSON + `assetPath` texto) estava errada e foi corrigida.
- Assets voltam a ser upload de arquivo (obrigatório para `kind=COSMETIC`); `consumable` derivado de `kind`; `effect` só para consumíveis (validações espelham `ItemDefinition.validate`).
- Listagem usa `GET /user/items` (não existe listagem de catálogo no contrato — limitação documentada).
- Sem `DELETE` de definição no contrato: remoção de catálogo = `available=false`.

## Testes/verificações

- `npx tsc -b` — passou.
- `npm run build` — passou.
- `npx eslint` nos arquivos — só erros do padrão pré-existente (`set-state-in-effect`, ternários, unused vars).
- Busca final por `[Cc]osmetic`: só ocorrências legítimas do contrato — `EquippedCosmetic`/`cosmeticsEquipped` (Games), `COSMETIC_*` (Audit), `ItemKind COSMETIC`/`PermissionKey COSMETIC`, filtros `kind: "COSMETIC"`.

## Pontos não implementados / limitações

- Sem listagem paginada de catálogo (`GET /admin/items` não existe); a tela lista via `GET /user/items` (itens do próprio admin).
- `availability` da listagem mantida em estado local (listagem retorna `UserItem` sem `available`).
- Rota antiga `/admin/cosmetics` removida sem redirect (sem padrão de redirect no projeto).
