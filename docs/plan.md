# Plano de Implementação — Auditoria

> **Documento de planejamento técnico.** Nenhuma linha de código foi alterada neste projeto para gerar este plano.
>
> Convenção usada em todo o documento:
> - **[ENCONTRADO]** — fato verificado no código ou em `docs/api.json`, com referência ao arquivo/local.
> - **[DECISÃO]** — decisão de implementação recomendada, fundamentada nos padrões existentes.
> - **[LACUNA]** — informação necessária que não está disponível na API nem no código; não deve ser inventada.

---

## 1. Objetivo

Consumir a nova funcionalidade de **auditoria de negócio** da API Letra a Letra (tag `Audit` em `docs/api.json`) dentro do painel administrativo:

1. Adicionar a seção **"Auditoria"** ao sidebar.
2. Criar a rota `/admin/audit` e uma página de consulta completa (listagem paginada, filtros, ordenação por direção, detalhes do evento).
3. A interface deve parecer **nativa** do painel, reutilizando os componentes, padrões visuais e convenções já existentes.

---

## 2. Contexto Atual

### 2.1 Stack [ENCONTRADO]

| Item | Valor | Fonte |
|---|---|---|
| Framework | React 19 + TypeScript ~6.0 | `package.json` |
| Build | Vite 8 (`tsc -b && vite build`) | `package.json` |
| Roteamento | `react-router-dom` v7 (`createBrowserRouter`) | `src/router.tsx` |
| HTTP | `fetch` nativo (axios está instalado mas **nunca é importado**) | ex.: `src/pages/transactions/lib/Transaction.ts:40` |
| Ícones | `lucide-react` | `src/components/Sidebar/Sidebar.tsx:2-12` |
| Estado global | Contextos próprios (auth, profile, realtime) — sem Redux/React Query/Zustand | `src/main.tsx:16-25` |
| Estilo | CSS Modules por página/componente + `src/global.css` com design tokens (`:root`) | `src/global.css:37-68` |
| Toasts | Hook próprio `useNotification` (success/warning/error) | `src/hooks/notification/useNotification.tsx` |
| Testes | **Nenhuma infraestrutura de teste** (sem vitest/jest/RTL; nenhum arquivo `*.test.*` ou `*.spec.*`) | `package.json`, glob no repo |

### 2.2 Organização de features [ENCONTRADO]

Cada feature vive em `src/pages/<feature>/` com esta forma canônica (ex. transações):

```
src/pages/transactions/
├── Transactions.tsx                  # página (estado local + fetch + render)
├── Transactions.module.css           # estilos da página
├── lib/
│   └── Transaction.ts                # types + classe estática XxxRequests (fetch)
└── components/
    └── TransactionInfo/
        ├── TransactionDetailsModal.tsx      # modal de detalhes
        └── TransactionDetailsModal.module.css
```

Páginas existentes seguindo esse padrão: `users`, `transactions`, `games`, `admins`, `cosmetics`, `offers`, `levels`, `logs`. A nova feature deve seguir exatamente o mesmo formato.

### 2.3 Padrão de página de listagem [ENCONTRADO]

Todas as páginas de listagem seguem o mesmo esqueleto (referência principal: `src/pages/transactions/Transactions.tsx`):

- `<header>` com `.titleGroup` (`h1` + subtítulo descritivo) e `.headerButtons`/`.actions` (botão refresh com ícone girando + SearchBar).
- `<Table<T>>` genérico (`src/components/Table/Table.tsx`) recebendo `data`, `columns` (`Column<T>[]` com `header` + `render`), `renderActions`, `page`, `totalPages`, `nextPage`, `prevPage`.
- Paginação client-side simples: botões "Anterior"/"Próxima" + número da página (`Table.tsx:64-84`). Sem seletor de tamanho de página.
- Tamanho de página usado pelas listagens: **8** (`Users.tsx:28`, `Transactions.tsx:29`); Games usa **5** (`Games.tsx:28`).
- Erros tratados com `notify.error("Erro ao carregar ...")`.
- Empty state da tabela: linha única "Nenhum registro encontrado." (`Table.tsx:35-40`).
- Loading: apenas animação de rotação no botão refresh (`rotating` + `setTimeout(500ms)`); não existe skeleton/spinner genérico. A página Logs usa um texto "Carregando..." (`Logs.tsx:510-512`).
- Detalhes via **modal** (não drawer, não página separada): overlay escuro + caixa central, fecha com Esc/clique no overlay/botão ×.
- Filtros atuais são mínimos: SearchBar (texto + Enter) e, no Games, um par de botões toggle (`filterGroup`/`filterButton`/`filterActive` em `Games.module.css:46-75`). **Não há selects de filtro em páginas de listagem ainda** (selects só aparecem em popups/forms, ex.: `RewardInput.tsx:60`), e **nenhuma persistência de filtros na URL** (estado local puro).

---

## 3. Análise da API

Fonte oficial: `docs/api.json` (OpenAPI). Tag relevante: `"Audit"` — *"Rotas administrativas de consulta da auditoria de negócio"*.

### 3.1 Endpoints [ENCONTRADO]

#### `GET /admin/audit` — busca geral paginada
Query parameters (**todos opcionais**):

| Param | Tipo | Observações |
|---|---|---|
| `targetUserId` | string uuid | usuário alvo do evento |
| `actorId` | string uuid | quem executou |
| `eventType` | enum | `WALLET_CREDITED`, `WALLET_DEBITED`, `COSMETIC_ACQUIRED`, `COSMETIC_REVOKED`, `COSMETIC_EQUIPPED`, `COSMETIC_UNEQUIPPED`, `MATCH_STARTED`, `MATCH_ENDED`, `ROOM_CLOSED_INACTIVITY`, `PLAYER_REMOVED_INACTIVITY`, `MATCHMAKING_PAIRED`, `CATALOG_CHANGED`, `COMMAND_FAILED` |
| `category` | enum | `ECONOMY`, `INVENTORY`, `GAME`, `ACCOUNT`, `ADMINISTRATION`, `OPERATION` |
| `outcome` | enum | `SUCCESS`, `FAILURE` |
| `resourceType` | enum | `WALLET`, `INVENTORY_ITEM`, `COSMETIC`, `OFFER`, `LEVEL`, `USER`, `MATCH`, `ROOM` |
| `resourceId` | string | livre |
| `from` / `to` | date-time | período |
| `requestId` | string | livre |
| `operationId` | string uuid | |
| `correlationId` | string | |
| `transactionId` | string uuid | |
| `page` | int32, default **0** | |
| `size` | int32, default **20** | |
| `direction` | string, default **"DESC"** | único parâmetro de ordenação; **[LACUNA]** não existe parâmetro de propriedade de ordenação documentada (presuma ordenação fixa por data do evento; validar em runtime) |

#### `GET /admin/audit/user/{userId}` — eventos de um usuário alvo
- Path: `userId` (uuid, obrigatório).
- Query aceitas: `eventType`, `category`, `from`, `to`, `page`, `size`.
- **Não aceita** `direction` nem os demais filtros do endpoint geral. **[ENCONTRADO]** — contrato assimétrico; registrar.

#### `GET /admin/audit/resource/{type}/{id}` — eventos de um recurso
- Path: `type` (string), `id` (string) — ambos obrigatórios.
- Query aceitas: `targetUserId`, `from`, `to`, `page`, `size`.

### 3.2 Response envelope [ENCONTRADO]

```
SuccessResponsePageResponseAuditEventResponse
├─ success: boolean
└─ data: PageResponseAuditEventResponse
   ├─ content: AuditEventResponse[]
   ├─ page: int32          # índice atual (0-based)
   ├─ size: int32
   ├─ totalElements: int64
   ├─ totalPages: int32
   ├─ first: boolean       # ← boolean!
   └─ last: boolean        # ← boolean!
```

### 3.3 Schema `AuditEventResponse` [ENCONTRADO]

| Campo | Tipo | Uso recomendado |
|---|---|---|
| `eventId` | uuid | chave/ID exibido em mono |
| `occurredAt` | date-time | coluna temporal + filtro |
| `category` | string | badge |
| `eventType` | string | badge/título |
| `outcome` | string | badge SUCCESS/FAILURE |
| `failureReason` | string | só quando FAILURE |
| `actorType` | string | secundário |
| `actorId` | uuid | secundário (mono) |
| `actorName` | string | coluna "Ator" |
| `targetUserId` | uuid | coluna "Alvo"/filtro |
| `resourceType` | string | badge |
| `resourceId` | string | mono |
| `beforeState` | object (map) | **só no detalhe**, JSON |
| `afterState` | object (map) | **só no detalhe**, JSON |
| `delta` | object (map) | **só no detalhe**, JSON |
| `reasonCode` | string | detalhe |
| `requestId` | string | detalhe (mono) |
| `operationId` | uuid | detalhe (mono) |
| `correlationId` | string | detalhe (mono) |
| `sourceType` / `sourceDetail` | string | detalhe |
| `transactionId` | uuid | detalhe (mono) |
| `metadata` | object (map) | **só no detalhe**, JSON |

Observações:
- No schema, `category`, `eventType`, `outcome` e `resourceType` vêm como `string` simples (os enums estão garantidos apenas nos query params). **[DECISÃO]** tipar no frontend como unions derivadas dos enums dos query params e tratar valor desconhecido com fallback ("—").
- **[LACUNA]** `api.json` documenta somente a resposta 200 para os três endpoints; **não existe schema de erro** nos componentes OpenAPI. O frontend assume envelope `{ success, code, message, data }` (`src/lib/config.ts:16-21`), coerente com o envelope de sucesso, mas o payload real de erro não pode ser confirmado pelo documento.
- **[LACUNA]** `api.json` não define `securitySchemes`. O comportamento real do painel envia `Authorization: Bearer <token>` do `localStorage.token` em todas as chamadas (ex.: `Transaction.ts:38-45`); a auditoria deve seguir isso.

### 3.4 Consistência API × código existente [ENCONTRADO]

Inconsistências pré-existentes entre o frontend e a API (a auditoria **não** deve herdar esses erros):

1. `GetBody` em `src/lib/shared.ts:1-9` tipa `first: number; last: number`, mas a API retorna **boolean** (todas as `PageResponse*` do api.json). Para auditoria, criar tipo próprio com `boolean`.
2. `TransactionReason` em `src/pages/transactions/lib/Transaction.ts:8-14` omite `ADMIN_REVOKE` presente no enum da API. Serve de alerta: **gerar os tipos de auditoria diretamente de `docs/api.json`**, não copiar de tipos vizinhos.
3. O servidor ativo em `src/lib/config.ts:13` é `http://localhost:8080`, igual ao `servers[0].url` do `api.json`. OK.

---

## 4. Arquitetura Atual do Painel

### 4.1 Camadas [ENCONTRADO]

1. **Roteamento** — `src/router.tsx`: rotas públicas (`/`, `/ativar-conta`, `/redefinir-senha`) e área protegida `/admin` → `ProtectedLayout` (checa token) → `AdminLayout` (Sidebar + Header + `<Outlet/>`) → páginas.
2. **Serviços** — classes estáticas `XxxRequests` por feature em `src/pages/<feature>/lib/*.ts`; sem camada compartilhada de cliente HTTP além das constantes `HTTPS`/`HttpResponse` de `src/lib/config.ts`.
3. **Autenticação** — token e id em `localStorage` (`AuthProvider.tsx:10-34`); guard por presença de token (`ProtectedLayout.tsx:7-9`). **Não há controle de permissões por item de sidebar** — todos os admins logados veem tudo.
4. **UI compartilhada** — `Table`, `SearchBar`, `Header`, `Sidebar`, `Notification`, `RewardEditor` (específico de recompensas).
5. **Notificações** — `useNotification().notify.{success,warning,error}` com auto-dismiss de 3s.
6. **Datas** — sempre `new Date(valor)` + `toLocaleDateString("pt-BR")`/`toLocaleTimeString("pt-BR")` (ex.: `TransactionDetailsModal.tsx:131`). Sem dayjs/date-fns/luxon.

### 4.2 Design tokens [ENCONTRADO] (`src/global.css:37-68`)

- Cores: `--primary #6366f1` (+ hover `#4f46e5`, light `rgba(99,102,241,.15)`), backgrounds `#0b0e14` / panel `rgba(20,24,33,.85)` / card `#1e2533` / hover `#242c3e`; texto `#f8fafc`/`#94a3b8`/`#64748b`; bordas `rgba(255,255,255,.05)` e `#334155`.
- Radius: 8/12/16px; sombras `--shadow`, `--shadow-primary`; transição `.2s ease`; `--sidebar-width: 280px`; `--header-height: 72px`.
- Tipografia: Inter; IDs/códigos em `'JetBrains Mono'/'Fira Code', monospace` (`Transactions.module.css:93`).
- Verde sucesso `#10b981` e vermelho `#cf2323`/`#ef4444` para crédito/débito e estados (`Transactions.module.css:113-119`, `GameDetailsModal.module.css:116-119`).
- Badges existentes: pill `rgba(99,102,241,.15)` + texto `#a5b4fc` + borda `rgba(99,102,241,.25)` (`TransactionDetailsModal.module.css:213-222`) e badges de status com bolinha colorida (`Games.module.css:119-136`).
- Botões secundários: fundo `#1e2533`, borda `#334155`, texto `#94a3b8`, hover borda `#6366f1` (`Table.module.css:69-85`).

**Nenhum novo token visual deve ser criado.** A página de Auditoria usará exatamente esses valores.

---

## 5. Integração com a API

### 5.1 Camada de serviço [DECISÃO]

Criar `src/pages/audit/lib/Audit.ts` contendo **tipos + classe estática `AuditRequests`**, replicando o padrão de `src/pages/transactions/lib/Transaction.ts`:

- `fetch` nativo contra `${HTTPS}/admin/audit...`;
- header `Authorization: Bearer ${localStorage.getItem("token")}` e `Content-Type: application/json`;
- `if (!res.ok) throw new Error()` (o catch da página usa `notify.error`, igual às demais páginas);
- retorno de `response.data` tipado.

Métodos previstos:

```ts
static getEvents(filters: AuditFilters, page: number, size: number): Promise<AuditPage>
static getEventsByUser(userId: string, filters, page, size): Promise<AuditPage>
static getEventsByResource(type: string, id: string, filters, page, size): Promise<AuditPage>
```

### 5.2 Querystring [DECISÃO]

Construtor de query params que **ignora valores vazios/null/undefined** (`URLSearchParams` + append condicional). Datas convertidas de `datetime-local` (local) para ISO UTC com `new Date(v).toISOString()` antes de enviar como `from`/`to`.

### 5.3 Tipos [DECISÃO]

Definir no mesmo arquivo:

- `AuditEventType`, `AuditCategory`, `AuditOutcome`, `AuditResourceType` — union types copiados **literalmente** dos enums de `docs/api.json` (seção 3.1);
- `AuditEvent` — espelho de `AuditEventResponse` (seção 3.3), com `beforeState/afterState/delta/metadata: Record<string, unknown> | null`;
- `AuditPage` — `{ content: AuditEvent[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean }` (**com `first/last: boolean`**, corrigindo a inconsistência de `GetBody`);
- `AuditFilters` — objeto com todos os filtros opcionais;
- Mapas de humanização PT-BR (`eventTypeLabel`, `categoryLabel`, `outcomeLabel`, `resourceTypeLabel`) + helper `formatEnum(value)` fallback `value.replaceAll("_", " ")` (padrão já usado em `TransactionDetailsModal.tsx:55`).

### 5.4 Cache/mutations [ENCONTRADO]

O projeto **não possui cache de dados nem camada de mutations** (sem React Query etc.) — cada página refaz o fetch em mudanças de estado. A Auditoria segue o mesmo modelo: fetch direto em `useEffect` + função `refresh()` manual. Nada de cache deve ser introduzido nesta etapa.

---

## 6. Navegação e Sidebar

### 6.1 Como o sidebar funciona [ENCONTRADO] (`src/components/Sidebar/Sidebar.tsx`)

- Array plano `items = [{ label, to, icon }]`, renderizado com `NavLink`;
- active state via `isActive` → classe `.active` (fundo `rgba(99,102,241,.15)` + borda esquerda primária, `Sidebar.module.css:76-81`);
- labels em PT-BR, ícones lucide `size={20}`;
- sem agrupamentos, sem permissões, sem expansão/recolhimento; responsividade tratada pelo grid global (`.layout` em `global.css:70-76`).

### 6.2 Decisões [DECISÃO]

| Item | Decisão | Fundamentação |
|---|---|---|
| Posição | **Após "Logs"** (último item) | Agrupa as duas ferramentas de investigação (Logs e Auditoria) ao final, sem mexer na ordem existente |
| Label | **"Auditoria"** | PT-BR, consistente com "Usuários", "Transações", "Níveis" |
| Ícone | **`History`** (relógio com seta circular) | Conotação de trilha temporal de eventos; não conflita com `ScrollText` (Logs) nem com ícones já usados; presente no lucide-react instalado |
| Rota | **`/admin/audit`** | Segue convenção singular/plural curta das rotas existentes (`/admin/users`, `/admin/logs`) |
| Active state | Automático via `NavLink isActive` | Padrão existente; nenhuma mudança necessária |

Alterações:

1. `src/components/Sidebar/Sidebar.tsx` — importar `History` e adicionar item `{ label: "Auditoria", to: "/admin/audit", icon: History }` após "Logs".
2. `src/router.tsx` — importar `AuditPage` e adicionar `{ path: "audit", element: <AuditPage /> }` como último filho de `AdminLayout` (após `logs`), espelhando a ordem do sidebar.

Breadcrumb: o painel não usa breadcrumbs em páginas de listagem (só na exploração de arquivos de Logs). Não criar breadcrumb. **[DECISÃO]**

---

## 7. Página de Auditoria

Arquivo: `src/pages/audit/Audit.tsx` (+ `Audit.module.css`).

### 7.1 Estrutura geral [DECISÃO] (espelha `Transactions.tsx:107-156`)

```
<div .container>
  <header .header>
    <div .titleGroup>
      <h1>Auditoria</h1>
      <p>Investigue os eventos de negócio registrados pelo sistema.</p>   ← tom dos subtítulos existentes
    </div>
    <div .headerButtons>
      <button .refresh><RotateCcw/></button>      ← refresh manual, mesma animação rotating
    </div>
  </header>

  <section .filters>                              ← NOVO bloco local à página (ver §8)
    selects (Categoria, Evento, Recurso, Resultado)
    período (de/até - datetime-local)
    identificador (SearchBar reutilizada: targetUserId/actorId/resourceId)
    [Filtros avançados] (colapsável): requestId, operationId, correlationId, transactionId
    <button .clearButton>Limpar filtros</button>
  </section>

  <main .content>
    <Table<AuditEvent> ... />                     ← componente compartilhado
  </main>

  <AuditDetailsModal ... />                       ← modal de detalhes
</div>
```

Título/subtítulo, container `max-width: 1200px` centralizado, padding `40px`, gradiente de fundo idêntico aos das outras páginas (`Transactions.module.css:1-19`) — copiar a estrutura do módulo CSS de Transações e ajustar apenas as classes novas de filtro.

### 7.2 Colunas prioritárias da tabela [DECISÃO]

Payload tem 23 campos; a tabela mostra o mínimo para varredura/investigação (padrão "ID / Nome" empilhado já usado em Users/Transactions/Games):

| Coluna | Conteúdo | Render |
|---|---|---|
| **Evento** | `eventType` (badge colorido por categoria) + `eventId` em mono pequeno abaixo | padrão `.info` de `Transactions.tsx:49-56` |
| **Categoria** | badge `category` | pill `#a5b4fc` (`referenceBadge` do modal de transações) |
| **Ator** | `actorName ?? actorType` + `actorId` truncado em mono | padrão ID/Nome |
| **Alvo** | `targetUserId` truncado em mono (tooltip full via `title`) | mono + tooltip |
| **Recurso** | `resourceType` badge + `resourceId` truncado | badge + mono |
| **Resultado** | badge ● `SUCCESS` verde `#10b981` / ● `FAILURE` vermelho, com `title={failureReason}` | padrão de badges do Games (`Games.tsx:77-88`) |
| **Data/Hora** | `occurredAt` formatado pt-BR | `toLocaleString` |
| **Ações** | botão "Detalhes" | `renderActions` |

Identificadores longos (uuids): truncar com CSS (`max-width` + `text-overflow: ellipsis`) e expor valor completo no `title` e no modal — técnica já usada em `participantList` (`Games.module.css:109-116`) e `code` do modal de transações.

### 7.3 Interações extras úteis [DECISÃO]

- Clicar em `targetUserId` de uma linha → aplica filtro `targetUserId` (refina a investigação usando o endpoint/filtro correto).
- No modal, botão "Ver histórico do recurso" quando `resourceType`+`resourceId` existem → chama `getEventsByResource`. Ambos são baratos porque os endpoints já existem; implementar como ações secundárias (links/botões discretos), sem navegação para outra página.

---

## 8. Filtros

Estado local `filters` (objeto único) + `setPage(0)` a cada mudança (mesma regra de `Games.tsx:41-44`). Sem persistência em URL — **o projeto não persiste nenhum filtro na URL hoje**; introduzir isso aqui criaria dois padrões distintos. **[DECISÃO]** seguir o padrão local; limitação registrada em §22.

| Filtro | Input | Valor enviado | Comportamento |
|---|---|---|---|
| Categoria | select 1 opção default "Todas" | `category` (enum ou ausente) | reset de página; combina com tudo |
| Evento | select | `eventType` | idem; opções completas do enum (13) |
| Resultado | select (Todos/Sucesso/Falha) | `outcome` | idem |
| Tipo de recurso | select | `resourceType` | idem |
| Período (De / Até) | dois `datetime-local` | `from` / `to` em ISO UTC | valida `from <= to` no submit; vazio = não envia |
| Usuário alvo | `SearchBar` (texto) | `targetUserId` | dispara no Enter/busca (padrão `trigger="default"`); valida UUID antes de enviar (inválido ⇒ `notify.warning`) |
| Ator | `SearchBar` (texto) | `actorId` | idem |
| ID do recurso | input texto curto | `resourceId` | enviado junto com o select de recurso |
| requestId / operationId / correlationId / transactionId | inputs de texto na área **"Filtros avançados"** (colapsável, fechada por padrão) | campos homônimos | Enter aplica; UUID validado quando aplicável |

Diretrizes:

- **Sem debounce**: o projeto não usa debounce em lugar algum; inputs textuais aplicam no Enter (comportamento do `SearchBar`, `SearchBar.tsx:38-42`) e selects aplicam imediatamente. **[DECISÃO]** manter.
- **Limpar filtros**: botão "Limpar filtros" reseta `filters` + `search terms` + volta à página 0 e refetch.
- **Interação com paginação**: qualquer mudança de filtro ⇒ `page=0`; troca de página mantém filtros.
- Origem das opções: **estáticas**, dos enums do `docs/api.json` (não há endpoint de metadados). **[ENCONTRADO]**
- Estilização dos selects: seguir o estilo dos selects já existentes nos formulários (ex.: `RewardInput.tsx:60`, `EditCosmeticPopup.tsx:112`), com cores do design system; CSS novo fica confinado em `Audit.module.css`.

Endpoint usado pela busca geral: **sempre `GET /admin/audit`** com query params. Os endpoints `/admin/audit/user/{userId}` e `/admin/audit/resource/{type}/{id}` ficam expostos no service para uso pelos atalhos de refinamento (§7.3) — nota: esses dois endpoints aceitam menos filtros; ao usá-los, enviar apenas os suportados. **[ENCONTRADO]**

---

## 9. Listagem e Tabela

- Reutilizar `Table<T>` (`src/components/Table/Table.tsx`) sem modificá-lo — ele já cobre: colunas customizadas, `renderActions`, empty state ("Nenhum registro encontrado."), paginação Anterior/Próxima, overflow-x horizontal (`tableContainer`, `Table.module.css:7-15`).
- `key` das linhas: a tabela usa índice como key (`Table.tsx:42-43`); **não alterar o componente** nesta etapa (risco baixo pois a lista é substituída inteira a cada fetch), mas usar `item.eventId` como dado estável onde possível nas células.
- Ordenação: **não há header clicável** no componente Table e a API não expõe campo de sort. **[DECISÃO]** oferecer apenas o toggle de direção "Mais recentes ⇄ Mais antigas" (par de botões `filterGroup`/`filterActive` do Games) que envia `direction=DESC|ASC` apenas no endpoint geral. Mudança de direção ⇒ `page=0`.

---

## 10. Paginação e Ordenação

Parâmetros [ENCONTRADO]: `page` (0-based, default 0), `size` (default 20), `direction` (default DESC, só no endpoint geral). Metadados: `totalElements`, `totalPages`, `first`, `last`.

Decisões [DECISÃO]:

| Aspecto | Decisão |
|---|---|
| Tamanho de página | `size=8`, alinhado a Users/Transações (`Users.tsx:28`, `Transactions.tsx:29`) |
| Página inicial | `0` |
| Troca de filtros/direção | reset para `0` |
| Página fora do range (ex.: resultado encolheu) | após fetch, se `content.length === 0 && page > 0`, refetch automático com `page = totalPages - 1` (clamp ≥ 0) |
| Total de registros | exibir `totalElements` junto ao paginador (texto discreto `#64748b`), melhoria local sem tocar no `Table` (renderizado acima dele na página) |
| Loading na troca de página | flag `loading` desabilita os botões via estado da própria página (o `Table` já desabilita pelos limites `page===0`/`last`) |
| Preservação de filtros | mantidos em estado durante toda a sessão da página |

---

## 11. Visualização de Detalhes

Modal `src/pages/audit/components/AuditDetailsModal/AuditDetailsModal.tsx` — clone estrutural do `TransactionDetailsModal` (`isOpen`/`entity`/`onClose`, Esc para fechar, overlay click-to-close, footer com "Fechar").

Distribuição das informações [DECISÃO]:

**Header**
- Badge "AUDITORIA" (`.typeBadge`), título = eventType humanizado, sublinha `eventId` em mono.

**Coluna esquerda — "Informações Gerais"** (`infoGrid` 2×N):
- Data/Hora (`occurredAt` pt-BR completo), Categoria (badge), Resultado (badge colorido), Motivo da falha (`failureReason`, só se FAILURE), Ator (nome + `actorType` + id em `<code>`), Usuário alvo (id em `<code>`), Recurso (tipo badge + id `<code>`), `reasonCode`.

**Coluna direita — "Rastreamento"** (cards `infoCard` com linhas `referenceItem`):
- `requestId`, `correlationId`, `operationId`, `transactionId`, `sourceType`, `sourceDetail` — ids em `<code>` scrollável (padrão `.referenceItem code`, `TransactionDetailsModal.module.css:194-211`).

**Rodapé do corpo — "Alterações de Estado" (largura total)**:
- Seções **Antes** (`beforeState`), **Depois** (`afterState`), **Delta** (`delta`), **Metadados** (`metadata`).
- Cada seção renderiza `<pre>{JSON.stringify(obj, null, 2)}</pre>` em container scrollável (`max-height` ~300px, scrollbar estilizada global), com botão "Copiar" (`navigator.clipboard.writeText` + `notify.success`).
- Seções com valor `null`/`{}` são ocultadas.
- Precedente visual: viewer `<pre>` dos logs (`Logs.tsx:606-608`) + cards escuros `#141821`.

Strings muito longas: `word-break: break-word` nos strongs e `overflow-x: auto` nos blocos `<pre>`/`<code>` (ambos já presentes nos CSS citados).

---

## 12. Estados da Interface

| Estado | Tratamento [DECISÃO] | Base [ENCONTRADO] |
|---|---|---|
| Loading inicial/troca | flag `loading`; enquanto ativa, texto discreto sobre a área da tabela ("Carregando eventos...") e refresh desabilitado | `Logs.tsx:508-512` |
| Refresh manual | ícone `RotateCcw` gira por 500ms; guarda `rotating` evita fetch concorrente | `Transactions.tsx:21-39` |
| Erro | `notify.error("Erro ao carregar os registros de auditoria.")`; tabela permanece com último conteúdo/empty | `Transactions.tsx:34-35` |
| Empty | linha padrão do `Table` ("Nenhum registro encontrado.") — o componente não suporta mensagem customizada e **não deve ser alterado** nesta etapa | `Table.tsx:35-40` |
| Filtro inválido (UUID malformado) | `notify.warning` e não dispara request | padrão de avisos existente |
| Sucesso pontual (copiar, atalhos) | `notify.success` | `Transactions.tsx:97` |

---

## 13. UX e Design

Checklist de fidelidade visual (todos [ENCONTRADO], aplicar como especificado):

- Fundo da página: gradiente radial escuro idêntico (`Transactions.module.css:1-11`).
- Cards/painéis: `#1e2533`/`#141821` com borda `rgba(255,255,255,.05)` e radius `12px`.
- Inputs/selects: mesmos esquemas dos popups existentes; foco com borda `--primary`.
- Botões: secundário `#1e2533`/`#334155`→hover `#6366f1`; ativo de filtro `.filterActive` (`#1e2533` + `#a5b4fc`).
- Badges: pill indigo para categoria/recurso; verde `#10b981` sucesso; vermelho falha (tom `#ef4444` do hover danger / `#cf2323` débito — usar `#ef4444` por consistência com `btnDanger`).
- Tipografia: Inter; h1 2.24rem gradiente branco→`#a5b4fc` (`.titleGroup h1`); mono JetBrains para ids.
- Espaçamentos: header margin-bottom 32px, paddings 16–24px, gap 8–14px conforme módulos de referência.
- Hover de linha: `rgba(99,102,241,.03)` (já no `Table.module.css:45-47`).
- Ícones lucide 17–20px inline, herdados do padrão atual.

Proibições: sem novas fontes, sem biblioteca de UI, sem dark/light toggle (o painel é dark-only), sem redesign do `Table`.

---

## 14. Responsividade

Base atual [ENCONTRADO]:

- Layout: grid `260px 1fr`; sidebar fixo (não há versão hamburguer/mobile no código — em telas pequenas o layout simplesmente comprime; `@media` encontradas apenas em nível de página).
- Quebras usadas nas páginas/modais: `900px` (modal 1 coluna) e `768px`/`640px` (headers empilham, grids 1 coluna) (`Transactions.module.css:159-173`, `TransactionDetailsModal.module.css:257-280`).

Decisões [DECISÃO]:

- `≤ 1024px`: filtros em wrap (flex-wrap, gap 8px); selects com largura flexível.
- `≤ 768px`: header empilha (título acima, ações abaixo) — igual media query de `Transactions.module.css:159-168`; filtros em coluna; tabela mantém scroll horizontal nativo do `.tableContainer` (estratégia do projeto para tabelas largas — não criar card-list mobile).
- Modal: herdar breakpoints do modal de transações (grid 1 coluna ≤900px; infoGrid 1 coluna ≤640px).
- Paginação e botões: mantêm-se centralizados; sem alteração.

---

## 15. Segurança e Dados Sensíveis

Análise do schema `AuditEventResponse` [ENCONTRADO]: não há campos de senha/token/header de autenticação; payloads são estados de negócio (carteira, inventário, partidas) e identificadores técnicos.

- **Exibir normalmente:** categorias, tipos, nomes de ator, ids, timestamps, outcome, reasonCode, source*, delta.
- **Atenção:** `beforeState/afterState/metadata` podem conter saldo financeiro e dados de conta do jogador. Isso é coerente com o que o painel já exibe (Transações mostra saldos e emails de usuários — `Users.tsx` coluna Email), portanto **liberado para admin autenticado**. **[DECISÃO]**
- **[LACUNA]** Não é possível verificar, a partir de `docs/api.json`, se a API sanitiza payloads antes de indexar a auditoria (ex.: se algum `metadata` embutirá credenciais de comandos que falharam — `COMMAND_FAILED`). Risco registrado; mitigação no frontend: nunca interpretar esses objetos como HTML (React escapa por padrão), não logá-los no console, e reavaliar mascaramento caso a equipe de API confirme presença de segredos.
- Token JWT: permanece apenas em `localStorage`/header, como no resto do app; nunca renderizado.
- Clipboard: copiar apenas o JSON do objeto específico clicado, nunca o registro inteiro automaticamente.

---

## 16. Performance

- **Server-side first**: paginação, filtros e direção são resolvidos pela API (`page/size/direction` + filtros) — o frontend nunca carrega "tudo". [ENCONTRADO no contrato]
- Payload controlado: `size=8`; objetos grandes (`beforeState` etc.) só chegam dentro das linhas da página corrente — volume pequeno e já limitado pela paginação.
- Sem polling/realtime: atualização sob demanda (refresh manual). **[DECISÃO]** — o caso de uso é investigação, não monitoramento ao vivo; o websocket existente (`RealtimeProvider`) não deve ser acoplado.
- Evitar requests duplicados: guarda `rotating`/`loading` já existente no padrão das páginas.
- Debounce desnecessário: inputs discretos (selects) e submits explícitos.
- Renderização: colunas com strings curtas/truncadas; JSON pesado renderizado **somente** no modal aberto.
- Refetch on filter change apenas quando o filtro realmente muda (setState com objeto novo dispara `useEffect([filters, page])` — garantir comparação por execução de fetch no effect dependendo de `page` e de uma versão serializada dos filtros para evitar loops).

---

## 17. Compatibilidade com o Código Existente

Pontos tocados (todos aditivos, nada quebrado):

1. `src/router.tsx` — 1 import + 1 rota nova. Nenhuma rota existente muda.
2. `src/components/Sidebar/Sidebar.tsx` — 1 import de ícone + 1 item no array. Nenhuma mudança de markup/CSS.
3. Nenhuma alteração em `Table`, `SearchBar`, `Header`, contexts, hooks, `global.css` ou services existentes.
4. A inconsistência de `GetBody.first/last` (§3.4) **não será corrigida globalmente** nesta etapa (risco de afetar páginas existentes); a Auditoria usa seu próprio tipo `AuditPage` com `boolean`. Correção global sugerida como follow-up separado.

---

## 18. Estrutura de Arquivos

### Criar

| Arquivo | Responsabilidade |
|---|---|
| `src/pages/audit/lib/Audit.ts` | Types (`AuditEvent`, `AuditPage`, enums/humanizadores, `AuditFilters`) + classe `AuditRequests` com os 3 métodos (§5). Única dependência: `HTTPS`/`HttpResponse` de `src/lib/config.ts`. |
| `src/pages/audit/Audit.tsx` | Página: estado (`events`, `filters`, `advancedFilters`, `direction`, `page`, `totalPages`, `totalElements`, `loading`, `rotating`, `selectedEvent`), fetch em `useEffect`, handlers de filtros/paginação, montagem de colunas, composição de `Table`, `SearchBar`, filtros e modal. |
| `src/pages/audit/Audit.module.css` | Estilos da página: base copiada de `Transactions.module.css` (container/header/titleGroup/refresh/actionButton/rotating + media queries) + novos `.filters`, `.filterField`, `.advancedToggle`, `.totalInfo`, `.badges` de célula. |
| `src/pages/audit/components/AuditDetailsModal/AuditDetailsModal.tsx` | Modal de detalhes (§11), incluindo seções JSON com copiar. |
| `src/pages/audit/components/AuditDetailsModal/AuditDetailsModal.module.css` | Estilos derivados de `TransactionDetailsModal.module.css` + `.jsonBlock`, `.jsonHeader`, `.copyButton`. |

### Modificar

| Arquivo | Alteração |
|---|---|
| `src/router.tsx` | Import de `AuditPage`; rota `{ path: "audit", element: <AuditPage /> }` após `logs` (linhas 71-73). |
| `src/components/Sidebar/Sidebar.tsx` | Import de `History` do lucide-react; item `Auditoria` após "Logs" no array `items` (linhas 57-61). |

### Não criar / não remover

Nada mais. Não há arquivo a remover; não criar componentes genéricos novos (SelectFilter, JsonViewer etc.) nesta primeira versão — os elementos ficam locais à página seguindo o grau de extração atual do projeto. **[DECISÃO]**

---

## 19. Testes

**[ENCONTRADO]** O projeto **não possui nenhuma infraestrutura de testes** (sem runner, sem configs, zero arquivos de teste). Não existe convenção local a seguir.

Plano honesto, em duas partes:

**Parte 1 — Validação manual (obrigatória, sem novas dependências)** — checklist executável ao final da implementação (detalhado em §21).

**Parte 2 — Testes automatizados (opcional, requer decisão de adicionar tooling)**: caso aprovado, instalar `vitest` + `@testing-library/react` + `jsdom` (devDependencies) e escrever:

- *Unitários*: construtor de query params (ignora vazios; converte datas para ISO); humanizadores de enum; formatação de data; validador de UUID.
- *Integração (página)*: render com mock de `fetch` — loading, listagem, empty, erro (toast), mudança de filtro reseta página, paginação, abertura do modal.
- *E2E*: não há infra (nem Playwright/Cypress); não proponho criar nesta etapa.

A Parte 2 só deve ser executada se o mantenedor aprovar explicitamente novas devDependencies (§22, risco 7).

---

## 20. Sequência de Implementação

Ordem segura, cada passo verificável isoladamente:

1. **Tipos e serviço** — `src/pages/audit/lib/Audit.ts`: enums/unions, mapas de label, `AuditEvent`, `AuditPage` (`first/last: boolean`), `AuditFilters`, `buildAuditQuery()` e classe `AuditRequests` (3 métodos). Compilar (`npm run build`).
2. **Service smoke-test** — conferir contra `docs/api.json` cada param/field nome-por-nome.
3. **Página mínima** — `Audit.tsx` + CSS base (clone de Transações): título, refresh, fetch sem filtros, `Table` com colunas básicas e paginação; rota em `router.tsx`.
4. **Sidebar** — item "Auditoria" com ícone `History`; validar active state.
5. **Filtros principais** — 4 selects + período + SearchBars (alvo/ator) + resourceId; reset de página; limpar filtros.
6. **Filtros avançados** — colapsável com requestId/operationId/correlationId/transactionId + validação UUID.
7. **Direção** — toggle DESC/ASC (endpoint geral).
8. **Badges e células ricas** — cores por categoria/outcome, tooltips, truncamento.
9. **Modal de detalhes** — estrutura, infoCards, rastreamento, blocos JSON + copiar; esconder seções vazias.
10. **Estados de UI** — loading, erro (toasts), clamp de página, warnings de filtro inválido.
11. **Responsividade** — media queries 1024/768 (página) e 900/640 (modal).
12. **Validação final** — checklist do §21 + `npm run lint` + `npm run build`.

---

## 21. Critérios de Aceitação

- [ ] Item **"Auditoria"** aparece no sidebar após "Logs", com ícone coerente, e destaca-se corretamente quando ativo.
- [ ] Rota `/admin/audit` renderiza a página; rota protegida (redirect para `/` sem token); rota inexistente continua redirecionando para `/admin`.
- [ ] Requisições saem para `GET /admin/audit` com `Authorization: Bearer` e **somente** os parâmetros preenchidos; nomes idênticos ao `docs/api.json`.
- [ ] Listagem paginada server-side (`page/size`), botões Anterior/Próxima habilitam/desabilitam conforme limites; `totalElements` visível.
- [ ] Cada filtro (categoria, evento, resultado, recurso, período, alvo, ator, resourceId, avançados) refina os resultados; mudança de filtro volta à página 0; "Limpar filtros" restaura o estado inicial.
- [ ] Toggle de direção alterna DESC/ASC e refaz a consulta (endpoint geral).
- [ ] "Detalhes" abre modal com todas as seções do §11; Esc/overlay/× fecham; blocos JSON formatados com botão copiar funcional; seções nulas ocultas.
- [ ] Atalhos: clicar em usuário-alvo filtra por ele; "histórico do recurso" consulta `/admin/audit/resource/{type}/{id}`.
- [ ] Loading visível durante fetch; erros mostram toast e não quebram a página; lista vazia mostra o empty state padrão.
- [ ] Datas exibidas em pt-BR; filtros de período enviam ISO UTC.
- [ ] Responsivo: filtros empilham e tabela faz scroll horizontal em telas estreitas; modal colapsa para 1 coluna.
- [ ] Nenhum dado sensível além do já exposto pelo painel é revelado; nenhum payload é renderizado como HTML/logado.
- [ ] `npm run lint` e `npm run build` passam sem erros/warnings novos.
- [ ] Checklist manual de testes (§19 Parte 1) executado integralmente.

---

## 22. Riscos e Pontos de Atenção

1. **Sem schema de erro na API** [LACUNA] — `docs/api.json` documenta só 200 para os endpoints de audit. O tratamento assume `!res.ok → throw` (padrão do app) e ignora o corpo do erro. Se a API retornar 4xx com envelope diferente, a UI ainda funciona (toast genérico).
2. **Ordenação ambígua** [LACUNA] — `direction` sem `property` documentada; assumiu-se ordenação por `occurredAt`. Validar em runtime; se o backend ordenar por outro campo, remover o toggle em vez de adivinhar.
3. **Assimetria dos endpoints** [ENCONTRADO] — `/user/{userId}` e `/resource/{type}/{id}` aceitam poucos filtros e **não** aceitam `direction`. Os atalhos devem filtrar a lista de params enviáveis por endpoint.
4. **`GetBody.first/last` numérico vs boolean** [ENCONTRADO] — não reutilizar `GetBody` para auditoria (usar `AuditPage`); correção global fica como follow-up.
5. **Sanitização de payloads pela API** [LACUNA] — impossível confirmar via documento; risco de segredos em `metadata` de `COMMAND_FAILED`. Monitorar; frontend não agrava (escapa HTML, não loga).
6. **Enums em evolução** — se a API adicionou novos `eventType/category`, o select estático fica desatualizado. Mitigação: renderizar valores desconhecidos com fallback humanizado em vez de quebrar.
7. **Ausência de testes automatizados** [ENCONTRADO] — cobertura dependerá de decisão de adicionar Vitest/RTL (dependências novas); até lá, apenas checklist manual.
8. **Sem persistência de filtros na URL** [DECISÃO consciente] — recarregar a página perde o contexto de investigação. Registrar como melhoria futura transversal (afetaria todas as páginas).
9. **`axios` instalado e não usado** [ENCONTRADO] — não iniciar uso agora; não remover (fora de escopo).
10. **Chave de linha por índice no `Table`** [ENCONTRADO] — aceitável no padrão atual (lista substituída integralmente); não alterar o componente compartilhado nesta feature.
11. **Timezone** [ENCONTRADO] — API retorna date-time ISO; painel converte com `new Date()` e exibe no timezone do navegador em pt-BR (padrão de `TransactionDetailsModal.tsx:131`). Filtros `datetime-local` são locais → `toISOString()` (UTC) ao enviar. Cuidado com meia-noite/limites inclusivos do `to` — enviar fim-do-dia `23:59:59.999` quando o usuário escolher só a data? **[DECISÃO]** `datetime-local` inclui horário, então enviar o valor literal escolhido; documentar no placeholder que é horário local.

---

## 23. Checklist Final

- [ ] `docs/api.json` relido durante a implementação antes de codar cada método de `AuditRequests`
- [ ] Tipos gerados exclusivamente do contrato (sem copiar de `GetBody`)
- [ ] 5 novos arquivos criados, 2 modificados (§18) — nada mais
- [ ] Nenhum componente compartilhado alterado
- [ ] Tokens visuais exclusivamente de `global.css`/módulos de referência
- [ ] Lint + build limpos
- [ ] Critérios de aceitação (§21) todos marcados
- [ ] Riscos 1–3 revalidados contra o backend real após primeiro teste integrado
