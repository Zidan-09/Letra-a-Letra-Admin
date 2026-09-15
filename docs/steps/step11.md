# Step 11 — Admins + Logs + WS (final)

## Implementado

- `src/pages/admins/lib/Admins.ts`: migrado para `apiFetch` (`PageResponse<Admin>`); `registerAdmin`/`removeAdmin` agora retornam `admin` (`RegisterAdminResponse`/`DeleteAdminResponse`, P9 OPTIONAL); mapeamento `username→name` mantido e documentado (P8).
- `src/lib/http.ts`: nova opção `response: "text"` para endpoints binários (retorna texto cru sem tentar `JSON.parse`).
- `src/pages/logs/lib/Logs.ts`: migrado para `apiFetch`; listas `string[]` direto, arquivos com `response: "text"`. Formato confirmado compatível com `api.json` (listas `string[]`, arquivos `binary`) — sem mudança de comportamento.
- WS/Realtime validado contra a implementação real (`AdminWebSocketHandler`, `AdminBroadcastService`, `MetricsWsResponse`, `LogWsResponse`, `AdminWebSocketConfig`, `AuthHandshakeAdminInterceptor`): path `/ws/admin`, auth via `?token=` query, payload `{event:"METRICS",system,application}` e `{event:"LOG",log}` via `@JsonTypeInfo(property="event")`. Frontend já confere — **nenhuma mudança necessária**.

## Testes

- `npx tsc -b` — passou.
- `npx eslint` nos arquivos (`http.ts`, `Admins.ts`, `Logs.ts`) — passou.
- Checklist §14: nenhum `res.json()` direto restante; nenhum `/cosmetic*` (só rota frontend `/admin/cosmetics`, enum `ItemKind COSMETIC` e permission key — válidos); nenhum reward `COSMETIC`; `HttpResponse`/`GetBody` só como aliases legados sem uso.

## Observações

- `DELETE /user/items/{itemId}` documentado como 204 em [impl] mas `api.json` diz 200 `SuccessResponseVoid` — `apiFetch` cobre ambos (corpo vazio → `{}`).
- `rewardReference` UUID para moeda (P17) segue UNCERTAIN — UI envia `""`, backend precisa confirmar.
- `npm run lint` geral mantém só erros pré-existentes (`set-state-in-effect`, ternários, unused vars) anteriores à refatoração.
