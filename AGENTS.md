# AGENTS.md — tic-tac-toe_next

Jogo da velha (tic-tac-toe) multiplayer construído com Next.js 16 (App Router), TypeScript, Tailwind CSS e Vitest.

## Arquitetura essencial

- `domain/`: regras puras, tipos, stores online e casos de uso do servidor. Nunca importar React aqui.
- `hooks/`: estado e orquestração da UI. Cada modo de jogo possui um hook dedicado.
- `components/`: apresentação stateless; recebem props e emitem callbacks.
- `app/`: rotas App Router e wrappers finos de API. Rotas online delegam para `domain/`.
- `context/`, `i18n/` e `utils/`: configurações de UI, traduções e infraestrutura compartilhada.
- `__tests__/`: Vitest/jsdom. Mudanças em domain ou hooks exigem testes correspondentes.

Consulte o `README.md` para o inventário completo de arquivos, funcionalidades e cobertura atual.

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
