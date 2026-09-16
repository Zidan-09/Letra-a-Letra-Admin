# Items — guia de integração do frontend

Catálogo de definições de itens (`features/items`) + inventário do usuário (`features/inventory`).
Todas as respostas de sucesso seguem o envelope `{ "success": true, "data": ... }`.
Erros seguem `{ "success": false, "code": "...", "message": "..." }`.
Autenticação via `Authorization: Bearer <token>` em todas as rotas abaixo.

## 1. Domínio

- **ItemDefinition**: `itemId (UUID)`, `name` (único), `kind`, `category`, `context`,
  `stackable`, `maxStack`, `consumable`, `effect` (ou `null`), `assetPath`,
  `version` (incrementa a cada update), `available`.
- **ItemKind**: `COSMETIC` | `CONSUMABLE`.
- **ItemContext** (único por item): `PROFILE` (perfil/coleção do usuário) | `MATCH` (partida).
- **ItemCategory**:
  - Cosméticas: `AVATAR`, `BANNER`, `FRAME`, `EMOTE`, `BOARD_SKIN`, `CELL_SKIN`.
  - Consumíveis: `XP_BOOST`, `RANKING_POINTS_BOOST`, `COIN_BOOST`,
    `RANKING_POINTS_PROTECTION`, `CHANGE_NICKNAME`.
- **ItemEffect** (polimórfico, campo discriminador `kind` no JSON):
  - `XP_BOOST` → `{ "kind": "PERCENTAGE_TIMED", "type": "XP_BOOST_PCT", "magnitude": 50, "durationMinutes": 60 }`
  - `RANKING_POINTS_BOOST` → `type: RANKING_POINTS_BOOST_PCT` (mesmo formato)
  - `COIN_BOOST` → `type: COIN_BOOST_PCT` (mesmo formato)
  - `RANKING_POINTS_PROTECTION` → `type: RANKING_POINTS_SHIELD` (mesmo formato)
  - `CHANGE_NICKNAME` → `{ "kind": "NICKNAME_CHANGE" }` (sem `magnitude`/`duration`)
  - Cosméticos sempre têm `effect: null`.

## 2. Regras de negócio (o que o frontend precisa respeitar)

- Todo item tem exatamente **1 contexto** (`context` obrigatório na criação).
- **Consumível é sempre `PROFILE`** — nunca `MATCH`, nunca consumido durante a partida.
- Consumível é criado com `stackable: true, maxStack: 1000` derivados pelo backend
  (não enviar esses campos; são ignorados/inexistentes no request).
- `consumable` deve ser consistente com `kind` (`true` ⇔ `CONSUMABLE`).
- Efeito deve ser compatível com a categoria (ex.: `XP_BOOST` rejeita efeito de ranking);
  consumível sem efeito é rejeitado; cosmético com efeito é rejeitado.
- Cosmético exige imagem (`asset`) no cadastro e `stackable: false, maxStack: null`.
- Consumir (`consume`) sempre opera em `PROFILE` — o request leva só `{ "quantity": N }`.
- Equipar (`equip`) leva `{ "context": "PROFILE" | "MATCH" }`; só cosméticos equipam,
  e `PROFILE`×`MATCH` são independentes (slots separados por contexto).
- Revogar (`DELETE /user/items/{id}`) exige permissão de admin (`USER:EDIT`) e remove
  o item do inventário do chamador; usuário comum recebe `400`.
- Itens chegam ao usuário via concessão admin (`PATCH /user/{id}/grant-reward` com
  `rewardType: "ITEM"`), loja/ofertas ou recompensas — nunca por auto-atribuição.
- `consume` só dá baixa no inventário; **aplicar o bônus** (ex.: +XP por 30min) é
  responsabilidade de outro fluxo no `GameOver`/ranking (follow-up, fora deste escopo).

## 3. Rotas — catálogo (admin, `ITEMS:CREATE/VIEW/EDIT/DELETE`)

| Método | Rota | Corpo / params | Retorno |
|---|---|---|---|
| `POST` | `/admin/items` (`multipart/form-data`) | parte `item` (JSON, ver §4) + parte `asset` (imagem; obrigatória p/ cosmético) | `ItemDefinitionResponse` |
| `GET` | `/admin/items?kind=&category=&available=&page=&size=&sort=` | filtros opcionais + paginação Spring | página de `ItemDefinitionResponse` |
| `GET` | `/admin/items/{itemId}` | — | `ItemDefinitionResponse` |
| `PUT` | `/admin/items/{itemId}` (`multipart/form-data`) | parte `item`: `{ name?, available?, isNewAsset }` + `asset` opcional | `ItemDefinitionResponse` |
| `PATCH` | `/admin/items/{itemId}/availability` | `{ "available": true }` — ativa/desativa **sem** incrementar `version` | `ItemDefinitionResponse` |
| `DELETE` | `/admin/items/{itemId}` | — | `ItemDefinitionResponse` |

## 4. Criar item — exemplos de `multipart/form-data`

Parte `item` é JSON; parte `asset` é o arquivo de imagem.

Cosmético:

```json
{
  "name": "Avatar Azul",
  "kind": "COSMETIC",
  "category": "AVATAR",
  "context": "PROFILE",
  "consumable": false,
  "effect": null
}
```

Consumível (boost):

```json
{
  "name": "XP Boost 50%",
  "kind": "CONSUMABLE",
  "category": "XP_BOOST",
  "context": "PROFILE",
  "consumable": true,
  "effect": { "kind": "PERCENTAGE_TIMED", "type": "XP_BOOST_PCT", "magnitude": 50, "durationMinutes": 60 }
}
```

Consumível (troca de nickname):

```json
{
  "name": "Troca de nickname",
  "kind": "CONSUMABLE",
  "category": "CHANGE_NICKNAME",
  "context": "PROFILE",
  "consumable": true,
  "effect": { "kind": "NICKNAME_CHANGE" }
}
```

`ItemDefinitionResponse`:

```json
{
  "success": true,
  "data": {
    "itemId": "uuid",
    "name": "XP Boost 50%",
    "kind": "CONSUMABLE",
    "category": "XP_BOOST",
    "context": "PROFILE",
    "stackable": true,
    "maxStack": 1000,
    "consumable": true,
    "effect": { "kind": "PERCENTAGE_TIMED", "type": "XP_BOOST_PCT", "magnitude": 50, "durationMinutes": 60 },
    "assetPath": null,
    "version": 1,
    "available": true
  }
}
```

> Para apenas ativar/desativar um item, prefira `PATCH /admin/items/{itemId}/availability`
> com `{ "available": false }`. Diferente do `PUT`, ele **não incrementa `version`**
> (a rota de edição versiona a cada chamada). `available` é obrigatório.

## 5. Rotas — inventário (usuário autenticado)

| Método | Rota | Corpo / params | Retorno |
|---|---|---|---|
| `GET` | `/user/items?kind=&category=&context=&equipped=` | filtros opcionais (`context`: `PROFILE`/`MATCH`; valor inválido → `INVALID_ITEM`) | `{ items: [UserItemResponse] }` |
| `GET` | `/user/{userId}/items?...` | mesmos filtros (visão admin/terceiros) | `{ items: [UserItemResponse] }` |
| `POST` | `/user/items/{itemId}/equip` | `{ "context": "PROFILE" }` | `{ movements: [...] }` |
| `POST` | `/user/items/{itemId}/consume` | `{ "quantity": 2 }` (≥1; sem `context`) | `{ movements: [...] }` |
| `DELETE` | `/user/items/{itemId}` | — (requer `USER:EDIT`) | `204 No Content` |

`UserItemResponse`:

```json
{
  "itemId": "uuid",
  "name": "Avatar Azul",
  "kind": "COSMETIC",
  "category": "AVATAR",
  "context": "PROFILE",
  "quantity": 1,
  "equipped": true,
  "acquiredAt": "2026-09-16T12:00:00",
  "expiresAt": null,
  "assetPath": "AVATAR/Avatar Azul.webp"
}
```

Cada entrada de `movements`:

```json
{ "itemId": "uuid", "change": "EQUIPPED", "equippedBefore": false, "equippedAfter": true, "quantityBefore": 1, "quantityAfter": 1 }
```

`change` ∈ `ACQUIRED | REMOVED | EQUIPPED | UNEQUIPPED | CONSUMED | QUANTITY_CHANGED`.
Consumo total gera dois movimentos (`CONSUMED` + `REMOVED`); parcial gera
(`CONSUMED` + `QUANTITY_CHANGED`). Equipar um segundo item da mesma categoria
no mesmo contexto gera `UNEQUIPPED` do anterior + `EQUIPPED` do novo.

## 6. Erros relevantes (`code`)

- Catálogo: `INVALID_ITEM` (payload/regra violada), `ITEM_ALREADY_EXISTS` (nome duplicado),
  `ITEM_NOT_FOUND`, `IMAGE_TOO_LARGE` (limite 5 MB), `INVALID_IMAGE_TYPE`, `IMAGE_CONVERSION_FAILED`.
- Inventário: `ITEM_NOT_OWNED`, `DUPLICATE_UNIQUE_ITEM`, `ITEM_NOT_AVAILABLE`,
  `MAX_STACK_EXCEEDED`, `INVALID_QUANTITY`, `NON_CONSUMABLE_ITEM`,
  `NON_EQUIPABLE_ITEM`, `INSUFFICIENT_QUANTITY`, `INAPPLICABLE_CONTEXT`
  (ex.: consumir com item `MATCH`, equipar cosmético `PROFILE` em `MATCH`).

## 7. Fluxo típico no frontend

1. Admin cadastra a definição (`POST /admin/items`) e confere `itemId`.
2. Admin concede ao usuário (`PATCH /user/{id}/grant-reward`, `rewardType: ITEM`).
3. App lista `GET /user/items` (filtrar `?equipped=true&context=PROFILE` para vitrine).
4. Cosmético: `POST /user/items/{id}/equip` com o contexto do slot; exibir `assetPath`.
5. Consumível: `POST /user/items/{id}/consume` com `quantity`; atualizar saldo local
   a partir de `movements` (não assumir que o bônus já foi aplicado).
