# Step 10 — Games (EquippedCosmetic) + Audit (ITEM_*)

## Implementado

- `src/pages/games/lib/Games.ts`: migrado para `apiFetch` (`PageResponse<Game>`); participante usa `EquippedCosmetic{itemId,name,category,equipped,assetPath}` (sem `unlockedAt`, `type`→`category`); mensagens de erro preservadas via `HttpError`.
- `GameDetailsModal.tsx`: `item.cosmeticId`→`item.itemId`, `item.type`→`item.category`.
- `src/pages/audit/lib/Audit.ts`: migrado para `apiFetch`; `AuditEventType` +6 valores (`ITEM_ACQUIRED,ITEM_REMOVED,ITEM_EQUIPPED,ITEM_UNEQUIPPED,ITEM_CONSUMED,ITEM_QUANTITY_CHANGED`); `AUDIT_EVENT_TYPE_OPTIONS` e `eventTypeLabels` atualizados.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — passou (2 erros `preserve-caught-error` corrigidos com `cause`).

## Observações

- Enums `Game{type,status}`, `Role` e paginação mantidos — compatíveis.
- Query de auditoria (`page,size,direction` + filtros) mantida.
