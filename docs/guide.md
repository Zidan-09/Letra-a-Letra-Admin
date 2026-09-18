# Items & Inventory — Guia de Integração (Frontend)

Guia prático para cadastrar definições de itens (admin) e operar o inventário do jogador. Todo código de erro abaixo vai no campo `code` do envelope de erro.

## 0. Convenções

- Base: mesmos hosts das demais rotas. Autenticação via `Authorization: Bearer <token>`.
- Rotas `/admin/**` exigem admin com permissão `ITEMS` (+ ação indicada). Rotas `/user/**` usam o próprio jogador logado.
- Sucesso: `{ "success": true, "data": ... }`. Erro: `{ "success": false, "code": "...", "message": "..." }`.
- Revogar saldo/item e conceder recompensa retornam **204** com `data: null`.
- `itemId` é UUID da **definição** do item (catálogo). O inventário do jogador referencia esse id + `quantity`/`equipped`.

## 1. Modelo mental: 2 tipos, 1 entrypoint

`ItemKind`: `EQUIPPABLE` (cosmético, único, equipa) vs `CONSUMABLE` (gasta, empilha até 1000).

Ambos são criados no mesmo entrypoint `POST /admin/items`, mas com campos **mutuamente exclusivos**:

| Campo | EQUIPPABLE | CONSUMABLE |
|---|---|---|
| `name` (obrigatório, único) | sim | sim |
| `kind` (obrigatório) | `EQUIPPABLE` | `CONSUMABLE` |
| `category` / `context` | **obrigatórios** | **proibidos** (enviar = `INVALID_ITEM`) |
| `asset` (arquivo imagem) | **obrigatório** | **proibido** (enviar = `INVALID_ITEM`) |
| `effectKind` + efeito | **proibido** (enviar = `INVALID_ITEM`) | **obrigatório** |
| Resposta `assetPath` | `CATEGORY/nome.webp` | sempre `null` |
| Resposta `effect` | sempre `null` | objeto (ver §3) |
| `stackable` / `maxStack` | `false` / `null` | `true` / `1000` |

## 2. Categorias e contextos (só EQUIPPABLE)

`EquippableCategory`: `AVATAR`, `BANNER`, `FRAME`, `EMOTE`, `BOARD`, `CELL`.
`EquippableContext`: `PROFILE`, `MATCH`.

Matriz válida (fora disso = `INVALID_ITEM`):

| Category | Context permitido |
|---|---|
| `AVATAR`, `BANNER`, `FRAME` | `PROFILE` |
| `EMOTE`, `BOARD`, `CELL` | `MATCH` |

Na prática: `AVATAR/BANNER/FRAME` aparecem no perfil; `EMOTE/BOARD/CELL` são usados na partida.

## 3. Efeitos (só CONSUMABLE)

Campos: `effectKind` (`PERCENTAGE_TIMED` | `NICKNAME_CHANGE`), mais:

- `PERCENTAGE_TIMED` exige `effectType` + `magnitude >= 1` + `durationMinutes >= 1`.
- `NICKNAME_CHANGE` não usa `effectType`/`magnitude`/`durationMinutes`.
- `EffectType`: `XP_BOOST_PCT`, `RANKING_POINTS_BOOST_PCT`, `COIN_BOOST_PCT`, `RANKING_POINTS_SHIELD`, `NICKNAME_CHANGE_GRANT`.
- `NICKNAME_CHANGE_GRANT` **nunca** vai dentro de `PERCENTAGE_TIMED` (use `effectKind=NICKNAME_CHANGE`).

Resposta `effect`:

```json
{ "kind": "PERCENTAGE_TIMED", "type": "XP_BOOST_PCT", "magnitude": 50, "durationMinutes": 60 }
{ "kind": "NICKNAME_CHANGE" }
```

O que cada efeito faz ao ser **consumido** (`POST /user/items/{id}/consume`):

| effectType | Efeito ativo no jogador |
|---|---|
| `XP_BOOST_PCT` | bônus de XP por `durationMinutes` |
| `RANKING_POINTS_BOOST_PCT` | bônus de pontos de ranking por `durationMinutes` |
| `COIN_BOOST_PCT` | bônus de moedas por `durationMinutes` |
| `RANKING_POINTS_SHIELD` | proteção contra perda de pontos por N partidas (`durationMinutes` = nº de partidas, mín. 1) |
| `NICKNAME_CHANGE_GRANT` | **não** gera efeito ativo; o item é consumido pela rota de troca de nome (§8) |

## 4. Cadastro — `POST /admin/items` (ITEMS + CREATE)

**Sempre `multipart/form-data` com campos planos (nada de JSON aninhado).**

EQUIPPABLE (avatar de perfil):

```
name:     "Blue Avatar"
kind:     "EQUIPPABLE"
category: "AVATAR"
context:  "PROFILE"
asset:    <arquivo imagem>
```

CONSUMABLE (boost de XP 50% por 60 min):

```
name:            "XP Boost 50%"
kind:            "CONSUMABLE"
effectKind:      "PERCENTAGE_TIMED"
effectType:      "XP_BOOST_PCT"
magnitude:      "50"
durationMinutes:"60"
```

CONSUMABLE (troca de nome):

```
name:       "Nickname Change"
kind:       "CONSUMABLE"
effectKind: "NICKNAME_CHANGE"
```

Regras da imagem (`asset`): `contentType` deve começar com `image/`, tamanho ≤ **5 MB**, a API converte para WebP. Erros: `IMAGE_TOO_LARGE`, `INVALID_IMAGE_TYPE`, `IMAGE_CONVERSION_FAILED`. Nome duplicado: `ITEM_ALREADY_EXISTS`. Resposta 200 com `ItemResponse` (§5).

## 5. ItemResponse (leitura)

```json
{
  "itemId": "uuid",
  "name": "Blue Avatar",
  "kind": "EQUIPPABLE",
  "category": "AVATAR",
  "context": "PROFILE",
  "stackable": false,
  "maxStack": null,
  "consumable": false,
  "effect": null,
  "assetPath": "AVATAR/Blue Avatar.webp",
  "version": 1,
  "available": true
}
```

`category`/`context`/`assetPath` só preenchidos em `EQUIPPABLE`; `effect` só em `CONSUMABLE`.

## 6. Edição — `PUT /admin/items/{itemId}` (ITEMS + EDIT, multipart)

Parcial: omita o que não muda. Particularidades:

- `isNewAsset` (bool, default `false`): `true` exige `asset` novo (só EQUIPPABLE). `false` + mudança de `name` recopia o asset para o novo nome automaticamente.
- Nunca dá para trocar o `kind` (EQUIPPABLE ↔ CONSUMABLE) — a API rejeita com `INVALID_ITEM`.
- Em item EQUIPPABLE: enviar qualquer campo de efeito = `INVALID_ITEM`.
- Em item CONSUMABLE: enviar `category`, `context`, `asset` ou `isNewAsset=true` = `INVALID_ITEM`. Para trocar o efeito, reenvie o trio `effectKind`/`effectType`/`magnitude`/`durationMinutes`.
- `available` alterna visibilidade sem deletar. Todo update com sucesso incrementa `version`.

## 7. Leitura, remoção e disponibilidade (admin)

| Método | Rota | Permissão | Notas |
|---|---|---|---|
| `GET` | `/admin/items?kind=&category=&available=&page=&size=&sort=` | ITEMS + VIEW | `sort` permitido: `name,kind,category,available`. `size` máx. 50 |
| `GET` | `/admin/items/{itemId}` | ITEMS + VIEW | 400 `ITEM_NOT_FOUND` se inexistente |
| `DELETE` | `/admin/items/{itemId}` | ITEMS + DELETE | remove definição e asset; retorna o item deletado |
| `PATCH` | `/admin/items/{itemId}/enable` | ITEMS + EDIT | 400 `INVALID_ITEM_STATUS` se já ativo |
| `PATCH` | `/admin/items/{itemId}/disable` | ITEMS + EDIT | 400 `INVALID_ITEM_STATUS` se já inativo |

Itens indisponíveis (`available=false`) não podem ser concedidos nem consumidos.

## 8. Inventário do jogador (`/user`)

| Método | Rota | Corpo | Efeito |
|---|---|---|---|
| `GET` | `/user/items?kind=&category=&context=&equipped=` | — | lista posses; `UserItemResponse`: `itemId,name,kind,category,context,quantity,equipped,acquiredAt,expiresAt,assetPath` |
| `GET` | `/user/{userId}/items?...` | — | mesma lista, por jogador (visão admin/perfil) |
| `POST` | `/user/items/{itemId}/equip` | `{ "context": "PROFILE" }` | equipa cosmético; `context` deve ser o do item; desequipa outro da mesma `category` |
| `POST` | `/user/items/{itemId}/consume` | `{ "quantity": 1 }` | consome CONSUMABLE; aplica efeito ativo (§3) |
| `DELETE` | `/user/items/{itemId}` | — | remove a posse do próprio jogador (204) |

Erros comuns: `ITEM_NOT_OWNED` (não possui), `NON_CONSUMABLE_ITEM` (tentou consumir EQUIPPABLE), `NON_EQUIPABLE_ITEM` (tentou equipar CONSUMABLE), `INAPPLICABLE_CONTEXT` (contexto errado no equip), `INSUFFICIENT_QUANTITY`, `ITEM_NOT_AVAILABLE`.

`equip`/`consume` retornam `{ "movements": [...] }`, cada movimento com `itemId, change (ACQUIRED|REMOVED|EQUIPPED|UNEQUIPPED|CONSUMED|QUANTITY_CHANGED), equippedBefore, equippedAfter, quantityBefore, quantityAfter`. Use para animar UI de forma otimista-confiável.

## 9. Dar itens ao jogador (admin) e trocar de nome

- Conceder: `PATCH /user/{userId}/grant-reward` (requer USER + EDIT), corpo `{ "rewardType": "ITEM", "quantity": N, "rewardReference": "<itemId>" }`. EQUIPPABLE só aceita `quantity: 1` e posse única; CONSUMABLE soma até 1000. Retorna 204.
- Trocar nickname: `PATCH /user/nickname`, corpo `{ "nickname": "novo (3–16 chars)", "itemId": "<uuid do item NICKNAME_CHANGE>" }`. Exige possuir o item; consome 1 unidade. Erros: `NICKNAME_ALREADY_IN_USE`, `ITEM_NOT_OWNED`, `INVALID_ITEM` (item não é de troca de nome).

Fluxo feliz típico no frontend: admin cadastra item → concede via `grant-reward` → jogador vê em `GET /user/items` → equipa/consome → UI reflete `movements`.
