# Tic-Tac-Toe

Jogo da velha multiplayer online construído com Next.js, TypeScript e Tailwind CSS.

## Funcionalidades

- **Single Player** — jogue contra IA com 3 níveis de dificuldade (fácil, médio, difícil) usando algoritmo Minimax
- **Two Players Local** — jogue com um amigo no mesmo dispositivo
- **Online Multiplayer** — partida em tempo real via código de sala ou matchmaking rápido
- **4 Estilos de Tabuleiro** — Classic, Paper, Neon e Chalk com seletor visual
- **Dark Mode** — suporte a tema claro/escuro com detecção automática de preferência do sistema
- **i18n** — disponível em inglês e português (PT-BR)
- **Sons Sintetizados** — efeitos sonoros via Web Audio API com controle de volume por categoria
- **Nicknames** — nicknames opcionais com identificação automática (`player-uuid`)

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Testes | Vitest + Testing Library |
| Deploy | Vercel |

## Arquitetura

```
src/
├── domain/                # Lógica de negócio (zero dependência React)
│   ├── types.ts           # Tipos centrais
│   ├── gameEngine.ts      # Regras do jogo (calculateWinner, checkDraw, makeMove)
│   ├── ai.ts              # IA com Strategy Pattern por dificuldade
│   ├── boardStyles.ts     # Registry de estilos de tabuleiro
│   ├── utils.ts           # Utilitários compartilhados (generateId)
│   ├── roomStore.ts       # Gerenciamento de salas
│   ├── queueStore.ts      # Fila de matchmaking
│   └── onlineStore.ts     # Re-export dos stores acima
│
├── hooks/                 # Estado e lógica de UI
│   ├── useGameState.ts            # Tabuleiro local (2 jogadores)
│   ├── useSinglePlayerGame.ts     # Modo vs IA
│   ├── useOnlineGame.ts           # Orquestrador online (máquina de estados)
│   ├── useOnlineRoom.ts           # Estado da sala, polling, movimentos
│   ├── useOnlineQueue.ts          # Fila de matchmaking
│   ├── useOnlineConnection.ts     # Disconnect via sendBeacon
│   └── useGameSounds.ts           # Sons de jogada e resultado
│
├── components/            # UI stateless
│   ├── Board.tsx / Square.tsx / BoardStyleSelector.tsx
│   ├── GameStatus.tsx / GameActions.tsx
│   ├── DifficultySelect.tsx / PlayerSelect.tsx
│   ├── OnlineGameActions.tsx / OnlineLobby.tsx
│   ├── OnlineQueue.tsx / OnlineMatchmaking.tsx
│   ├── SettingsBar.tsx / Footer.tsx / Home.tsx
│
├── context/
│   └── SettingsContext.tsx         # Tema + idioma + som + estilo do tabuleiro
│
├── utils/
│   └── sounds.ts                  # Sons sintetizados (Web Audio API)
│
├── i18n/
│   └── translations.ts            # Dicionário EN / PT-BR
│
├── app/                   # Next.js App Router
│   ├── page.tsx                    # Home
│   ├── single-player/              # vs IA
│   ├── two-players-local/          # Local 2P
│   ├── online/                     # Multiplayer online
│   └── api/online/                 # API routes
│       ├── room/ (create, join, state, move, restart, disconnect)
│       └── queue/ (enter, poll, exit)
│
└── __tests__/             # 165 testes
    ├── gameEngine.test.ts          # Regras do jogo
    ├── ai.test.ts                  # IA e strategy pattern
    ├── onlineStore.test.ts         # Stores de sala e fila
    ├── api.room.test.ts            # API routes de sala
    ├── api.queue.test.ts           # API routes de fila
    ├── board.test.ts               # Registry e utilitários do tabuleiro
    ├── translations.test.ts        # i18n e interpolação
    ├── sounds.test.ts              # Gate logic de sons
    ├── useSettings.test.tsx        # SettingsContext
    ├── useGameSounds.test.ts       # Hook de sons
    ├── useGameState.test.ts        # Tabuleiro local
    ├── useSinglePlayerGame.test.ts # Modo vs IA
    ├── useOnlineGame.test.ts       # Orquestrador online
    ├── useOnlineRoom.test.ts       # Estado da sala
    ├── useOnlineQueue.test.ts      # Fila de matchmaking
    └── useOnlineConnection.test.ts # Disconnect
```

### Princípios

- **Domain isolada** — lógica de jogo pura em `domain/`, reutilizada por hooks e API routes
- **Strategy Pattern** — dificuldades da IA são estratégias independentes em um mapa, fáceis de estender
- **Registry Pattern** — estilos de tabuleiro em `boardStyles.ts`, adicionar estilo = 1 entrada
- **SRP** — cada hook/store com responsabilidade única (sala, fila, conexão, sons, estado do jogo)
- **ISP** — `useTranslation()` hook thin para componentes que só precisam de tradução
- **DIP** — hooks dependem de abstrações (gameEngine), sounds usa cache sincronizado pelo context
- **Componentes stateless** — recebem dados via props, comunicam ações via callbacks
- **Test gates** — testes rodam automaticamente antes do build, bloqueando deploy se falharem

### Online Multiplayer

Sincronização baseada em polling (adequado para serverless/Vercel):

- **1s** polling de estado do jogo
- **2s** polling de lobby e fila
- **sendBeacon** para disconnect instantâneo ao fechar aba/navegador
- **Optimistic updates** para movimentos (sem latência percebida)
- **Votação de restart** — ambos os jogadores devem confirmar para reiniciar
- Transição matched→playing aguarda carregamento do estado + delay mínimo de UX

## Começando

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev
# → http://localhost:9000

# Testes
npm test

# Build de produção
npm run build
```

## Testes

165 testes cobrindo domain, hooks, context, utils e integração de API:

```bash
npm test           # roda todos os testes
npm run test:watch # modo watch
```

Os testes rodam automaticamente antes do build (`prebuild` script), garantindo que nenhum deploy chegue à produção com testes quebrados.

## Deploy

O deploy é feito na [Vercel](https://vercel.com) com build automático. O `prebuild` garante que os testes passem antes de qualquer deploy.

## Licença

MIT
