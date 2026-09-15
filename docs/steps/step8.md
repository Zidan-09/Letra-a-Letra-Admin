# Step 8 — Transactions (byUserId paginado, ADMIN_REVOKE, datas)

## Implementado

- `src/pages/transactions/lib/Transaction.ts`: migrado para `apiFetch`; `TransactionReason` +`ADMIN_REVOKE`; `transactionDate: string` (date-time); `findTransactionByUserId(userId,page,size)` agora paginado retornando `PageResponse<Transaction>`; `findTransactionsByNickname` e `getTransactions` já paginados, só troca de tipos.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — passou.

## Observações

- `TransactionDetailsModal` já fazia `new Date(transactionDate)` na borda — compatível com string, sem mudança.
- `findTransactionByUserId` não era usado pela página (busca é por nickname) — corrigido mesmo assim para o contrato.
