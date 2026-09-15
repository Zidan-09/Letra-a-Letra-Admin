# Step 9 — Tickets (filtros sem username/direction)

## Implementado

- `src/pages/tickets/lib/Tickets.ts`: migrado para `apiFetch`; `TicketFilters` sem `username`/`direction` (só `status,category,userId,page,size`); `ResolveTicketRequest.resolutionNote?` opcional; busca por nome separada em `getTicketsByUserUsername`.
- `Tickets.tsx`: removidos estado `direction`, `handleDirectionChange` e seletor "Ordem"; busca por jogador usa o endpoint dedicado; lista geral só com `status/category`.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — só erros pré-existentes.

## Observações

- Modelo `Ticket` já conferia com `TicketResponse`; sem mudança.
- Ordenação agora é a padrão do backend (sem `direction` no contrato da lista).
