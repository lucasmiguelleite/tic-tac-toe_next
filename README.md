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
│   ├── onlineStorage.ts   # Redis/Upstash, memória local e Pub/Sub
│   ├── onlineEvents.ts    # Canais e eventos de invalidação em tempo real
│   ├── onlineGame.ts      # Casos de uso online (estado, jogada, restart)
│   └── onlineStore.ts     # Re-export dos stores de sala e fila
│
├── hooks/                 # Estado e lógica de UI
│   ├── useGameState.ts            # Tabuleiro local (2 jogadores)
│   ├── useSinglePlayerGame.ts     # Modo vs IA
│   ├── useOnlineGame.ts           # Orquestrador online (máquina de estados)
│   ├── useOnlineRoom.ts           # Estado da sala, polling de fallback e movimentos
│   ├── useOnlineQueue.ts          # Fila de matchmaking e polling de fallback
│   ├── useOnlineConnection.ts     # Disconnect via sendBeacon
│   ├── useOnlineRealtime.ts       # WebSocket da sala
│   ├── useOnlineQueueRealtime.ts  # WebSocket da fila
│   └── useGameSounds.ts           # Sons de jogada e resultado
│
├── components/            # UI stateless
│   ├── Board.tsx / Square.tsx / BoardStyleSelector.tsx
│   ├── GameStatus.tsx / GameActions.tsx
│   ├── DifficultySelect.tsx / PlayerSelect.tsx
│   ├── OnlineGameActions.tsx / OnlineLobby.tsx
│   ├── OnlineQueue.tsx / OnlineMatchmaking.tsx
│   ├── SettingsBar.tsx / Footer.tsx / Home.tsx
│   └── ClickSoundProvider.tsx     # Som global de interação
│
├── context/
│   └── SettingsContext.tsx         # Tema + idioma + som + estilo do tabuleiro
│
├── utils/
│   ├── sounds.ts                  # Sons sintetizados (Web Audio API)
│   └── fetchWithRetry.ts          # Requisições online com retry
│
├── i18n/
│   └── translations.ts            # Dicionário EN / PT-BR
│
├── app/                   # Next.js App Router
│   ├── page.tsx                    # Home
│   ├── single-player/              # vs IA
│   ├── two-players-local/          # Local 2P
│   ├── online/                     # Multiplayer online
│   ├── manifest.ts / robots.ts / sitemap.ts
│   ├── structured-data.tsx / opengraph-image.tsx / icon.tsx
│   └── api/online/                 # REST e WebSocket
│       ├── room/ (create, join, state, move, restart, disconnect)
│       └── queue/ (enter, poll, exit)
│
└── __tests__/             # 19 arquivos / 187 testes
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
    ├── useOnlineRealtime.test.ts   # WebSocket de sala
    ├── useOnlineQueueRealtime.test.ts # WebSocket de fila
    └── onlineStorage.test.ts       # Storage e Pub/Sub
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

Sincronização híbrida, adequada para serverless/Vercel:

- **WebSocket por sala** para atualizar jogadas, entrada do oponente, restart e disconnect imediatamente
- **Polling de fallback** (1s/2s) para recuperar estado após uma conexão WebSocket cair ou expirar
- **2s** polling de lobby e fila
- **Redis/Upstash** para persistir salas e fila entre invocações serverless
- **Redis Pub/Sub** para propagar eventos entre instâncias da Vercel
- **sendBeacon** para disconnect instantâneo ao fechar aba/navegador
- **Optimistic updates** para movimentos (sem latência percebida)
- **Votação de restart** — ambos os jogadores devem confirmar para reiniciar
- Transição matched→playing aguarda carregamento do estado + delay mínimo de UX

Em produção, configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (ou os aliases da integração Vercel KV: `KV_REST_API_URL` e `KV_REST_API_TOKEN`). Sem elas, o app usa fallback em memória para desenvolvimento local e testes.

## Começando

```bash
# Instalar dependências
bun install

# Desenvolvimento
bun run dev
# → http://localhost:9000

# Testes
bun run test

# Build de produção
bun run build
```

## Testes

187 testes, em 19 arquivos, cobrindo domain, hooks, context, utils e integração de API:

```bash
bun run test           # roda todos os testes
bun run test:watch     # modo watch
```

Os testes rodam automaticamente antes do build (`prebuild` script), garantindo que nenhum deploy chegue à produção com testes quebrados.

## Deploy

O deploy de produção é feito na [Vercel](https://vercel.com) pelo workflow do GitHub Actions, usando Bun (detectado pelo campo `packageManager` no `package.json`). O `prebuild` garante que os testes passem antes de qualquer deploy.

### CI/CD

O workflow de CI valida automaticamente cada pull request e push com `lint`, testes e build. O workflow de CD só inicia após uma execução bem-sucedida do CI em um push para `main`; pull requests nunca solicitam deploys.

Os testes são executados uma única vez na etapa de validação; os builds do CI e da Vercel usam `SKIP_PREBUILD_TESTS=true` porque dependem dessa validação bem-sucedida.

Proteja a branch `main` em **Settings → Rules → Rulesets** (ou **Branches**) exigindo pull requests e o status check `Lint, test, and build` antes do merge.

Para exigir autorização de mantenedores antes do deploy, configure o ambiente `production` no repositório em **Settings → Environments** e adicione os mantenedores como **Required reviewers**. Também adicione os seguintes secrets de repositório:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

O job de deploy fica pendente após a validação até que um revisor autorizado clique em **Approve and deploy**. Habilite também a opção de impedir autoaprovação para que quem iniciou o deploy não possa aprová-lo.

Desative o deploy automático da integração Git da Vercel para produção; caso permaneça ativo, um push para `main` poderá contornar a aprovação do ambiente do GitHub.

## Licença

MIT
