# Plano de Atualização — Seção de Jogos (Games)

> **Documento de planejamento técnico.** Nenhuma linha de código foi alterada para gerar este plano.
>
> Convenção:
> - **[ENCONTRADO]** — fato verificado em `docs/api.json` ou no código, com referência `arquivo:linha`.
> - **[DECISÃO]** — recomendação de implementação fundamentada nos padrões existentes.
> - **[LACUNA / AMBIGUIDADE]** — informação ausente ou contraditória; não inventar comportamento.

---

## 1. Contexto

### 1.1 Motivação
A API do projeto Letra a Letra (`docs/api.json`, OpenAPI 3.1.0, `servers[0].url = http://localhost:8080`) sofreu alteração no contrato da funcionalidade de **Jogos (tag `Game`)**. O frontend administrativo em `src/pages/games/` precisa ser adaptado para consumir o novo contrato sem refatoração desnecessária, mantendo os padrões já estabelecidos no projeto (fetch nativo, classes estáticas `*Requests`, CSS Modules, `Table<T>`, modais de detalhe).

### 1.2 Mudança de contrato tratada
Comparando `origin/develop:docs/api.json` com `HEAD`/`working dir:docs/api.json` (`git diff origin/develop -- docs/api.json` e `git diff HEAD -- docs/api.json`):

* **Única diferença estrutural verificada em `docs/api.json:5141-5161` e `5237-5250`**: o schema `MatchHistoryResponse` ganhou o campo `spectators` e foi introduzido o novo schema `SpectatorHistoryResponse`.
* Nenhum endpoint foi adicionado/removido/renomeado em `paths`; todos os schemas `GameResponse`, `ParticipantResponse`, `InventoryItem`, `PlayerHistoryResponse`, `PageResponseGameResponse` permanecem idênticos ao `origin/develop`.

O planejamento abaixo trata **(a)** a atualização obrigatória do campo novo e **(b)** todas as divergências latentes já existentes entre o contrato atual da API e o modelo que o frontend esperava — mesmo que essas divergências não venham do diff recente — para garantir consumo correto e futuro-prova.

---

## 2. Análise do Contrato

Fonte: `docs/api.json` (5668 linhas, tag `Game`).

### 2.1 Endpoints de Jogos relevantes

| Path | Método | OperationId | Uso no Admin | Parâmetros | Response envelope |
|---|---|---|---|---|---|
| `/game` | GET | `handle_56` (`docs/api.json:1891`) | Listar todas as partidas (histórico completo) — usado por `GamesRequests.getGames` (`src/pages/games/lib/Games.ts:48`) | `pageable` (objeto `Pageable` com `page:int32>=0`, `size:int32>=1`, `sort:string[]` opcional) | `SuccessResponsePageResponseGameResponse` → `PageResponseGameResponse` |
| `/game/active` | GET | `handle_57` (`docs/api.json:1982`) | Listar partidas ativas — usado por `GamesRequests.getActiveGames` (`src/pages/games/lib/Games.ts:66`) | idem | idem |
| `/game/public` | GET | `getGames` (`docs/api.json:1921`) | Público — **não usado** pelo admin | `pageable` | idem |
| `/game/code/{code}` | GET | `getGameByCode` (`docs/api.json:1951`) | Busca por código — **não usado** pelo admin | `code:string (minLength 1)` path | `SuccessResponseFindByCodeResponse` → `FindByCodeResponse { gameId:string }` |
| `/admin/logs/game*` | GET | `findDates`, `findGames`, `findFiles`, `download` | Logs — não faz parte da seção Jogos, mas reutiliza termo `gameId` | vários | `string[]` / `binary` |

**Observação:** Apenas `/game` e `/game/active` são consumidos hoje. O plano **não** deve integrar `/game/public` ou `/game/code/{code}` a menos que requisito explícito seja adicionado — manter escopo.

### 2.2 Schemas — contrato que o frontend deverá consumir

#### `GameResponse` (`docs/api.json:5067`)
```
gameId: string
gameName: string
type: enum "CUSTOM" | "MATCHMAKING" | "RANKING"
status: enum "WAITING" | "RUNNING" | "CLOSED" | "CANCELED"
participants: ParticipantResponse[]
positions: object< string, string >  // additionalProperties string — mapa slot->playerId
matches: MatchHistoryResponse[]
```
Todos os campos aparecem sem `required` explícito no schema (OpenAPI permite ausência). O frontend deve tratar como possivelmente ausente.

#### `ParticipantResponse` (`docs/api.json:5195`)
```
id: string
nickname: string
cosmeticsEquipped: InventoryItem[]
role: enum "PLAYER" | "SPECTATOR"
isConnected: boolean
```

#### `InventoryItem` (`docs/api.json:5113`)
```
cosmeticId: string (uuid)
name: string
type: enum "AVATAR"|"BANNER"|"EMOTE"|"FRAME"
equipped: boolean
unlockedAt: string date-time
```

#### `MatchHistoryResponse` (`docs/api.json:5141`) — **schema alterado**
```
finishedAt: string date-time
players: PlayerHistoryResponse[]
spectators: SpectatorHistoryResponse[]   // <-- CAMPO NOVO (docs/api.json:5154)
```

#### `PlayerHistoryResponse` (`docs/api.json:5222`)
```
id: string
nickname: string
score: int32
winner: boolean
```

#### `SpectatorHistoryResponse` (`docs/api.json:5240`) — **schema novo**
```
id: string
nickname: string
```

#### `PageResponseGameResponse` (`docs/api.json:5162`)
```
content: GameResponse[]
page: int32
size: int32
totalElements: int64
totalPages: int32
first: boolean
last: boolean
```

#### `SuccessResponsePageResponseGameResponse` (`docs/api.json:5251`)
```
success: boolean
data: PageResponseGameResponse
```

#### `Pageable` (`docs/api.json:4450`)
```
page: int32 >=0
size: int32 >=1
sort: string[] (opcional)
```

#### Envelope HTTP
O código assume `HttpResponse<T> { success:boolean, code:string, message:string, data:T }` (`src/lib/config.ts:4`). O `api.json` documenta apenas `success`+`data` no schema de sucesso; `code`/`message` são convenção do backend já usada em outros services (`src/pages/users/lib/Users.ts:83` lê `response.message` em erro). Manter esse envelope.

### 2.3 Paginação, filtros, ordenação
* **Paginação:** `page`/`size` via `Pageable`. O frontend hoje usa `?page=${page}&size=${size}` (`Games.ts:51`, `Games.ts:69`) — compatível com Spring Data que expande `Pageable` para esses query params. Sem `sort` no uso atual.
* **Filtros:** Nenhum filtro de query para `/game` ou `/game/active` além de paginação. O toggle `showAll` do frontend (`Games.tsx:13`, `Games.tsx:27`) apenas alterna entre os dois endpoints.
* **Ordenação:** Não há parâmetro de ordenação customizado nos endpoints de Game. Não propor ordenação local sem necessidade.

---

## 3. Diferenças Encontradas

### 3.1 Campo novo obrigatório na análise

| # | Local | Contrato antigo esperado pelo frontend | Novo contrato (`docs/api.json`) | Impacto |
|---|---|---|---|---|
| D1 | `MatchHistoryResponse.spectators` (`docs/api.json:5154`) | **Inexistente** no código. `src/pages/games/lib/Games.ts:42-45` define `type MatchHistory = { finishedAt: Date; players: Player[] }` — sem `spectators`. `GameDetailsModal.tsx:67-91` itera apenas `match.players`. | Novo campo `spectators: SpectatorHistoryResponse[]` (objetos `{id,nickname}`). Diff verificado em `git diff HEAD -- docs/api.json:5150-5161`. | **Adição.** Se ignorado, espectadores que assistiram uma partida concluída ficam invisíveis na UI; desatualizado com contrato. Risco de dados perdidos no audit. Tipo local precisa ser estendido. |

### 3.2 Divergências latentes (frontend já desalinhado do contrato atual, independentemente do diff recente)

| # | Local | O que o frontend faz hoje | O que a API entrega | Severidade |
|---|---|---|---|---|
| D2 | `Game.positions` | Tipado como `Map<number,string>` (`Games.ts:31`) e tratado com fallback para `Object.entries` (`GameDetailsModal.tsx:23-27`). | `positions: object<additionalProperties:string>` (`GameResponse.positions`, `docs/api.json:5099`). JSON nunca é `Map`; `JSON.parse` produz plain object. Além disso, chaves são `string` (ex.: `"1":"uuid"`), não `number`. | **Tipo alterado / mapeamento.** O tipo `Map` é incorreto para desserialização direta; pode quebrar se alguém usar `positions.get()`. O fallback ameniza exibição, mas tipo e conversão de datas/espectadores continuam errados. |
| D3 | `InventoryItem.unlockedAt` / `MatchHistory.finishedAt` | `InventoryItem.unlockedAt: Date` (`Games.ts:14`), `MatchHistory.finishedAt: Date` (`Games.ts:42`). | Ambos são `string date-time` (`InventoryItem:5135`, `MatchHistoryResponse:5144`). | **Tipo alterado (Date ↔ string).** `fetch(...).json()` retorna string; sem conversão, `new Date(...)` em `GameDetailsModal.tsx:72` funciona por coerção, mas tipo mente. Inconsistente com padrão de outras features que mantêm string e convertem só na renderização. |
| D4 | `Game` campos opcionais | TypeScript marca todos como obrigatórios (`Game.ts:25-33`). Acesso usa `item.gameName \|\| "Partida sem nome"` (`Games.tsx:55`, `GameDetailsModal.tsx:44`) mas sem null-safety completo. | Schema sem `required` — todos os campos podem vir ausentes/`null`/`[]`. | **Obrigatoriedade.** Assumir obrigatório esconde bugs de render se API omitir `participants`, `matches`, `positions`. |
| D5 | `GetBody` / `PageResponse` booleans | `src/lib/shared.ts:1-9` define `first:number; last:number`. `Games.ts:79` tipa `HttpResponse<GetBody<Game>>` com esse `GetBody`. | `PageResponseGameResponse` (`docs/api.json:5187`) define `first:boolean`, `last:boolean`. | **Tipo alterado (number ↔ boolean).** Inconsistência pré-existente (mesma lacuna do plan de Auditoria). Não quebra o uso atual porque `Games.tsx` ignora `first/last` e usa só `totalPages`, mas deve ser corrigido para evitar futuros usos errados. |
| D6 | `GamesRequests.getGames` sem tipagem | `getGames` (`Games.ts:48`) faz `await res.json()` sem tipar e retorna `response.data` any-like. `getActiveGames` tipa corretamente `HttpResponse<GetBody<Game>>` (`Games.ts:79`). | Ambos retornam `SuccessResponsePageResponseGameResponse`. | **Inconsistência de padrão.** Viola padrão usado em `Users.ts:81`, `Levels.ts:39`, `Offers.ts:58`, `Transactions` etc. Dificulta validação de `content`/`totalPages`. |
| D7 | Paginação — uso de `totalPages` vs `first/last` | Frontend só usa `totalPages` (`Games.tsx:32`). | API fornece `page`, `size`, `totalElements`, `totalPages`, `first`, `last`. | Não é divergência, mas oportunidade de seguir padrão: `Transactions.tsx:29`, `Users.tsx:28` também ignoram `first/last`. Manter, mas documentar. |
| D8 | Tratamento de erro / `res.ok` | `getGames` faz `if(!res.ok) throw new Error()` sem ler `response.message`; `getActiveGames` similar. | Outras features (ex.: `Users.ts:83-84`, `Cosmetic.ts:43-45`) leem `response.message` e repassam para `notify`. | **Comportamento inconsistente.** Deve unificar com padrão de ler `message` quando `!res.ok`. |

### 3.3 O que **NÃO** mudou (e não deve ser inventado)
* **Campos renomeados:** Nenhum. `gameId`, `gameName`, `type`, `status`, `participants`, `positions`, `matches` mantêm mesmos nomes em `GameResponse`.
* **Campos removidos:** Nenhum.
* **Enums/Status:** Inalterados. `type` continua `CUSTOM|MATCHMAKING|RANKING`, `status` continua `WAITING|RUNNING|CLOSED|CANCELED`, `role` continua `PLAYER|SPECTATOR`.
* **Parâmetros de query/path:** Inalterados (`pageable` para ambos GET).
* **Request bodies:** Não aplicável (endpoints de Game são apenas GET).
* Nenhum campo `gameId` virou `id` ou vice-versa — o `ParticipantResponse.id` é `id` (sem renome), distinto de `GameResponse.gameId`.

---

## 4. Arquivos Afetados

Lista fechada — nenhum outro arquivo deve ser alterado.

| Arquivo | Criar/Modificar | O que deve mudar (exato) |
|---|---|---|
| `src/pages/games/lib/Games.ts` | **Modificar** | (a) Revisar todos os `type`/`interface`: alinhar com `docs/api.json`. (b) Adicionar `SpectatorHistory = { id:string; nickname:string }` e estender `MatchHistory` com `spectators: SpectatorHistory[]`. (c) Corrigir `InventoryItem.unlockedAt` e `MatchHistory.finishedAt` para `string` (ou manter string no modelo e converter na UI) — seguir padrão de `Audit.ts:46-70` e `Tickets.ts:7-20` que mantêm `string`. (d) Corrigir `Game.positions` para `Record<string,string> \| Map<number,string>` ou apenas `Record<string,string>` com helper de conversão. (e) Corrigir `GameStatus`/`GameType` para unions idênticas ao enum da API. (f) Tipar `getGames` com `HttpResponse<PageResponseGameResponse>` (ou alias `GetBody` corrigido). (g) Opcional: extrair `PageResponseGameResponse` / `GetBody` booleano correto ou criar tipo local `GamePage`. (h) Uniformizar tratamento de erro: ler `response.message` quando `!res.ok` e relançar `Error(message)`. |
| `src/pages/games/Games.tsx` | **Modificar** | (a) Corrigir `useEffect` dependency bug (`src/pages/games/Games.tsx:48` inclui `games` causando loop infinito) — deve depender apenas de `[page, showAll]` (ou incluir `fetchGames` memoizado). (b) Ajustar colunas para lidar com `spectators` se necessário (contagem não muda; coluna atual usa `matches.length` vs `participants.length` — manter). (c) Garantir que `fetchGames` lide com resposta tipada nova e com `positions` como objeto. (d) Se `InventoryItem.unlockedAt` virar string, nenhum impacto direto aqui. (e) Melhorar empty/loading/error states já existentes: manter `notify.error` mas propagar mensagem da API. |
| `src/pages/games/components/GameInfo/GameDetailsModal.tsx` | **Modificar** | (a) Estender render de `matches` para exibir `spectators`. Hoje `GameDetailsModal.tsx:63-91` mostra só `match.players`. Novo bloco deve listar `match.spectators` quando presente, com fallback quando array ausente/vazio. (b) Atualizar helper `positionsEntries` para tratar `Record<string,string>` (já há fallback, mas simplificar). (c) Ajustar tipos importados (`Game`, `MatchHistory`) para novos campos. (d) Garantir que `finishedAt` string seja convertida com `new Date(match.finishedAt).toLocaleString("pt-BR")` já existente (`GameDetailsModal.tsx:72`). (e) Adicionar null-safety para `participants`, `matches`, `spectators` (optional chaining já parcialmente usado). |
| `src/pages/games/components/GameInfo/GameDetailsModal.module.css` | **Modificar** (se necessário) | Adicionar estilos para nova seção de espectadores (reutilizar tokens de `GameDetailsModal.module.css:211-265` — ex.: `.spectatorsList`, `.spectatorBadge`). Não criar novos tokens; usar `--primary`, `#a5b4fc`, `#1e2533` já existentes. Se a lista puder reutilizar `.participantsGrid` / `.cosmeticBadges`, alteração pode ser mínima. |
| `src/lib/shared.ts` | **Avaliar, possivelmente modificar** | `GetBody<T>` (`src/lib/shared.ts:1-9`) define `first:number; last:number` mas API retorna `boolean`. **Decisão recomendada:** corrigir para `first:boolean; last:boolean` e ajustar imports que usam `GetBody` (Levels, Offers, Users, Transactions, Cosmetics, Games). Alternativa conservadora: criar tipo local `GamePage` em `Games.ts` sem tocar `shared.ts` — ver seção 7. Registrar a inconsistência; não propagar `number` para novos códigos. |
| `src/pages/audit/lib/Audit.ts` (referência, não alterar) | **Referência** | Serve como padrão correto para paginação com `first:boolean; last:boolean` e para tratamento de `string date-time` sem converter para `Date` no modelo. |
| `src/pages/transactions/lib/Transaction.ts` (referência) | **Referência** | Padrão de `fetch` com `Authorization: Bearer ${localStorage.getItem("token")}` e `HttpResponse` — replicar em Games. |
| `docs/plan.md` | **Criar/Atualizar** | Este arquivo. |

**Arquivos que NÃO devem ser alterados** (fora de escopo desta task, mesmo que contenham similar gap): `src/lib/config.ts`, `src/components/Table/Table.tsx`, `src/router.tsx`, demais features (`users`, `offers`, `levels`, `cosmetics`).

---

## 5. Plano de Implementação

Sequência recomendada, passo a passo, para que outro agente implemente sem ambiguidade.

### Passo 0 — Preparação e verificação
1. Ler `docs/api.json` e confirmar `GameResponse`, `MatchHistoryResponse`, `SpectatorHistoryResponse` (`docs/api.json:5067-5161`, `5240`).
2. Rodar `git diff origin/develop -- docs/api.json` para confirmar diff mínimo; não assumir mudanças ocultas.
3. Garantir `npm install` e `npm run typecheck` antes de começar (precisa passar ao final).

### Passo 1 — Atualizar `src/pages/games/lib/Games.ts`

**1.1 Tipos:**
```ts
// Alinhar com docs/api.json:5067, 5195, 5113, 5141, 5222, 5240
type GameType = "CUSTOM" | "MATCHMAKING" | "RANKING";
export type GameStatus = "WAITING" | "RUNNING" | "CLOSED" | "CANCELED";
type Role = "PLAYER" | "SPECTATOR";
type CosmeticType = "AVATAR" | "BANNER" | "EMOTE" | "FRAME";

// [DECISÃO] Manter unlockedAt/finishedAt como string date-time, converter só na render.
// Justificativa: padrão de Audit.ts:46 (occurredAt:string) e Tickets.ts:19 (createdAt:string).
type InventoryItem = {
  cosmeticId: string;
  name: string;
  type: CosmeticType;
  equipped: boolean;
  unlockedAt: string; // era Date — [D3]
}

type Participant = {
  id: string;
  nickname: string;
  cosmeticsEquipped: InventoryItem[];
  role: Role;
  isConnected: boolean;
}

type PlayerHistory = { id:string; nickname:string; score:number; winner:boolean; }
type SpectatorHistory = { id:string; nickname:string; } // NOVO — [D1]

type MatchHistory = {
  finishedAt: string; // era Date — [D3]
  players: PlayerHistory[];
  spectators: SpectatorHistory[]; // NOVO — [D1] — tratar como opcional no consumo (?? [])
}

// [DECISÃO] positions como Record<string,string> — JSON puro; helper converte se precisar de Map
export type Game = {
  gameId: string;
  gameName: string;
  type: GameType;
  status: GameStatus;
  participants: Participant[];
  positions: Record<string,string>; // era Map<number,string> — [D2]
  matches: MatchHistory[];
}

// Tipo de paginação alinhado com PageResponseGameResponse (docs/api.json:5162)
type GamePage = {
  content: Game[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean; // era number em shared.ts — [D5]
  last: boolean;
}
```
*Alternativa:* Se preferir não tocar `shared.ts`, definir `GamePage` localmente e usar `HttpResponse<GamePage>` nos métodos.

**1.2 Services:**
```ts
export class GamesRequests {
  static async getGames(page:number,size:number): Promise<GamePage> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/game?page=${page}&size=${size}`, {
      method:"GET",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${token}` }
    });
    const response: HttpResponse<GamePage> = await res.json();
    if (!res.ok) throw new Error(response.message || "Erro ao carregar partidas.");
    return response.data;
  }
  static async getActiveGames(page:number,size:number): Promise<GamePage> {
    // idem para /game/active
  }
}
```
*Pontos:* (a) Tipar ambos métodos; (b) Ler `response.message` em erro — padrão `Users.ts:83-84`; (c) Não injetar `sort`.

**1.3 Helpers (opcional):**
* Função `parsePositions(pos: Record<string,string>): Map<number,string> | null` se alguma lógica futura precisar de Map; caso contrário, usar `Object.entries` direto na UI.
* Funções `formatDateTime(value:string)` idênticas a `Audit.ts:208-211` e `Tickets.ts:112-116` para conversão local.

### Passo 2 — Corrigir `src/pages/games/Games.tsx`

**2.1 Corrigir `useEffect`:**
```ts
// ANTES (bug): useEffect(() => { fetchGames(); }, [page, showAll, games]);
// DEPOIS:
useEffect(() => { fetchGames(); }, [page, showAll]); // remover `games`
```
Justificativa: `games` como dep causa loop infinito; padrão correto em `Users.tsx:40-44`, `Levels.tsx:48-50`, `Offers.tsx:61-63` depende só de `page` (e filtros).

**2.2 Tipagem da resposta:**
* `fetchGames` já recebe `data: GamePage`; extrair `data.content` e `data.totalPages` como hoje (`Games.tsx:31`).

**2.3 Tratamento de erro:**
* `catch (e)` exibir `notify.error((e as Error).message || "Erro ao carregar a lista de partidas.")` — alinha com `AuditRequests` que relança `Error()` com message.

**2.4 Colunas e render:**
* Nenhuma mudança estrutural nas colunas (`Games.tsx:50-89`) — manter `matches.length` vs `participants.length` conforme `showAll`.
* Se `Game.positions` virar `Record<string,string>`, nenhuma coluna usa `positions` diretamente; sem impacto.

### Passo 3 — Atualizar `src/pages/games/components/GameInfo/GameDetailsModal.tsx`

**3.1 Tipos:**
* Importar `SpectatorHistory` se necessário; garantir que `game: Game | null` reflita novo `Game`.

**3.2 Render de `matches`:**
Adicionar bloco condicional após lista de `players`:

```tsx
// Dentro de matchCard, após <ul className={styles.playersList}>
{match.spectators && match.spectators.length > 0 && (
  <>
    <span className={styles.cosmeticsLabel}>Espectadores ({match.spectators.length}):</span>
    <ul className={styles.playersList}>
      {match.spectators.map((s) => (
        <li key={s.id} className={styles.playerRow}>
          <span className={styles.playerName}>{s.nickname}</span>
        </li>
      ))}
    </ul>
  </>
)}
// Fallback: se !match.spectators ou vazio, não renderiza seção — evita quebra com dados antigos sem campo
```

* Usar optional chaining e default `match.spectators ?? []` para compatibilidade com payloads antigos/cache.
* Reutilizar `.playersList`/`.playerRow` ou criar `.spectatorsList` com mesmo estilo.

**3.3 Render de `positions`:**
Simplificar `positionsEntries`:
```ts
const positionsEntries = game.positions ? Object.entries(game.positions) : [];
// remover branch `instanceof Map` se tipo for só Record; manter fallback defensivo por 1 versão se quiser
```

**3.4 Datas:**
* `finishedAt` já converte com `new Date(match.finishedAt).toLocaleString("pt-BR")` (`GameDetailsModal.tsx:72`) — continua válido pois agora é `string` no tipo; nenhum ajuste se tipo mudar de `Date` para `string` (chamar `new Date(string)` continua correto). Se mantido `Date`, precisaria `match.finishedAt instanceof Date ? ... : new Date(...)`.

**3.5 Null-safety:**
* Envolver `game.matches?.length`, `game.participants?.length`, `match.players?.length` com `?? 0` e `|| []` — já parcialmente feito.

### Passo 4 — Atualizar `src/pages/games/components/GameInfo/GameDetailsModal.module.css`

* Se escolher reutilizar estilos existentes, nenhuma mudança.
* Se criar seção dedicada, adicionar (exemplo baseado em `GameDetailsModal.module.css:162-188`):

```css
.spectatorsContainer { margin-top: 8px; }
.spectatorBadge {
  font-size: 0.75rem;
  background: rgba(165,180,252,0.1);
  color: #a5b4fc;
  border: 1px solid rgba(165,180,252,0.2);
  padding: 2px 8px;
  border-radius: 4px;
}
```
Usar tokens já existentes (`#a5b4fc`, `#1e2533`, `rgba(165,180,252,0.1)`).

### Passo 5 — Revisar `src/lib/shared.ts` (opcional, mas recomendado)

**[DECISÃO]** Corrigir `GetBody`:
```ts
export type GetBody<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean; // era number
  last: boolean;  // era number
}
```
*Impacto:* `Levels.ts:39`, `Offers.ts:58`, `Users.ts:81`, `Transactions`, `Cosmetics`, `Audit` já esperam `boolean` da API mas estão tipados como `number`; a correção alinha. Verificar se `npm run typecheck` ou `npm run build` quebra em algum arquivo — ajustar call-sites se alguém comparava `first === 0`.

*Alternativa conservadora:* não tocar `shared.ts` e usar `GamePage` local — evita regressão em outras features. Documentar escolha no PR.

### Passo 6 — Validação cruzada

1. `npm run typecheck` deve passar.
2. `npm run build` (`tsc -b && vite build`) deve passar.
3. Verificar que nenhum import quebrou (`GamesRequests`, `Game`).
4. Testar manualmente cenários da seção 8.

---

## 6. Impactos na UI

| Área | Situação atual | Alteração necessária | Justificativa |
|---|---|---|---|
| **Tabela principal (`Games.tsx:50-89`)** | Mostra ID/Nome, Partidas/Participantes, Status. | **Nenhuma mudança visual obrigatória.** Coluna “Partidas” conta `matches.length` — não precisa incluir spectators na contagem. | Spectators pertencem ao histórico de cada match, não à lista resumida. |
| **Modal — Histórico de Partidas (`GameDetailsModal.tsx:63-91`)** | Cada `matchCard` lista só `players`. | **Adicionar sub-seção de Espectadores** dentro de cada `matchCard`, abaixo de jogadores, com título “Espectadores (N)” e lista de nicknames. Se `spectators` vazio/ausente, ocultar seção. | Novo contrato exige visibilidade; espectadores podem ser relevantes para auditoria/suporte. |
| **Modal — Participantes (`GameDetailsModal.tsx:93-127`)** | Lista `participants` com `nickname`, `role`, `isConnected`, `cosmeticsEquipped`. | **Nenhuma mudança.** `ParticipantResponse` não mudou. | — |
| **Modal — Posições (`GameDetailsModal.tsx:129-141`)** | Exibe `Slot X: playerId`. | **Ajuste invisível:** `positions` continua objeto; apenas tipo muda. UI já usa `Object.entries` fallback, então render permanece idêntico. | Correção de tipo não afeta pixel. |
| **Datas** | `finishedAt` formatada com `toLocaleString("pt-BR")`. | **Nenhuma mudança visual;** apenas tipo de `Date`→`string` no modelo. Formatação idêntica. | — |
| **Estados de loading/erro/vazio** | `Table` mostra “Nenhum registro encontrado.” (`Table.tsx:35-40`); refresh com animação `rotating` (`Games.tsx:106`); `notify.error` em catch. | **Manter.** Garantir que erro com `spectators` ausente não quebre modal (fallback `?? []`). | — |
| **Estilos** | Dark theme `#0b0e14`, badges `STATUS` com cores (`Games.module.css:119-136`). | **Reutilizar** `.playerRow`, `.matchCard`, ou adicionar `.spectatorBadge` com mesmos tokens. Nenhum novo token. | Consistência com `Audit`, `Transactions`, `Tickets`. |

**Resumo:** Impacto visual mínimo e localizado — apenas nova lista dentro do `matchCard`. Nenhuma mudança de layout global, rota ou sidebar.

---

## 7. Compatibilidade e Tratamento de Erros

### 7.1 Campos opcionais / retrocompatibilidade

* **`spectators` pode estar ausente** em payloads em cache, em respostas antigas do backend antes do deploy, ou se o backend omitir quando vazio. **Tratar como opcional:** `match.spectators ?? []`, `Array.isArray(match.spectators) ? match.spectators : []`. Nunca assumir `undefined` como erro.
* **`participants`, `matches`, `positions`** — schema sem `required`; usar `game.participants ?? []`, `game.matches ?? []`, `game.positions ?? {}` e optional chaining em todo acesso.
* **`gameName` pode ser vazio** — já tratado com `|| "Partida sem nome"` (`Games.tsx:55`, `GameDetailsModal.tsx:44`); manter.

### 7.2 Tipos e conversão

* **`unlockedAt` / `finishedAt` como string:** Sempre converter na render com `new Date(string).toLocaleString("pt-BR")` ou `toLocaleDateString`. Validar `isNaN(date.getTime())` antes de exibir; fallback para `"—"` se inválido (padrão de `Offers` com `getRemainingTime`).
* **`positions` como objeto:** Nunca chamar `positions.get()` sem checar `instanceof Map`; após correção, usar só `Object.entries`.
* **Enums desconhecidos:** Se `type`/`status`/`role` vier com valor novo não documentado, renderizar fallback `formatEnumValue` (ex.: `Audit.ts:184-186` faz `value.replaceAll("_"," ")`). Para `status`, `getStatusClass` deve ter `default` para `statusFinished` (`GameDetailsModal.tsx:29-36` já tem).
* **`cosmeticsEquipped` vazio:** Já tratado com `p.cosmeticsEquipped && p.cosmeticsEquipped.length > 0` (`GameDetailsModal.tsx:109`); manter.

### 7.3 Erros da API

* **Envelope de erro não documentado em `api.json`:** Nenhum `securitySchemes` nem schema de erro. O projeto assume `HttpResponse` com `code`/`message` (`shared.ts`, `Users.ts:83`). **Recomendação:** Sempre fazer `const response: HttpResponse<...> = await res.json()` mesmo quando `!res.ok` e lançar `new Error(response.message || "Erro desconhecido")`. Capturar no `catch` e chamar `notify.error(message)`. Isso alinha com `Cosmetic.ts:43-50` e `Tickets.ts:61`.
* **Paginação fora do range:** Se `page >= totalPages`, API retorna `content:[]` e `totalPages` correto; UI deve exibir empty state (“Nenhum registro encontrado.”) e desabilitar “Próxima” (`Table.tsx:79`). Não precisa tratamento extra.
* **Token ausente/expirado:** `Authorization: Bearer ${token}` com `token=null` envia `Bearer null` — backend retorna 401; `fetch` cai em `!res.ok`; exibir `notify.error`. Não mudar lógica de auth (`ProtectedLayout.tsx:7`).

### 7.4 LACUNAS / AMBIGUIDADES registradas

| # | Lacuna | Recomendação |
|---|---|---|
| L1 | `MatchHistoryResponse.spectators` não declara `required` nem `minItems`; não se sabe se API sempre envia array vazio ou omite campo quando sem espectadores. | Tratar como opcional e fallback para `[]`. Validar em runtime com `Array.isArray`. |
| L2 | `InventoryItem` em `ParticipantResponse` é `$ref: InventoryItem` com `unlockedAt:date-time`, mas `InventoryItemResponse` (usado em Users/Transactions) não tem `unlockedAt`. São schemas distintos mas semanticamente semelhantes — não confundir. | Manter `InventoryItem` para Games separado; não reutilizar `ItemInventory` de Users (`Users.ts:32-37`). |
| L3 | `Pageable.sort` nunca usado; não há ordenação definida para Games. | Não enviar `sort`; manter `?page=&size=` simples. |
| L4 | `api.json` não documenta códigos de erro nem `securitySchemes`; comportamento real depende de `localStorage.token`. | Seguir padrão existente de `Authorization: Bearer` e `HttpResponse.message`. Não assumir refresh token. |
| L5 | `success:boolean` no `SuccessResponse*` vs `HttpResponse.success` — `code/message` não aparecem nos schemas de sucesso, mas são usados em erro. | Manter `HttpResponse` com `code,message` como tipo ampliado; aceitar que `api.json` só documenta 200. |

---

## 8. Testes e Validação

### 8.1 Cenários normais (happy path)

| Cenário | Passos | Expectativa |
|---|---|---|
| T1 — Listar todas as partidas | Abrir `/admin/games`, clicar “Todas as Partidas” (`showAll=true` → `GET /game?page=0&size=5`). | Tabela preenche com `content`, `page` e `totalPages` corretos; coluna mostra “X partida(as)”. |
| T2 — Listar partidas ativas | Clicar “Em Andamento” (`showAll=false` → `GET /game/active?page=0&size=5`). | Tabela mostra participantes; coluna “X jogador(es)” e lista de nicknames (`Games.tsx:65-70`). |
| T3 — Paginação | Navegar “Próxima”/“Anterior” (`Table.tsx:64-84`). | `page` incrementa, `GET` com novo `page`; botão desabilita em `page===0` e `page+1===totalPages`. |
| T4 — Modal sem histórico | Clicar “Detalhes” em jogo com `matches:[]` e `participants:[...]`. | Modal exibe “Participantes (N)” e “Posições da Sala” se houver; não exibe “Histórico de Partidas”. |
| T5 — Modal com histórico (players) | Jogo com `matches:[{finishedAt,players:[...]}]`. | Modal exibe “Histórico de Partidas (N)”, cada `matchCard` com `players` e `score`, vencedor com `🏆` e `winnerRow` (`GameDetailsModal.tsx:79-87`). `finishedAt` formatado pt-BR. |
| T6 — Modal com histórico (players+spectators) — **novo** | Jogo com `matches:[{finishedAt,players:[...], spectators:[{id,nickname},{...}]}]`. | Em cada `matchCard`, abaixo de jogadores, seção “Espectadores (M)” lista nicknames; se `spectators:[]`, seção oculta. Dados vêm de `MatchHistoryResponse.spectators` (`docs/api.json:5154`). |
| T7 — Posições da sala | Jogo com `positions:{"1":"uuid1","2":"uuid2"}`. | Modal exibe “Slot 1: uuid1”, etc. (`GameDetailsModal.tsx:133-136`). Funciona tanto se `positions` for objeto quanto (defensivo) se vier Map. |

### 8.2 Estados vazios

| Cenário | Expectativa |
|---|---|
| E1 — `content:[]` na listagem | `Table` mostra linha única “Nenhum registro encontrado.” (`Table.tsx:35-40`), paginação com `totalPages=0`, botões desabilitados. |
| E2 — Jogo sem participantes e sem matches | Modal: “Nenhum participante registrado no momento.” (`GameDetailsModal.tsx:125`), sem “Posições da Sala”. |
| E3 — Match com `players:[]` e `spectators:[]` | Modal: `matchCard` com header e data, mas listas vazias sem quebrar layout; seção espectadores oculta. |

### 8.3 Loading

| Cenário | Expectativa |
|---|---|
| L1 — Refresh | Clicar ícone `RotateCcw` (`Games.tsx:104-109`) dispara `fetchGames`, ícone ganha `styles.rotating` por 500ms (`Games.module.css:165`), bloqueia reentrância via `rotating` flag (`Games.tsx:22-23`). |
| L2 — Troca de filtro `showAll` | `setShowAll` reseta `page=0` (`Games.tsx:42-44`) e `useEffect` refaz `fetchGames` com endpoint correto. |

### 8.4 Erros

| Cenário | Expectativa |
|---|---|
| Er1 — `GET /game` retorna 401/403/500 | `catch` chama `notify.error("Erro ao carregar a lista de partidas.")` ou `notify.error(message)` se `response.message` disponível; tabela permanece com dado anterior ou vazio, sem crash. |
| Er2 — Campo `spectators` malformado (ex.: `null` ao invés de array) | UI usa `Array.isArray(match.spectators) ? match.spectators : []`; não quebra, apenas oculta seção. |
| Er3 — `finishedAt` inválido | `new Date(invalido)` resulta `Invalid Date`; exibir fallback `"—"` ou string original; não lançar. |
| Er4 — `positions` ausente/null | `positionsEntries` resulta `[]`; seção “Posições da Sala” não renderiza (condicional `positionsEntries.length>0`). |
| Er5 — Token ausente | `Authorization: Bearer null` → 401 → `notify.error`; usuário permanece na página mas pode ser redirecionado por `ProtectedLayout` ao fazer logout. |

### 8.5 Validações técnicas

* `npm run typecheck` sem erros (tipos `Game`, `MatchHistory`, `SpectatorHistory`, `GamePage` corretos).
* `npm run build` (`tsc -b && vite build`) sem erros.
* `npm run lint` (se aplicável) sem novos warnings em `src/pages/games/*`.
* Verificar que `src/lib/shared.ts` (se tocado) não quebrou `npm run typecheck` em outras features (`Levels`, `Offers`, `Users`, `Transactions`).
* Testar com mocks: mockar `fetch` para `/game` retornando payload com e sem `spectators` e confirmar que modal não quebra.

---

## 9. Critérios de Conclusão

A atualização será considerada concluída quando, cumulativamente:

- [ ] **Contrato consumido corretamente:** `docs/api.json:5141-5161` (`MatchHistoryResponse.spectators`) e `5240` (`SpectatorHistoryResponse`) estão tipados e renderizados; nenhum `// @ts-ignore` ou `any` para esses campos.
- [ ] **`src/pages/games/lib/Games.ts` atualizado:** (a) tipos `Game`, `Participant`, `InventoryItem`, `MatchHistory`, `SpectatorHistory`, `PlayerHistory` refletem `docs/api.json`; (b) `positions` corrigido para `Record<string,string>` (ou wrapper seguro); (c) `unlockedAt`/`finishedAt` tratados como `string` date-time; (d) `getGames` e `getActiveGames` tipados com `HttpResponse<GamePage>` e tratamento de erro unificado (lê `response.message`).
- [ ] **`src/pages/games/Games.tsx` corrigido:** `useEffect` sem `games` na dep list; `fetchGames` consome novo tipo; sem regressão em paginação/filtros/refresh.
- [ ] **`src/pages/games/components/GameInfo/GameDetailsModal.tsx` exibe espectadores:** Para cada `match`, lista `spectators` quando presente, com fallback seguro para `undefined`/`null`/`[]`; `positions` usa `Object.entries` sem assumir `Map`; datas formatadas pt-BR.
- [ ] **`src/pages/games/components/GameInfo/GameDetailsModal.module.css` reutiliza tokens** (se alterado) sem novos valores hard-coded.
- [ ] **`src/lib/shared.ts` (se tocado) corrigido:** `first`/`last` como `boolean` e `npm run typecheck` passa em todo o projeto; caso não tocado, `GamePage` local tipa `boolean` corretamente.
- [ ] **Compatibilidade:** Payloads sem `spectators` (legado/cache) não quebram UI; campos opcionais tratados com `?? []`/`?.`.
- [ ] **UI validada:** Cenários T1-T7, E1-E3, L1-L2, Er1-Er5 descritos na seção 8 foram testados manualmente ou com mocks e comportam-se como especificado.
- [ ] **Qualidade:** `npm run typecheck` e `npm run build` passam; nenhum `console.log` residual; seguir padrões de `Audit.ts`, `Tickets.ts`, `Transactions.tsx` para estilo e mensagens.
- [ ] **Sem escopo extra:** Nenhum arquivo fora da lista da seção 4 foi modificado; nenhum endpoint novo foi inventado; `docs/api.json` não foi alterado.

---

## Apêndice — Referências Cruzadas

* **Padrão de service:** `src/pages/users/lib/Users.ts:69-86` (getUsers com `HttpResponse<GetBody<User>>`, erro com `response.message`), `src/pages/transactions/lib/Transaction.ts`, `src/pages/audit/lib/Audit.ts:244-321` (booleans `first/last`, `string` date-time, `URLSearchParams`).
* **Padrão de página:** `src/pages/transactions/Transactions.tsx`, `src/pages/users/Users.tsx`, `src/pages/levels/Levels.tsx` (header, Table, paginação, notify).
* **Padrão de modal:** `src/pages/games/components/GameInfo/GameDetailsModal.tsx` (overlay, Esc, click stopPropagation) e `src/pages/transactions/components/TransactionInfo/TransactionDetailsModal.tsx`.
* **Tokens visuais:** `src/global.css:37-68`, `src/pages/games/Games.module.css:46-75`, `src/pages/games/components/GameInfo/GameDetailsModal.module.css:211-295`.

