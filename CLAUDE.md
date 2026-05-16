# CLAUDE.md — tic-tac-toe_next

Jogo da velha (tic-tac-toe) multiplayer construído com Next.js 16 (App Router), TypeScript, Tailwind CSS e Vitest.

## Arquitetura

```
src/
├── domain/          # Lógica de negócio pura (zero React)
│   ├── types.ts         # Tipos centrais (Player, BoardState, Room, OnlinePhase, etc.)
│   ├── gameEngine.ts    # calculateWinner, checkDraw, makeMove (imutável)
│   ├── ai.ts            # bestMove com strategy pattern por dificuldade
│   ├── roomStore.ts     # CRUD de salas, disconnect, cleanup
│   ├── queueStore.ts    # Fila de matchmaking, polling, timeout
│   └── onlineStore.ts   # Re-export thin de roomStore + queueStore
├── hooks/           # Estado e lógica de UI (React hooks)
│   ├── useGameState.ts          # Tabuleiro local (2 jogadores)
│   ├── useSinglePlayerGame.ts   # vs IA (seleção de dificuldade + jogador)
│   ├── useOnlineGame.ts         # Orquestrador online (phase machine)
│   ├── useOnlineRoom.ts         # Estado da sala, polling, movimentos
│   ├── useOnlineQueue.ts        # Fila + callbacks
│   └── useOnlineConnection.ts   # sendBeacon disconnect
├── components/      # UI stateless (recebem props, não gerenciam estado)
│   ├── Board.tsx / Square.tsx
│   ├── GameStatus.tsx / GameActions.tsx
│   ├── DifficultySelect.tsx / PlayerSelect.tsx
│   ├── OnlineGameActions.tsx / OnlineLobby.tsx / OnlineQueue.tsx / OnlineMatchmaking.tsx
│   ├── SettingsBar.tsx / Footer.tsx / Home.tsx
├── context/
│   └── SettingsContext.tsx   # Tema (light/dark) + idioma (en/pt) via Context + localStorage
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
    ├── gameEngine.test.ts       # 16 testes
    ├── ai.test.ts               # 9 testes
    ├── onlineStore.test.ts      # 16 testes
    ├── useGameState.test.ts     # 6 testes
    ├── useSinglePlayerGame.test.ts  # 6 testes
    └── useOnlineGame.test.ts    # 7 testes
```

## Princípios SOLID seguidos

- **SRP**: cada hook/store tem uma responsabilidade (useOnlineRoom = estado da sala, useOnlineQueue = fila, useOnlineConnection = disconnect beacon)
- **OCP**: AI usa strategy pattern (`difficultyStrategies` map) — nova dificuldade = nova entrada no mapa, sem modificar `bestMove`
- **DIP**: hooks dependem de abstrações (gameEngine), não de implementações

## Convenções

### Tipos
- Tipos centralizados em `src/domain/types.ts`
- `Player = 'X' | 'O'`, `GameResult = Player | 'BOTH' | null`, `BoardState = (Player | null)[]`
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
- Responsive: mobile-first, breakpoints `sm:`, `md:`
- Componentes são stateless: recebem dados via props, comunicam ações via callbacks

### Componentes
- `'use client'` em todo componente que usa hooks ou interatividade
- Props tipadas com interface inline ou type alias
- Sem lógica de negócio em componentes — toda lógica está em hooks ou domain

### Hooks
- Cada modo de jogo tem seu hook: `useGameState` (local), `useSinglePlayerGame` (IA), `useOnlineGame` (online)
- `useOnlineGame` é orquestrador thin que compõe `useOnlineRoom` + `useOnlineQueue` + `useOnlineConnection`
- Estado mutável centralizado no hook; componentes apenas renderizam

### API Routes
- Thin wrappers sobre domain store functions
- Validação de input nas routes
- Usam `gameEngine` para lógica de jogo (não duplicam regras)
- Store é in-memory (`Map`) — adequado para demo/serverless

### Online — sincronização
- Polling-based (sem WebSocket)
- 1s para estado do jogo, 2s para lobby/fila
- `navigator.sendBeacon` para disconnect instantâneo
- Otimistic updates para movimentos
- Phase state machine: `select-mode → creating-room → lobby → playing → ...`

### i18n
- Chaves em dot notation: `'site.title'`, `'online.findingOpponent'`
- Interpolação: `'{name}'` no template → `params.name`
- Fallback para inglês se chave não existir no idioma

## Testes

- **Runner**: Vitest com `environment: 'jsdom'`
- **Lib**: `@testing-library/react` (`renderHook`, `act`)
- **Localização**: `src/__tests__/`
- **Cobertura**:
  - Domain: gameEngine (funções puras), ai (strategy pattern), onlineStore (room + queue)
  - Hooks: useGameState, useSinglePlayerGame, useOnlineGame (fetch mockado)
- **Mocks**: `vi.spyOn(global, 'fetch')` para API calls, `Object.defineProperty(navigator, 'sendBeacon')` para beacon
- **CI**: `prebuild` script roda `vitest run` antes de `next build` (gate deploy Vercel)

## Comandos

```bash
npm run dev          # next dev -p 9000
npm run build        # prebuild (testes) + next build
npm test             # vitest run
npm run test:watch   # vitest watch
npm run lint         # next lint
```

## Regras para alterações

- Não duplicar lógica de jogo — usar `gameEngine.ts`
- Não colocar lógica de negócio em componentes — usar hooks
- Novas dificuldades de IA: adicionar entrada em `difficultyStrategies` em `ai.ts`
- Novos modos de jogo: criar hook dedicado seguindo o padrão dos existentes
- Novas chaves de i18n: adicionar em ambos os dicionários (`en` e `pt`) em `translations.ts`
- Toda mudança em domain ou hooks deve ter testes correspondentes
- Manter componentes stateless — estado fica nos hooks
