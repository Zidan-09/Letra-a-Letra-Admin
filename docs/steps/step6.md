# Step 6 — Offers (wrapper {offer}, expiresAt string)

## Implementado

- `src/pages/offers/lib/Offers.ts`: migrado para `apiFetch`; `Offer.rewards` sem cosmético aninhado (Etapa 2); `expiresAt: string` (date-time do contrato); `createOffer` desembrulha `{offer}`; `CreateOfferReward` = alias de `CreateReward` (ITEM).
- `src/utils/getRemainingTime.ts`: aceita `Date | string` (conversão na borda).
- `CreateOfferPopup`: exibe `err.message` da API.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos — só erros pré-existentes (`set-state-in-effect`, `prefer-const`).

## Observações

- `OfferDetailsModal` já lia `type+amount+definitionId` (Etapa 2); `new Date(expiresAt)` já usado na UI — compatível com string.
- `rewardReference` UUID para moeda segue pendente (P17, UNCERTAIN), igual a levels.
