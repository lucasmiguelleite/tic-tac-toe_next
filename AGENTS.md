# AGENTS.md — tic-tac-toe_next

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
│   ├── roomStore.ts     # CRUD de salas, disconnect e cleanup
│   ├── queueStore.ts    # Fila de matchmaking, polling de fallback e timeout
│   ├── onlineStorage.ts # Redis/Upstash, memória local/testes e Pub/Sub
│   ├── onlineEvents.ts  # Canais e publicação de eventos de sala/fila
│   ├── onlineGame.ts    # Casos de uso online; regras e autorização do servidor
│   └── onlineStore.ts   # Re-export thin de roomStore + queueStore
├── hooks/           # Estado e lógica de UI (React hooks)
│   ├── useGameState.ts          # Tabuleiro local (2 jogadores)
│   ├── useSinglePlayerGame.ts   # vs IA (seleção de dificuldade + jogador)
│   ├── useOnlineGame.ts         # Orquestrador online (phase machine)
│   ├── useOnlineRoom.ts         # Estado da sala, polling de fallback e movimentos
│   ├── useOnlineQueue.ts        # Fila, callbacks e polling de fallback
│   ├── useOnlineConnection.ts   # sendBeacon disconnect
│   ├── useOnlineRealtime.ts     # WebSocket de sala, reconexão exponencial
│   ├── useOnlineQueueRealtime.ts # WebSocket de fila, reconexão exponencial
│   └── useGameSounds.ts         # Sons de jogada e resultado (compartilhado)
├── components/      # UI stateless (recebem props, não gerenciam estado)
│   ├── Board.tsx / Square.tsx
│   ├── BoardStyleSelector.tsx   # Seletor visual de estilos
│   ├── GameStatus.tsx / GameActions.tsx
│   ├── DifficultySelect.tsx / PlayerSelect.tsx
│   ├── OnlineGameActions.tsx / OnlineLobby.tsx / OnlineQueue.tsx / OnlineMatchmaking.tsx
│   ├── SettingsBar.tsx / Footer.tsx / Home.tsx / ClickSoundProvider.tsx
├── context/
│   └── SettingsContext.tsx   # Tema, idioma, som, estilo do tabuleiro (Context + localStorage)
├── utils/
│   ├── sounds.ts             # Sons sintetizados via Web Audio API com cache em memória
│   └── fetchWithRetry.ts     # Fetch online com retry
├── i18n/
│   └── translations.ts      # Dicionário en/pt com interpolação {param}
├── app/             # Next.js App Router
│   ├── page.tsx                 # Home
│   ├── single-player/           # vs IA
│   ├── two-players-local/       # Local 2P
│   ├── online/                  # Multiplayer online
│   ├── manifest.ts / robots.ts / sitemap.ts # PWA/SEO
│   ├── structured-data.tsx / opengraph-image.tsx / icon.tsx # Metadados visuais
│   └── api/online/              # API REST + endpoint WebSocket
│       ├── room/{create,join,state,move,restart,disconnect}
│       └── queue/{enter,poll,exit}
└── __tests__/       # Vitest (jsdom environment; 19 arquivos / 185 testes)
    ├── gameEngine.test.ts          # Regras puras do jogo
    ├── ai.test.ts                  # IA e strategy pattern
    ├── onlineStore.test.ts         # Stores de sala e fila
    ├── onlineStorage.test.ts       # Storage e Pub/Sub
    ├── api.room.test.ts            # Testes de integração API room
    ├── api.queue.test.ts           # Testes de integração API queue
    ├── board.test.ts               # Registry + cellCenter + extend
    ├── translations.test.ts        # translate(), interpolação, fallback
    ├── sounds.test.ts              # Gate logic (isEnabled, cache)
    ├── useSettings.test.tsx        # SettingsContext (tema, locale, som, boardStyle)
    ├── useGameSounds.test.ts       # Hook de sons (win/lose/draw/move)
    ├── useGameState.test.ts        # Tabuleiro local
    ├── useSinglePlayerGame.test.ts # Modo vs IA
    ├── useOnlineGame.test.ts       # Orquestrador online
    ├── useOnlineRoom.test.ts       # Estado da sala, fallback e restart
    ├── useOnlineQueue.test.ts      # Fila, fallback e exit
    ├── useOnlineRealtime.test.ts   # WebSocket de sala
    ├── useOnlineQueueRealtime.test.ts # WebSocket de fila
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
- `useOnlineGame` orquestra `useOnlineRoom`, `useOnlineQueue`, `useOnlineConnection` e os hooks de WebSocket.
- WebSockets transportam atualizações de estado; REST e `onlineGame.ts` continuam sendo a fonte autoritativa. Não duplicar regras em eventos de socket.
- Polling é somente fallback: 1s para estado da sala e 2s para lobby/fila quando necessário.
- `useGameSounds` centraliza lógica de sons de jogada e resultado (usado por todas as páginas)
- Hooks locais usam `engineMakeMove` de `gameEngine.ts` para movimentos (não duplicam lógica)
- Estado mutável centralizado no hook; componentes apenas renderizam

### API Routes
- Rotas REST são wrappers finos sobre `onlineGame.ts` e stores; o endpoint `api/online/realtime` faz upgrade WebSocket.
- Validação de input nas routes
- Usam `gameEngine` para lógica de jogo (não duplicam regras)
- Store online usa Redis/Upstash em produção (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) com fallback em memória para desenvolvimento local/testes

### Online — sincronização
- WebSocket por sala e por fila, com reconexão exponencial (1s a 30s).
- Eventos Redis Pub/Sub invalidam clientes entre instâncias; o cliente lê o estado autoritativo recebido do servidor.
- Polling de fallback: 1s para estado do jogo e 2s para lobby/fila.
- `navigator.sendBeacon` para disconnect instantâneo
- Otimistic updates para movimentos
- Phase state machine: `select-mode → creating-room → lobby → playing → ...`
- Transição `matched → playing` aguarda o estado inicial do socket e um delay mínimo de UX.

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
  - Domain: gameEngine (funções puras), ai (strategy pattern), onlineStore (room + queue), onlineStorage, boardStyles e eventos online
  - Hooks: useGameState, useSinglePlayerGame, useOnlineGame, useOnlineRoom, useOnlineQueue, useOnlineRealtime, useOnlineQueueRealtime, useOnlineConnection, useGameSounds
  - Context: SettingsContext (tema, locale, som, boardStyle)
  - Utils: sounds (gate logic), translations (interpolação, fallback)
  - API: room e queue routes; o comportamento de realtime é coberto nos hooks.
- **Mocks**: `vi.spyOn(global, 'fetch')` para API calls, `vi.mock('@/utils/sounds')` para hooks de som, `vi.stubGlobal('AudioContext')` para sons
- **CI**: `prebuild` script roda `vitest run` antes de `next build` (gate deploy Vercel)

## Comandos

```bash
bun run dev          # next dev -p 9000
bun run build        # prebuild (testes) + next build
bun run test         # vitest run
bun run test:watch   # vitest watch
bun run lint         # eslint .
```

## Regras para alterações

- Não duplicar lógica de jogo — usar `gameEngine.ts`
- Não colocar lógica de negócio em componentes — usar hooks
- Novas dificuldades de IA: adicionar entrada em `difficultyStrategies` em `ai.ts`
- Novos estilos de tabuleiro: adicionar entrada em `boardStyleConfigs` em `domain/boardStyles.ts` + sub-componente em `Square.tsx`
- Novos modos de jogo: criar hook dedicado seguindo o padrão dos existentes
- Novas chaves de i18n: adicionar em ambos os dicionários (`en` e `pt`) em `translations.ts`
- Toda mudança em domain ou hooks deve ter testes correspondentes
- Mudanças na sincronização online devem preservar REST como fonte autoritativa, publicar eventos via `onlineEvents.ts` e manter o polling de fallback.
- Manter componentes stateless — estado fica nos hooks
- Sons novos: adicionar função em `sounds.ts` com check de categoria via `isEnabled`
