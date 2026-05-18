# CLAUDE.md — tic-tac-toe_next

Jogo da velha (tic-tac-toe) multiplayer construído com Next.js 16 (App Router), TypeScript, Tailwind CSS e Vitest.

## Arquitetura

```
src/
├── domain/          # Lógica de negócio pura (zero React)
│   ├── types.ts         # Tipos centrais (Player, BoardState, Room, OnlinePhase, etc.)
│   ├── gameEngine.ts    # calculateWinner, checkDraw, makeMove (imutável)
│   ├── ai.ts            # bestMove com strategy pattern por dificuldade
│   ├── boardStyles.ts   # Registry de estilos de tabuleiro (OCP)
│   ├── utils.ts         # generateId (compartilhado entre stores)
│   ├── roomStore.ts     # CRUD de salas, disconnect, cleanup
│   ├── queueStore.ts    # Fila de matchmaking, polling, timeout
│   ├── onlineStorage.ts # Adapter Redis/Upstash com fallback em memória local/testes
│   └── onlineStore.ts   # Re-export thin de roomStore + queueStore
├── hooks/           # Estado e lógica de UI (React hooks)
│   ├── useGameState.ts          # Tabuleiro local (2 jogadores)
│   ├── useSinglePlayerGame.ts   # vs IA (seleção de dificuldade + jogador)
│   ├── useOnlineGame.ts         # Orquestrador online (phase machine)
│   ├── useOnlineRoom.ts         # Estado da sala, polling, movimentos
│   ├── useOnlineQueue.ts        # Fila + callbacks
│   ├── useOnlineConnection.ts   # sendBeacon disconnect
│   └── useGameSounds.ts         # Sons de jogada e resultado (compartilhado)
├── components/      # UI stateless (recebem props, não gerenciam estado)
│   ├── Board.tsx / Square.tsx
│   ├── BoardStyleSelector.tsx   # Seletor visual de estilos
│   ├── GameStatus.tsx / GameActions.tsx
│   ├── DifficultySelect.tsx / PlayerSelect.tsx
│   ├── OnlineGameActions.tsx / OnlineLobby.tsx / OnlineQueue.tsx / OnlineMatchmaking.tsx
│   ├── SettingsBar.tsx / Footer.tsx / Home.tsx
├── context/
│   └── SettingsContext.tsx   # Tema, idioma, som, estilo do tabuleiro (Context + localStorage)
├── utils/
│   └── sounds.ts             # Sons sintetizados via Web Audio API com cache em memória
├── i18n/
│   └── translations.ts      # Dicionário en/pt com interpolação {param}
├── app/             # Next.js App Router
│   ├── page.tsx                 # Home
│   ├── single-player/           # vs IA
│   ├── two-players-local/       # Local 2P
│   ├── online/                  # Multiplayer online
│   └── api/online/              # API routes (REST)
│       ├── room/{create,join,state,move,restart,disconnect}
│       └── queue/{enter,poll,exit}
└── __tests__/       # Vitest (jsdom environment)
    ├── gameEngine.test.ts          # 16 testes
    ├── ai.test.ts                  # 9 testes
    ├── onlineStore.test.ts         # 16 testes
    ├── api.room.test.ts            # Testes de integração API room
    ├── api.queue.test.ts           # Testes de integração API queue
    ├── board.test.ts               # Registry + cellCenter + extend
    ├── translations.test.ts        # translate(), interpolação, fallback
    ├── sounds.test.ts              # Gate logic (isEnabled, cache)
    ├── useSettings.test.tsx        # SettingsContext (tema, locale, som, boardStyle)
    ├── useGameSounds.test.ts       # Hook de sons (win/lose/draw/move)
    ├── useGameState.test.ts        # 6 testes
    ├── useSinglePlayerGame.test.ts # 6 testes
    ├── useOnlineGame.test.ts       # 7 testes
    ├── useOnlineRoom.test.ts       # Estado da sala, polling, restart
    ├── useOnlineQueue.test.ts      # Fila, polling, exit
    └── useOnlineConnection.test.ts # sendBeacon disconnect
```

## Princípios SOLID seguidos

- **SRP**: cada hook/store tem uma responsabilidade (useOnlineRoom = estado da sala, useOnlineQueue = fila, useOnlineConnection = disconnect beacon, useGameSounds = sons)
- **OCP**: AI usa strategy pattern (`difficultyStrategies` map); estilos de tabuleiro usam registry (`boardStyles.ts`) — nova dificuldade/estilo = nova entrada, sem modificar código existente
- **ISP**: `useTranslation()` hook thin para componentes que só precisam de `t()`, sem receber settings completos
- **DIP**: hooks dependem de abstrações (gameEngine), não de implementações; sounds.ts lê de cache em memória sincronizado pelo context

## Convenções

### Tipos
- Tipos centralizados em `src/domain/types.ts`
- `Player = 'X' | 'O'`, `GameResult = Player | 'BOTH' | null`, `BoardState = (Player | null)[]`
- `BoardStyle = 'classic' | 'paper' | 'neon' | 'chalk'`
- Hooks tipados com retorno explícito (não usar `any`)

### Nomenclatura
- Arquivos: camelCase para hooks/utils, PascalCase para componentes
- Diretórios: kebab-case (`two-players-local/`, `single-player/`)
- Hooks: prefixo `use`
- Constantes: UPPER_SNAKE_CASE
- API routes: RESTful com route groups

### Estilo
- Tailwind CSS com `darkMode: 'class'`
- CSS variables em `globals.css` (`--background`, `--foreground`, `--surface`, `--border`)
- 4 estilos de tabuleiro: classic, paper, neon, chalk — configuráveis via registry em `domain/boardStyles.ts`
- Responsive: mobile-first, breakpoints `sm:`, `md:`
- Componentes são stateless: recebem dados via props, comunicam ações via callbacks

### Componentes
- `'use client'` em todo componente que usa hooks ou interatividade
- Props tipadas com interface inline ou type alias
- Sem lógica de negócio em componentes — toda lógica está em hooks ou domain

### Hooks
- Cada modo de jogo tem seu hook: `useGameState` (local), `useSinglePlayerGame` (IA), `useOnlineGame` (online)
- `useOnlineGame` é orquestrador thin que compõe `useOnlineRoom` + `useOnlineQueue` + `useOnlineConnection`
- `useGameSounds` centraliza lógica de sons de jogada e resultado (usado por todas as páginas)
- Hooks locais usam `engineMakeMove` de `gameEngine.ts` para movimentos (não duplicam lógica)
- Estado mutável centralizado no hook; componentes apenas renderizam

### API Routes
- Thin wrappers sobre domain store functions
- Validação de input nas routes
- Usam `gameEngine` para lógica de jogo (não duplicam regras)
- Store online usa Redis/Upstash em produção (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) com fallback em memória para desenvolvimento local/testes

### Online — sincronização
- Polling-based (sem WebSocket)
- 1s para estado do jogo, 2s para lobby/fila
- `navigator.sendBeacon` para disconnect instantâneo
- Otimistic updates para movimentos
- Phase state machine: `select-mode → creating-room → lobby → playing → ...`
- Transição matched→playing aguarda fetchState + delay mínimo de UX

### i18n
- Chaves em dot notation: `'site.title'`, `'online.findingOpponent'`
- Interpolação: `'{name}'` no template → `params.name`
- Fallback para inglês se chave não existir no idioma

### Sons
- Sintetizados via Web Audio API (sem arquivos de áudio)
- Cache em memória sincronizado por `updateSoundCache` do SettingsContext
- Categorias: moves, events, ui — cada uma pode ser desabilitada independentemente
- Volume controlado pelo context (0–100)

## Testes

- **Runner**: Vitest com `environment: 'jsdom'`
- **Lib**: `@testing-library/react` (`renderHook`, `act`)
- **Localização**: `src/__tests__/`
- **Cobertura**:
  - Domain: gameEngine (funções puras), ai (strategy pattern), onlineStore (room + queue), boardStyles (registry)
  - Hooks: useGameState, useSinglePlayerGame, useOnlineGame, useOnlineRoom, useOnlineQueue, useOnlineConnection, useGameSounds
  - Context: SettingsContext (tema, locale, som, boardStyle)
  - Utils: sounds (gate logic), translations (interpolação, fallback)
  - API: room routes, queue routes
- **Mocks**: `vi.spyOn(global, 'fetch')` para API calls, `vi.mock('@/utils/sounds')` para hooks de som, `vi.stubGlobal('AudioContext')` para sons
- **CI**: `prebuild` script roda `vitest run` antes de `next build` (gate deploy Vercel)

## Comandos

```bash
bun run dev          # next dev -p 9000
bun run build        # prebuild (testes) + next build
bun run test         # vitest run
bun run test:watch   # vitest watch
bun run lint         # next lint
```

## Regras para alterações

- Não duplicar lógica de jogo — usar `gameEngine.ts`
- Não colocar lógica de negócio em componentes — usar hooks
- Novas dificuldades de IA: adicionar entrada em `difficultyStrategies` em `ai.ts`
- Novos estilos de tabuleiro: adicionar entrada em `boardStyleConfigs` em `domain/boardStyles.ts` + sub-componente em `Square.tsx`
- Novos modos de jogo: criar hook dedicado seguindo o padrão dos existentes
- Novas chaves de i18n: adicionar em ambos os dicionários (`en` e `pt`) em `translations.ts`
- Toda mudança em domain ou hooks deve ter testes correspondentes
- Manter componentes stateless — estado fica nos hooks
- Sons novos: adicionar função em `sounds.ts` com check de categoria via `isEnabled`
