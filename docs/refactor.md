# Plano de Refatoração do Frontend

## 1. Objetivo

Adaptar o frontend administrativo (`Letra-a-Letra-Admin`) aos novos contratos da API documentados em `docs/api.json` (OpenAPI 3.1, 72 paths, 151 schemas), com esclarecimentos pontuais da implementação real em `Letra-a-Letra-API/src` (controllers, DTOs, mappers, `SecurityConfig`, `GlobalExceptionHandler`, `AdminWebSocketHandler`).

Nada foi implementado aqui. Este documento é o guia executivo para um agente posterior executar a refatoração sem reinvestigar a API.

Convenções usadas abaixo:

- `BREAKING` — frontend atual quebra (404, 400, parse errado) com o novo contrato.
- `REQUIRED` — precisa mudar para suportar o novo contrato corretamente.
- `OPTIONAL` — melhoria não bloqueante.
- `UNCERTAIN` — dúvida residual, com motivo e onde investigar.
- Fonte indicada como `[api.json]` (contrato) ou `[impl]` (código da API).

Base URL: `src/lib/config.ts` — `API_URL = VITE_API_URL`, `WS_URL = VITE_WS_URL`. Todo HTTP é `fetch` nativo em `src/pages/*/lib/*.ts`. Sem axios, sem testes/mocks no frontend.

## 2. Projetos analisados

| Artefato | Local |
| --- | --- |
| Frontend | `Letra-a-Letra-Admin/src` (80 arquivos `.ts/.tsx`, 12 módulos `lib`) |
| Contrato oficial | `Letra-a-Letra-Admin/docs/api.json` (OpenAPI 3.1, `http://localhost:8080`, 72 paths) |
| Implementação API | `Letra-a-Letra-API/src/main/java/com/letraaletra/api` (controllers, DTOs, mappers, security, WS) |
| Docs consultadas | `api.json` integralmente (todos os paths + schemas citados); `SecurityConfig`, `JwtAuthenticationFilter`, `GlobalExceptionHandler`, `ErrorResponse`, `SuccessResponse`, `PageResponse`, `AdminResponseMapper`, `FindUserByUsernameController`, `GetUserItemsByIdController`, `RevokeItemController`, `AdminWebSocketHandler`, `AdminPrincipalResolver` |

Padrões globais novos ([api.json] + [impl]):

- Sucesso: `SuccessResponse<T> = { success: true, data: T }` — **sem `code/message`** (`SuccessResponse.java`). `SuccessResponseVoid = { success, data: {} }`.
- Erro: `ErrorResponse = { success: false, code, message }` — **sem `data`** (`ErrorResponse.java`, `GlobalExceptionHandler.java`: `DomainException→400`, validação→`400 INVALID_REQUEST`, `409 CONFLICT`, `500 INTERNAL_ERROR`).
- **401/403 do Spring Security são texto puro, fora do envelope** ([impl] `SecurityConfig`, `JwtAuthenticationFilter`). `fetch().json()` quebra nesses casos.
- Paginação REST: Spring `Pageable` (`?page&size&sort`) + `PageResponse<T> = { content, page, size, totalElements, totalPages, first, last }`. Auditoria usa `?page&size&direction=ASC|DESC` manual ([impl] `Pageables`, `GetAuditEventsController`).
- Auth: `Authorization: Bearer <JWT>` em tudo, exceto `permitAll`: `POST /user`, `/user/auth/**`, `/admin/auth/**`, `/ws/**`, `/actuator/health`, `/admin/activate` ([impl] `SecurityConfig`). Sem refresh token.
- Rate-limit 30 req/min em mutações sensíveis → `429 { success:false, code:RATE_LIMIT_EXCEEDED }` ([impl] `RateLimitFilter`).

## 3. Resumo das mudanças

| Área | Situação atual | Novo contrato | Impacto |
| --- | --- | --- | --- |
| Envelope HTTP | `HttpResponse<T> = { success, code, message, data }` (`lib/config.ts`) | Sucesso `{ success, data }`; erro `{ success, code, message }` | `BREAKING` — tipagem e leitura de `message` no sucesso |
| Erros 401/403 | `await res.json()` sempre | Texto puro fora do envelope | `BREAKING` — `json()` lança |
| Auth reset admin | `verify-reset-token { token }`, `reset-password { token, newPassword }` | Ambos exigem `{ email, token[, newPassword] }` | `BREAKING` |
| Permissões | `Login.ts` `Key` com 8 valores (sem `AUDIT,TICKET`) | `PermissionResponse.key` com 10 valores (+`AUDIT,TICKET`) | `REQUIRED` |
| Cosméticos/Inventário | CRUD `/cosmetic*` com `FormData`, `disable/enable`, `search`, tipo `Cosmetic{id,name,type,assetPath,version,available}` | Sem `/cosmetic*`. Novo: `POST /admin/items` (JSON), `PUT /admin/items/{itemId} {name?,assetPath?,available?}`, `GET /user[/{userId}]/items`, `POST /user/items/{itemId}/equip|consume`, `DELETE /user/items/{itemId}`; `ItemDefinitionResponse{itemId,name,kind,category,contexts,stackable,maxStack,consumable,effect,assetPath,version,available}` | `BREAKING` — módulo inteiro |
| Rewards | `RewardType = COIN\|GEMS\|COSMETIC`; `Reward = {type,amount,cosmetic:Cosmetic}`; `rewardReference=""` p/ moeda | `rewardType = COIN\|GEMS\|ITEM`; `RewardResponse{type,amount}` (sem objeto aninhado); `rewardReference: uuid` obrigatório em level/offer | `BREAKING` — levels, offers, grant |
| Levels | `POST/PUT /level` retorna `Level` puro; request `level + rewards` | `POST/PUT` retornam `{ level: LevelResponse }`; `Create/UpdateLevelRewardRequest` exige `rewardType,rewardReference(uuid),quantity` | `BREAKING` |
| Offers | `POST /offer` retorna `Offer` puro; `expiresAt: Date` | `RegisterOfferResponse{offer}`; `expiresAt: date-time string`; rewards sem cosmético aninhado | `BREAKING` (create) / `REQUIRED` (datas) |
| Users busca | `GET /user/username/{u}` → `{ user: User }` único | Retorna `PageResponse<UserResponse>` **paginado + exige `pageable`** ([impl] `FindUserByUsernameController`) | `BREAKING` |
| Users inventário | `GET /user/{id}/inventory?page&size` → paginado `{cosmeticId,name,type,equipped}` | `GET /user/{userId}/items` (sem `inventory`, sem paginação → `{ items: UserItemResponse[] }`, filtros `kind,category,context,equipped`) | `BREAKING` |
| Users revoke cosmético | `DELETE /user/{userId}/inventory/{cosmeticId}` | `DELETE /user/items/{itemId}` (sem `userId`, retorna `204 No Content` — [impl] `RevokeItemController`) | `BREAKING` |
| Users modelo | `banInfo{type,reason,expiresAt}`, `equipped: ItemInventory[]`, `wallet{coins,gems}` | `+ banInfo.banned: bool`; `equipped: InventoryItemResponse[]`; wallet igual (`coins,gems`) | `REQUIRED` / `BREAKING` (inventário) |
| Transactions | `GET /transaction/user/{userId}` → `{ transaction }` único; `TransactionReason` sem `ADMIN_REVOKE`; `transactionDate: Date` | Paginado (`+ pageable`, `PageResponse`); reason **+`ADMIN_REVOKE`**; `transactionDate: date-time string` | `BREAKING` (byUserId) / `REQUIRED` |
| Tickets lista | `GET /admin/ticket?status&category&userId&username&page&size&direction` | Só `status,category,userId,pageable` — **sem `username`, sem `direction`** | `BREAKING` (filtros ignorados) |
| Games | `Participant.cosmeticsEquipped: {cosmeticId,name,type,equipped,unlockedAt}` | `EquippedCosmetic{itemId,name,category,equipped,assetPath}` (sem `unlockedAt`) | `BREAKING` (parcial) |
| Logs | `res.json()` p/ listas, `res.text()` p/ arquivos, só header `Authorization` | [api.json] listas = `string[]` puro, arquivos = `string binary` — formato atual **compatível** | `OPTIONAL`/`UNCERTAIN` (envelope exato) |
| Audit | `AuditEventType` 15 valores (só `COSMETIC_*`) | [api.json]+[impl] adicionam `ITEM_ACQUIRED/REMOVED/EQUIPPED/UNEQUIPPED/CONSUMED/QUANTITY_CHANGED` | `REQUIRED` |
| WebSocket | `WS ?token=` + eventos `METRICS{application,system}`, `LOG{log}` | [impl] `AdminWebSocketHandler` só registra sessão p/ push; payload exato não está no `api.json` | `UNCERTAIN` — validar payload |
| Testes/mocks | Nenhum `*.test.*`, `__mocks__`, vitest/jest em `src` | — | Nenhum teste a migrar; criar cobertura nova (`OPTIONAL`) |

## 4. Problemas encontrados

### 4.1 Infra / envelope / erros

- **P1 — `HttpResponse<T>` diverge do envelope real** — `BREAKING` — `src/lib/config.ts:4-9` (`HttpResponse`). Atual `{ success, code, message, data }`. Novo sucesso não tem `code/message` ([api.json] `SuccessResponse*`, [impl] `SuccessResponse.java`). Erro não tem `data` ([impl] `ErrorResponse.java`). **Mudar para** `SuccessResponse<T>={success:boolean;data:T}` + `ErrorResponse={success:false;code:string;message:string}` + type-guard. Afeta todos os `lib/*.ts` que leem `response.message` no caminho de sucesso.
- **P2 — `res.json()` incondicional quebra em 401/403 texto puro** — `BREAKING` — todos os `lib/*.ts` + `RealtimeProvider`. [impl] `SecurityConfig/JwtAuthenticationFilter`: falhas de auth retornam texto, não JSON. **Exigir** helper `request()` com `text→try json`, tratamento `401→logout+redirect /`, `403→notify PERMISSION_DENIED`, `429→Retry-After`.
- **P3 — Mensagens de erro genéricas perdem `code`** — `REQUIRED` — `Admins.ts`, `Levels.ts`, `Offers.ts`, `Transaction.ts`, `Audit.ts` fazem `throw new Error()` sem mensagem. Novo `ErrorResponse.code` (ex. `LEVEL_ALREADY_EXISTS`, `OFFER_ALREADY_PURCHASED`, `PERMISSION_DENIED`) deve ser exibido/mapeado.

### 4.2 Autenticação admin

- **P4 — Reset de senha sem `email`** — `BREAKING` — `src/pages/reset/lib/ResetPassword.ts:9-32` (`validateToken`, `reset`). Atual `{ token }` / `{ token, newPassword }`. Novo ([api.json]) `VerifyResetTokenRequest{email*,token*}`, `ResetAdminPasswordRequest{email*,newPassword(8-16)*,token*}`. **Exigir** campo e-mail na página `src/pages/reset/ResetPassword.tsx` + validação tamanho senha.
- **P5 — `Key` de permissão incompleto no login** — `REQUIRED` — `src/pages/login/lib/Login.ts:8-16` (8 chaves, sem `AUDIT,TICKET`). Novo ([api.json] `PermissionResponse`) tem 10. Sincronizar com `src/pages/admins/lib/Admins.ts:4-14` (correto, 10). Afeta `ProfileProvider`, `AuthProvider`, gating de rotas.

### 4.3 Admins

- **P8 — `username` vs `name`** — `REQUIRED` — API persiste `name`, serializa como `username` ([impl] `AdminResponseMapper: admin.getName()`). `registerAdmin { name, email }` ([api.json] `RegisterAdminRequest`) e `updateAdmin` mapeia `username→name` — já correto; manter mapeamento e documentar.
- **P9 — Respostas `POST/DELETE /admin` ignoradas** — `OPTIONAL` — `registerAdmin→void`, `removeAdmin→FindBody`. Novas `RegisterAdminResponse{admin}`, `DeleteAdminResponse{admin}` ([api.json]). Aproveitar retorno p/ atualizar lista sem refetch.

### 4.4 Cosméticos → Inventário genérico (maior ruptura)

- **P10 — Endpoints `/cosmetic*` não existem** — `BREAKING` — `src/pages/cosmetics/lib/Cosmetic.ts:36-178` (`createCosmetic POST /cosmetic`, `getCosmetics`, `disable/enable`, `editCosmetic PUT`, `deleteCosmetic`, `search`). Nenhum consta em [api.json]. **Reescrever** para: `POST /admin/items`, `PUT /admin/items/{itemId}`, listagem via `GET /user/items` ou `GET /user/{userId}/items` (admin), `equip/consume` se necessário. Sem `DELETE /admin/items/{id}` no contrato — remoção de definição **sem equivalente** (`UNCERTAIN`, ver P14).
- **P11 — `FormData`/upload removido** — `BREAKING` — `createCosmetic`/`editCosmetic` enviam `FormData{name,cosmeticType,asset}` só com `Authorization`. Novo `CreateItemDefinitionRequest` ([api.json]) é **JSON**: `{ name*, kind*, category*, applicability?, stackable?, maxStack?, consumable?, effect?, assetPath? }`. Upload de arquivo sai; `assetPath` vira string (URL R2 existente em `EditCosmeticPopup.tsx` pode ser reutilizada como campo texto). Headers passam a `Content-Type: application/json`.
- **P12 — Modelo `Cosmetic` obsoleto** — `BREAKING` — `Cosmetic{id,name,type:AVATAR|BANNER|FRAME|EMOTE,assetPath,version,available}`. Novo `ItemDefinitionResponse{itemId,name,kind:COSMETIC|CONSUMABLE,category:AVATAR|BANNER|FRAME|EMOTE|BOARD_SKIN|CELL_SKIN|XP_BOOST,contexts:PROFILE|MATCH[],stackable,maxStack,consumable,effect:{type:XP_BOOST_PCT},assetPath,version,available}` ([api.json]). Renomear `id→itemId`, `type→kind+category`, adicionar 6 campos. `CosmeticTypes` expandir + novo `ItemKind`.
- **P13 — `PUT` de edição só aceita 3 campos** — `BREAKING` — `UpdateItemDefinitionRequest{name?,assetPath?,available?}` ([api.json]). `EditCosmeticPopup.tsx` edita `type/cosmeticType` — não mais editável. `enable/disable` viram `PUT { available: true|false }`.
- **P14 — Sem `DELETE` de definição nem `search`** — `BREAKING` — `deleteCosmetic`, `search(search,page,size)` (`Cosmetic.ts:134-178`, `RewardInput.tsx`, `RewardModal.tsx`). [api.json] só tem `DELETE /user/items/{itemId}` (revogar do usuário). **Marcar `UNCERTAIN`**: confirmar com backend se remoção de catálogo será descontinuar (`available=false`) ou novo endpoint; busca de recompensas passa a seleção por lista `GET /user/items` + filtro cliente ou novo endpoint futuro.
- **P15 — Permissão da página usa chave errada** — `REQUIRED` — `src/pages/cosmetics/Cosmetics.tsx` checa `key==="ADMIN"` em vez de `COSMETIC`. Novo `PermissionKey` ([impl]) inclui `COSMETIC`. Corrigir para `COSMETIC:VIEW/CREATE/EDIT/TOGGLE/DELETE`.

### 4.5 Levels

- **P16 — `rewardType: COSMETIC` → `ITEM`** — `BREAKING` — `src/lib/shared.ts:11` (`RewardType`), `src/lib/Rewards.ts` (`CreateReward`, `Reward`, `convertReward`). Novo ([api.json]) `CreateLevelRewardRequest{rewardType:COIN|GEMS|ITEM*,rewardReference:uuid*,quantity*}`. Renomear em toda a base + `RewardEditor/*`, `Offers.ts`, `Users.ts` (`grantReward`).
- **P17 — `rewardReference=""` inválido p/ moeda** — `BREAKING` — `Rewards.ts:28-33` retorna `""` quando `COIN/GEMS`. Novo exige `rewardReference: uuid minLength 1` **mesmo p/ moeda** ([api.json]). [impl] investigar `CreateLevelUseCase`/procedures: confirmar se moeda usa UUID dummy/definição ou se contrato relaxa. `UNCERTAIN` até confirmar; preparar UI p/ exigir referência sempre.
- **P18 — Resposta sem cosmético aninhado** — `BREAKING` — `Levels.ts:5-14` (`LevelReward{reward:Reward{cosmetic:Cosmetic}}`). Novo `LevelRewardResponse{reward:RewardResponse{type,amount}}` ([api.json]). `LevelDetailsModal`, `EditLevel` (`convertReward`) e `RewardCard` devem ler `type+amount+definitionId?` em vez de `reward.cosmetic`.
- **P19 — `POST/PUT /level` com wrapper `{ level }`** — `BREAKING` — `Levels.ts:80-120` espera `HttpResponse<Level>` puro. Novo ([api.json]) `CreateLevelResponse{level}`, `UpdateLevelResponse{level}`. Desembrulhar `response.data.level`. `GET /level/{id}`, `/value/{value}` já usam `FindBody{level}` — compatíveis (confirmar `FindLevelResponse{level}`).
- **P20 — Campo `level` vs `value`** — `REQUIRED` — request usa `level:number`, response usa `value:number` (ambos [api.json]). Manter mapeamento atual (`CreateRequest.level` → resposta `Level.value`), mas renomear tipos p/ clareza.

### 4.6 Offers

- **P21 — Mesmo `COSMETIC→ITEM` + `rewardReference uuid`** — `BREAKING` — `src/pages/offers/lib/Offers.ts:12-16` (`CreateOfferReward`). Novo `RegisterOfferRewardRequest{rewardType:COIN|GEMS|ITEM*,rewardReference:uuid,quantity}` ([api.json]). Igual a P16/P17.
- **P22 — `POST /offer` com wrapper `{ offer }`** — `BREAKING` — `Offers.ts:81-100` espera `HttpResponse<Offer>` puro. Novo `RegisterOfferResponse{offer:OfferResponse}` ([api.json]). `enable/disable/delete/find` já esperam `FindBody{offer}` — compatíveis com `Enable/Disable/Delete/FindOfferResponse{offer}`.
- **P23 — `expiresAt: Date` vs `date-time string`** — `REQUIRED` — `Offers.ts:18-28` tipa `expiresAt: Date`. API retorna string ([api.json] `OfferResponse`). Converter na borda (`new Date(str)`) + `getRemainingTime.ts`, `OfferDetailsModal`. Mesmo padrão em transactions/audit/tickets.
- **P24 — Rewards sem objeto aninhado** — `BREAKING` — `OfferReward{reward:Reward}` com `cosmetic`. Novo `OfferRewardResponse{reward:RewardResponse{type,amount}}` ([api.json]). Atualizar cards/detalhes.

### 4.7 Users

- **P25 — `GET /user/username/{u}` agora paginado** — `BREAKING` — `Users.ts:88-104` espera `{ user: User }`. Novo ([api.json]+[impl] `FindUserByUsernameController`) `PageResponse<UserResponse>` + `pageable` obrigatório. `Users.tsx` (busca) deve passar `?page&size` e ler `content[0]` ou lista.
- **P26 — Inventário: path, paginação e modelo** — `BREAKING` — `Users.ts:106-122` (`GET /user/{id}/inventory?page&size` → `GetBody<ItemInventory{cosmeticId,name,type,equipped}>`). Novo ([api.json]+[impl] `GetUserItemsByIdController`) `GET /user/{userId}/items` (+ filtros opcionais `kind,category,context,equipped`), retorna `{ items: UserItemResponse[] }` **sem paginação**. `UserDetailsInfo.tsx` (tabs inventário) reescrita: novo tipo `UserItemResponse{itemId,name,kind,category,contexts[],quantity,equipped,acquiredAt,expiresAt,assetPath}`.
- **P27 — Revogar cosmético muda path e status** — `BREAKING` — `Users.ts:177-192` (`DELETE /user/{userId}/inventory/{cosmeticId}`, espera JSON). Novo ([api.json]+[impl] `RevokeItemController`) `DELETE /user/items/{itemId}` (sem `userId`), responde `204 No Content` (corpo vazio). Não chamar `.json()` quando `204`.
- **P28 — `grantReward` com `COSMETIC`** — `BREAKING` — `Users.ts:159-175` envia `CreateReward`. Novo `GrantUserRewardRequest{rewardType:COIN|GEMS|ITEM,quantity,rewardReference:uuid}` ([api.json]). Mesmo P16.
- **P29 — `banInfo.banned` ausente** — `REQUIRED` — `Users.ts:17-21` (`{type,reason,expiresAt}`). Novo `BanInfoResponse{banned*,type,reason,expiresAt}` ([api.json]). UI de moderação deve usar `banned` em vez de inferir por `type!=null`.
- **P30 — `equipped` e `Wallet`** — `REQUIRED` — `equipped: ItemInventory[]` → `InventoryItemResponse{itemId,name,kind,category,context(s),quantity,equipped,assetPath}` ([api.json]). `wallet{coins,gems}` — compatível ([api.json] `WalletResponse`). `COSMETIC_TYPES` em `Users.ts:6-11` duplicado de `CosmeticTypes` — unificar no novo `ItemCategory`.

### 4.8 Transactions

- **P31 — `GET /transaction/user/{userId}` agora paginado** — `BREAKING` — `Transaction.ts:73-89` espera `{ transaction }` único sem query. Novo ([api.json]) exige `pageable` e retorna `PageResponse`. Método provavelmente não usado por página atual (verificar `Transactions.tsx`) — ou corrigir para paginado ou remover se morto.
- **P32 — `TransactionReason` sem `ADMIN_REVOKE`** — `REQUIRED` — `Transaction.ts:8-14`. Novo ([api.json]) inclui `ADMIN_REVOKE`. Adicionar + label.
- **P33 — `transactionDate: Date`** — `REQUIRED` — `Transaction.ts:29` tipa `Date`. API retorna `date-time string`. Converter na borda (`TransactionDetailsModal`).

### 4.9 Tickets

- **P34 — Filtros `username` e `direction` inexistentes** — `BREAKING` — `Tickets.ts:45-65` (`getTickets` envia `username`, `direction`, `page`, `size`). Novo ([api.json] `GET /admin/ticket`) aceita só `status,category,userId,pageable`. `username` deve usar `GET /admin/ticket/user/username/{username}?page&size` (já existe `getTicketsByUserUsername`); `direction`/`sort` via `sort=` do `Pageable` ou remover. `Tickets.tsx` (filtros + `size=8/20`) precisa separar os dois fluxos.
- **P35 — Modelo compatível** — `OK` — `Ticket{...}` confere com `TicketResponse` ([api.json]). `ResolveTicketRequest{resolutionNote? max1000}` compatível com envio atual (tornar opcional é `OPTIONAL`).

### 4.10 Games

- **P36 — `InventoryItem` do participante divergente** — `BREAKING` (parcial) — `Games.ts:9-15` (`{cosmeticId,name,type,equipped,unlockedAt}`). Novo `EquippedCosmetic{itemId,name,category,equipped,assetPath}` ([api.json]). `GameDetailsModal.tsx` deve trocar `cosmeticId→itemId`, `type→category`, remover `unlockedAt`, exibir `assetPath`. `Game{gameId,gameName,type,status,participants,positions,matches}` e enums `CUSTOM|MATCHMAKING|RANKING`, `WAITING|RUNNING|CLOSED|CANCELED`, `PLAYER|SPECTATOR` — compatíveis.
- **P37 — `GET /game`, `/game/active` OK** — `OK` ([api.json] ambos com `pageable`).

### 4.11 Audit

- **P38 — `AuditEventType` sem `ITEM_*`** — `REQUIRED` — `Audit.ts:3-18` (15 valores). Novo inclui `ITEM_ACQUIRED,ITEM_REMOVED,ITEM_EQUIPPED,ITEM_UNEQUIPPED,ITEM_CONSUMED,ITEM_QUANTITY_CHANGED` ([api.json] + [impl] `AuditEventType`). Adicionar 6 valores + labels (`AUDIT_EVENT_TYPE_OPTIONS`, `eventTypeLabels`).
- **P39 — Query `direction` + filtros OK** — `OK` — `getEvents/getEventsByUser/getEventsByResource` conferem com [api.json] (`/admin/audit`, `/user/{userId}`, `/resource/{type}/{id}`). Manter `page,size,direction` no geral; `from/to` ISO já correto.

### 4.12 Logs

- **P40 — Formato lista vs binário** — `OPTIONAL`/`UNCERTAIN` — `Logs.ts` (listas `res.json()→string[]`, arquivos `res.text()`). [api.json] mostra exatamente isso (`string[]` e `binary`). Nenhuma mudança obrigatória. **Confirmar** ([impl] `FindGameLogsController`) se há wrapper `SuccessResponse` em produção (se houver, trocar para `.data`); e `Content-Disposition: attachment` nos downloads (atual `Blob` download em `Logs.tsx` continua válido).

### 4.13 WebSocket / Realtime

- **P41 — Payload `METRICS`/`LOG` fora do `api.json`** — `UNCERTAIN` — `RealtimeProvider.tsx:30-48` (`WS_URL?token=`, `data.event METRICS→{application,system}`, `LOG→{log}`), `RealtimeContext.tsx` (`ApplicationMetrics{users,usersOnline,games}`, `SystemMetrics{uptime,cpu,memory,storage,health}`), `Dashboard.tsx` (consome tudo). [impl] `AdminWebSocketHandler` + `AdminBroadcastService` confirmam canal admin push via `?token=` (query, não header — correto), mas nomes/campos exatos (`METRICS`, `LOG`, `application`, `system`) precisam validação contra `AdminBroadcastService`/`GetSystemStatusService`/`MeterChecker`. Também confirmar path do `WS_URL` (ex. `/ws/admin`) em `application.yml` + `.env.development/production`.
- **P42 — Sem reconexão/backoff** — `OPTIONAL` — `useWebSocket.ts` fecha e recria por `url`, sem retry. Não bloqueante; sugerir backoff + limite de `logs[]` (vazamento de memória no `Dashboard`).

### 4.14 Tipos compartilhados / páginas

- **P43 — `GetBody<T>` vs `PageResponse`** — `REQUIRED` (renomear) — `lib/shared.ts:1-9` tem os mesmos 7 campos de `PageResponse` ([api.json]). Forma compatível; renomear para `PageResponse<T>` e alinhar ordem/uso em `Table.tsx` (props `page,totalPages,nextPage,prevPage`).
- **P44 — Datas como `Date`** — `REQUIRED` — `Offer.expiresAt`, `Transaction.transactionDate` tipados `Date`, mas JSON trafega string. Padronizar: tipos API como `string`, conversão p/ `Date` só na UI (`getRemainingTime`, formatters).
- **P45 — `normalizeCoinType`, `bytesFormatter`, `decodeToken`** — `OK` — `CoinType SOFT|HARD|REAL` confere ([api.json]); JWT `{id,role}` + checagem `ADMIN` confere ([impl] `JsonWebTokenService`, `Roles`). Manter.
- **P46 — Gating por permissão** — `REQUIRED` — revisar `Admins.tsx`, `Cosmetics.tsx`, `Levels.tsx`, `Offers.tsx` (permissões `CREATE/EDIT/DELETE/TOGGLE` por chave). Corrigir `Cosmetics.tsx` (`ADMIN`→`COSMETIC`).

## 5. Alterações por feature

### Autenticação (`pages/login`, `pages/activate`, `pages/reset`, `contexts/auth`, `contexts/profile`)

- `Login.ts`: trocar `HttpResponse` por `SuccessResponse`; completar `Key` com `AUDIT,TICKET`.
- `ResetPassword.ts` + `ResetPassword.tsx`: adicionar campo `email` nos dois calls (P4).
- `Activate.ts`: manter `PATCH /admin/activate?token=` + `{ password }`; tipar resposta `SuccessResponseVoid`.
- `AuthProvider/ProfileProvider`: sem mudança de fluxo (localStorage `token/id/profile`, `Bearer`, sem refresh).

### Usuários (`pages/users`)

- `Users.ts`: reescrever `findUserByUsername` (paginado), `getUserInventory` (`/{userId}/items`, `{ items }`), `revokeUserCosmetic` (`DELETE /user/items/{itemId}`, 204), `grantReward` (`ITEM`), tipos `BanInfo(+banned)`, `InventoryItemResponse`, `Wallet` mantido.
- `Users.tsx` + `UserDetailsInfo.tsx`: adaptar busca (lista), tabs inventário/moderação/grant/wallet aos novos tipos.

### Inventário/Cosméticos (`pages/cosmetics`, `components/RewardEditor`)

- Reescrever `Cosmetic.ts` inteiro para `/admin/items` + `/user[/{id}]/items` (JSON, sem `FormData`); `CreateCosmeticPopup`, `EditCosmeticPopup` (campo `assetPath` texto + selects `kind/category/contexts/stackable/effect`), `Cosmetics.tsx` (colunas `itemId/kind/category/contexts/quantity/available`, permissão `COSMETIC`), `CosmeticDetailsModal` (sem R2 hardcoded como fonte de verdade — passa a só exibir `assetPath`).
- `RewardInput.tsx`, `RewardModal.tsx`, `RewardEditor.tsx`: trocar busca `/cosmetic/search` por listagem `/user/items` (ou catálogo admin) + `rewardType ITEM`.

### Jogos (`pages/games`)

- `Games.ts`: trocar `InventoryItem` por `EquippedCosmetic`; `GameDetailsModal.tsx` ajusta campos. Endpoints mantidos.

### Ofertas (`pages/offers`)

- `Offers.ts`: `CreateOfferReward ITEM + uuid`, `createOffer` desembrulha `{ offer }`, `expiresAt string→Date` na UI. `CreateOfferPopup.tsx`, `Offers.tsx`, `OfferDetailsModal.tsx` acompanham.

### Transações (`pages/transactions`)

- `Transaction.ts`: `findTransactionByUserId` paginado (ou remover se morto), `+ADMIN_REVOKE`, `transactionDate string`. `Transactions.tsx`, `TransactionDetailsModal.tsx` acompanham.

### Logs (`pages/logs`)

- `Logs.ts`: sem mudança obrigatória; validar envelope binário (P40). `Logs.tsx` mantido.

### Auditoria (`pages/audit`) e Tickets (`pages/tickets`)

- `Audit.ts`: +6 `ITEM_*` + labels. `Audit.tsx`, `AuditDetailsModal.tsx` herdam.
- `Tickets.ts`: remover `username/direction` do `getTickets`, usar `getTicketsByUserUsername` p/ busca por nome; `Tickets.tsx` separa fluxos; `TicketDetailsModal.tsx` (`resolveTicket`) mantido.

### Dashboard/Realtime (`pages/dashboard`, `contexts/websocket`, `hooks/websocket`)

- Validar payload (P41) antes de mudar; `Dashboard.tsx` sem HTTP — só WS.

## 6. Alterações de tipos e modelos

| Arquivo | Mudança | Classe |
| --- | --- | --- |
| `src/lib/config.ts` | `HttpResponse` → `SuccessResponse<T>` + `ErrorResponse` + `isSuccess()` | `REQUIRED` |
| `src/lib/shared.ts` | `GetBody<T>` → `PageResponse<T>` (alias); `RewardType COSMETIC→ITEM` (`"COIN"\|"GEMS"\|"ITEM"`) | `BREAKING` |
| `src/lib/Rewards.ts` | `CreateReward.rewardReference: uuid` (obrigatório); `Reward` → `{ type: COIN\|GEMS\|ITEM, amount }` (+ `definitionId?` se confirmado); `convertReward` sem `cosmetic.id` | `BREAKING` |
| `src/pages/login/lib/Login.ts` | `Key` +`AUDIT,TICKET`; `LoginBody{id,token}` OK | `REQUIRED` |
| `src/pages/cosmetics/lib/Cosmetic.ts` | Substituir por `ItemDefinition{itemId,name,kind,category,contexts,stackable,maxStack,consumable,effect,assetPath,version,available}` + `ItemKind`, `ItemCategory(+3)`, `ItemContext`, `CreateItemDefinitionRequest`, `UpdateItemDefinitionRequest` | `BREAKING` |
| `src/pages/users/lib/Users.ts` | `BanInfo+banned`; `ItemInventory→UserItemResponse/InventoryItemResponse`; `BanUserRequest` (+`expiresInValid?`); `GrantUserRewardRequest ITEM`; `RevokeWallet` OK | `BREAKING` |
| `src/pages/levels/lib/Levels.ts` | `CreateRequest{level,rewards:CreateLevelRewardRequest[]}`; `Level{levelId,value,rewards:LevelRewardResponse[]}`; `FindBody{level}` | `BREAKING` |
| `src/pages/offers/lib/Offers.ts` | `CreateOfferReward ITEM`; `Offer.rewards:OfferRewardResponse[]`; `expiresAt:string`; `RegisterOfferResponse{offer}` | `BREAKING` |
| `src/pages/transactions/lib/Transaction.ts` | `TransactionReason+ADMIN_REVOKE`; `transactionDate:string`; `FindBody{transaction}`; paginado p/ byUserId | `REQUIRED`/`BREAKING` |
| `src/pages/tickets/lib/Tickets.ts` | `TicketFilters` sem `username,direction` (lista); `Ticket` OK; `ResolveTicketRequest.resolutionNote?` | `BREAKING` |
| `src/pages/games/lib/Games.ts` | `InventoryItem→EquippedCosmetic{itemId,name,category,equipped,assetPath}`; resto OK | `BREAKING` |
| `src/pages/audit/lib/Audit.ts` | `AuditEventType` +6 `ITEM_*` | `REQUIRED` |
| `src/contexts/profile/ProfileContext.tsx` | `Key` +`AUDIT,TICKET` (se duplicado) | `REQUIRED` |
| `src/contexts/websocket/RealtimeContext.tsx` | Validar contra broadcast real (P41) | `UNCERTAIN` |

Enums novos a espelhar ([api.json]): `ItemKind[COSMETIC,CONSUMABLE]`, `ItemCategory[AVATAR,BANNER,FRAME,EMOTE,BOARD_SKIN,CELL_SKIN,XP_BOOST]`, `ItemContext[PROFILE,MATCH]`, `RewardType[COIN,GEMS,ITEM]`, `CoinType[SOFT,HARD,REAL]` (OK), `BanType[PERMANENT,TEMPORARY]` (OK), `TicketCategory/Status` (OK), `TransactionReason+ADMIN_REVOKE`, `AuditEventType+6 ITEM_*`, `PermissionKey[10]`, `PermissionAction[5]` (OK).

## 7. Alterações de serviços/API client

Criar `src/lib/http.ts` (`REQUIRED`): `apiFetch(path, { method, body, auth=true })` com parse defensivo (`text→json try/catch`), erros tipados (`HttpError{status,code,message}`), `401→logout`, `403/429` mapeados. Migrar todos os `lib/*.ts` para ele.

Por serviço:

- `Login.ts` — `login`, `me`, `forgotPassword`: só troca de tipos + P5/P6. Endpoints OK.
- `Activate.ts` — tipar `SuccessResponseVoid`. Endpoint OK.
- `ResetPassword.ts` — `BREAKING`: assinaturas `(email,token)` e `(email,token,newPassword)`.
- `Audit.ts` — endpoints OK; `requestAuditPage` via `http.ts`; tipos +6.
- `Cosmetic.ts` — `BREAKING`: reescrever tudo (P10–P15). Métodos novos sugeridos: `createItem(json)`, `updateItem(itemId, {name?,assetPath?,available?})`, `listItems({kind?,category?,context?,equipped?})`, `getUserItems(userId, filters)`, `equipItem`, `consumeItem`, `revokeItem`. Remover `search`, `disable/enable` separados, `deleteCosmetic` (sem equivalente).
- `Games.ts` — endpoints OK; só tipos do participante.
- `Levels.ts` — `createLevel/updateLevel` desembrulham `{ level }`; rewards `ITEM`.
- `Offers.ts` — `createOffer` desembrulha `{ offer }`; rewards `ITEM`.
- `Users.ts` — `BREAKING`: 4 métodos (P25–P28) + tipos.
- `Transaction.ts` — `BREAKING`: `findTransactionByUserId(userId,page,size)→PageResponse`.
- `Tickets.ts` — `BREAKING`: `getTickets` sem `username/direction`; manter `getTicketsByUserUsername`, `resolveTicket`.
- `Logs.ts` — sem mudança obrigatória; migrar para `http.ts` com suporte `blob/text`.

## 8. Alterações de páginas/componentes/hooks

- `pages/reset/ResetPassword.tsx` — adicionar input e-mail + validação 8–16 senha (`BREAKING`).
- `pages/cosmetics/*` — rework total (P10–P15) (`BREAKING`).
- `components/RewardEditor/*` (`RewardInput`, `RewardModal`, `RewardEditor`, `RewardCard`) — `ITEM`, sem search antigo (`BREAKING`).
- `pages/levels/*` (`Levels.tsx`, `CreateLevel.tsx`, `EditLevel.tsx`, `LevelDetailsModal.tsx`) — novo shape de reward + wrapper (`BREAKING`).
- `pages/offers/*` (`Offers.tsx`, `CreateOfferPopup.tsx`, `OfferDetailsModal.tsx`) — idem + datas (`BREAKING`/`REQUIRED`).
- `pages/users/*` (`Users.tsx`, `UserDetailsInfo.tsx`) — busca paginada, inventário `{ items }`, moderação `banned`, grant `ITEM` (`BREAKING`).
- `pages/transactions/*` (`Transactions.tsx`, `TransactionDetailsModal.tsx`) — reason + data string; byUserId paginado (`REQUIRED`/`BREAKING`).
- `pages/tickets/*` (`Tickets.tsx`, `TicketDetailsModal.tsx`) — separar busca geral vs por username, remover direction (`BREAKING`).
- `pages/games/*` (`Games.tsx`, `GameDetailsModal.tsx`) — campos do participante (`BREAKING` parcial).
- `pages/audit/*` (`Audit.tsx`, `AuditDetailsModal.tsx`) — novos `ITEM_*` nos filtros/labels (`REQUIRED`).
- `pages/logs/Logs.tsx`, `pages/dashboard/Dashboard.tsx`, `components/Table`, `components/SearchBar`, `hooks/*`, `contexts/*` — sem mudança funcional, exceto `RealtimeProvider` se payload divergir (`UNCERTAIN`).
- `utils/getRemainingTime.ts`, `utils/normalizeCoinType.ts` — OK (datas string na borda).

## 9. Tratamento de erros

1. Separar `SuccessResponse` vs `ErrorResponse` (P1); nunca ler `message` no sucesso.
2. `apiFetch` defensivo: `res.text()` → `JSON.parse` em try/catch (cobre 401/403 texto puro e 204 vazio). `Content-Type` só quando há JSON.
3. Mapear `code`: `PERMISSION_DENIED→"Sem permissão"`, `RATE_LIMIT_EXCEEDED→retry`, `LEVEL_ALREADY_EXISTS`, `OFFER_ALREADY_PURCHASED`, `INSUFFICIENT_BALANCE`, `ITEM_NOT_OWNED`, `INVALID_TICKET_STATUS`, `USER_BANNED_FROM_GAME`, `SESSION_EXPIRED→logout`, `VALIDATION/INVALID_REQUEST→primeiro field error`.
4. Substituir `throw new Error()` vazios por `throw new HttpError(status, code, message)` e `notify.error(message)` com fallback pt-BR.
5. `DELETE /user/items/{itemId}` (204) e `Void` endpoints: não parsear JSON quando `status===204` ou corpo vazio.

## 10. Paginação, filtros e ordenação

- REST padrão: manter `?page&size` (compatível com Spring `Pageable`); adicionar `sort` apenas como `OPTIONAL` respeitando whitelists ([impl]): admins `name,email,createdAt`; users `username,email,createdAt`; transactions `createdAt,amount`; tickets `createdAt,status,category,subject`; offers `title,price,createdAt,expiresAt,active`; games `roomName,roomCode,status`; levels `level`.
- Mudanças obrigatórias:
  - `GET /user/username/{u}` e `GET /transaction/user/{userId}`: adicionar `?page&size`, ler `PageResponse` (`BREAKING`).
  - `GET /user/{id}/items`: **remover** `page/size` (não paginado, `{ items }`), usar filtros `kind,category,context,equipped` (`BREAKING`).
  - `GET /admin/ticket`: remover `username,direction`; `page/size` via `pageable`; busca por nome só pelo endpoint dedicado (`BREAKING`).
  - `GET /user/items` (próprio): mesmos 4 filtros opcionais.
- Auditoria mantém `page,size,direction` + `from/to` ISO + 11 filtros — OK.
- `Table.tsx`: sem mudança; páginas ajustam `totalPages` do `PageResponse`.

## 11. Autenticação e autorização

- Fluxo mantido: `POST /admin/auth {email,password}→{id,token}`, `GET /admin/me→{admin}`, `POST /admin/auth/forgot-password {email}`, `PATCH /admin/activate?token +{password}`, reset com `+email` (P4). JWT `Bearer`, `role=ADMIN` via `decodeToken`, `localStorage token/id/profile`. Sem refresh/session.
- Autorização: exigir `ADMIN` + `permissions.can(key,action)` no backend ([impl] `CheckIfIsAdminService`); frontend deve espelhar gating com `Key[10]` completa e corrigir `Cosmetics.tsx→COSMETIC`.
- Protegidos novos usados pelo admin: `/user*`, `/offer*`, `/level*`, `/transaction*`, `/game*`, `/admin/*`, `/admin/ticket*`, `/admin/audit*`, `/admin/logs*`, `/admin/items*`, `/user/{id}/items`. Públicos: `/admin/auth/**`, `/admin/activate`.
- WS: `?token=` query (não header) — correto; confirmar path/origem (`VITE_WS_URL`) e payload (P41).

## 12. Mocks e testes

- **Nenhum mock/fixture/teste de API no frontend**: busca por `*.test.*`, `*.spec.*`, `__tests__`, `__mocks__`, `vitest/jest`, fixtures em `src` retornou vazio. Nada a migrar.
- Dados hardcoded relacionados à API: `EditCosmeticPopup.tsx` URL R2 pública (`https://pub-...r2.dev/${assetPath}`) — passa a ser valor de `assetPath`, não upload; `COSMETIC_TYPES` duplicado (`Cosmetic.ts` + `Users.ts`); labels de `Ticket/Audit/Transaction/Coin` em libs — revisar contra novos enums.
- Testes a criar (`OPTIONAL`, pós-refatoração): contrato de `http.ts` (envelope sucesso/erro/401 texto/204), `convertReward ITEM`, wrappers `{ level }`/`{ offer }`, paginação `findUserByUsername`/`transactionByUserId`, filtros de tickets, `UserItemResponse`, `ItemDefinition`, `BanInfo.banned`, `ADMIN_REVOKE`, `ITEM_*` audit.

## 13. Ordem recomendada de implementação

1. `lib/config.ts` + novo `lib/http.ts` (envelope, `HttpError`, 401/403/429/204) — base de tudo.
2. `lib/shared.ts` (`PageResponse`, `RewardType ITEM`) + `lib/Rewards.ts` (`convertReward`) — desbloqueia levels/offers/users.
3. Auth: `Login.ts` (`Key` 10), `ResetPassword.ts`+página (email), `Activate.ts` tipagem; validar login/me na nova API.
5. Inventário (cosméticos): reescrever `Cosmetic.ts` + telas + `RewardEditor` (maior bloco; depende de 1–2).
6. Levels → Offers → Users (grant/inventário/modernação) — dependem de rewards novos.
7. Transactions (reason, datas, byUserId) → Tickets (filtros) → Games (participante) → Audit (`ITEM_*`).
8. Logs (validar envelope) → WS/Realtime (validar payload antes de tocar `Dashboard`).
9. Páginas/componentes restantes, gating `COSMETIC`, datas na borda, `Table`/`SearchBar` onde necessário.
10. Rodar checklist §14 contra `api.json`; criar testes de contrato.

## 14. Checklist final

- [ ] Atualizar tipos (`SuccessResponse/ErrorResponse`, `PageResponse`, `ITEM`, `ItemDefinition`, `UserItemResponse`, `BanInfo.banned`, `ADMIN_REVOKE`, `ITEM_*`, `Key[10]`)
- [ ] Criar `lib/http.ts` (parse defensivo, 401 texto→logout, 403/429, 204 sem json)
- [ ] Atualizar autenticação (reset com `email`, `Key` completa)
- [ ] Reescrever cosméticos→inventário (`/admin/items`, `/user[/{id}]/items`, JSON, `available`, sem `FormData/search/delete-definição`)
- [ ] Atualizar levels (wrapper `{ level }`, rewards `ITEM+uuid`)
- [ ] Atualizar offers (wrapper `{ offer }` no create, rewards `ITEM`, `expiresAt` string)
- [ ] Atualizar users (busca paginada, `/{id}/items`, revoke `DELETE /user/items/{id}` 204, grant `ITEM`)
- [ ] Atualizar transactions (byUserId paginado, `ADMIN_REVOKE`, datas string)
- [ ] Atualizar tickets (sem `username/direction` na lista; busca por nome dedicada)
- [ ] Atualizar games (participante `EquippedCosmetic`)
- [ ] Atualizar audit (`ITEM_*`)
- [ ] Validar logs (lista `string[]` vs wrapper; binário download)
- [ ] Validar WS (`?token=`, eventos `METRICS/LOG`, payloads, path `WS_URL`)
- [ ] Atualizar paginação/filtros/ordenação por endpoint (§10)
- [ ] Atualizar tratamento de erros (`code`, 401/403/429/204)
- [ ] Atualizar gating de permissões (`COSMETIC`, `AUDIT`, `TICKET`)
- [ ] Validar todas as chamadas contra `docs/api.json` (72 paths; nenhum `/cosmetic*` restante; nenhum `COSMETIC` reward restante; nenhum `res.json()` em 204/401)
