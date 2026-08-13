# Arquitetura — Suporte CA3

> Este documento descreve **como** o sistema é construído. O **o quê** está em [PRD.md](./PRD.md).
> Padrão consistente com o **Planner CA3** (consulte [Plano.md](../Plano.md) §1).

---

## 1. Visão geral

O Suporte CA3 é um monorepo com dois blocos principais:

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                        │
│        React 19 + TypeScript + Vite + Tailwind + Zustand     │
│                     Porta 5173 (dev)                         │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTP (JSON) + Bearer JWT
┌───────────────▼──────────────────────────────────────────────┐
│                        Backend (API)                         │
│          Node.js + Express 4 + TypeScript + Prisma           │
│                     Porta 4000                               │
│  rotas → controllers → camada de serviços → Prisma → Postgres│
│  middleware: auth · admin · error-handler · morgan · helmet  │
│  jobs (node-cron): sla-breaches · purge                      │
└───────┬───────────────────────────────┬──────────────────────┘
        │                               │
┌───────▼─────────┐           ┌─────────▼───────────┐
│   PostgreSQL    │           │ WhatsApp Business   │
│  (docker) :5432 │           │  webhook → /api/... │
└─────────────────┘           └─────────────────────┘
```

**Princípio:** camada de serviços (casos de uso) independente de Express; controllers são finos e delegam regras de negócio.

## 2. Módulos do backend

| Camada | Diretório | Responsabilidade |
| --- | --- | --- |
| Entrada HTTP | `server/src/routes` | Define rotas Express |
| Controllers | `server/src/controllers` | Valida entrada, chama serviços, monta resposta HTTP |
| Serviços (casos de uso) | `server/src/lib/services` (via `lib/*`) | Regras de negócio puras |
| Dados | `server/src/lib/prisma.ts` | Cliente Prisma |
| Middleware | `server/src/middleware` | `auth.ts` (JWT), `admin.ts` (role), `error-handler.ts` |
| Jobs | `server/src/jobs` | Tarefas agendadas via node-cron |
| Infra | `server/src/lib` | `sla.ts`, `whatsapp.ts`, `notify.ts` |
| Utilitários | `server/src/utils` | `token.ts`, helpers |
| Types | `server/src/types` | Tipos compartilhados do backend |

### Fluxo de uma requisição
```
HTTP → routes → controller → serviço (caso de uso) → Prisma → PostgreSQL
                                    ↕
                        jobs (node-cron) também usam os serviços
```

## 3. Módulos do frontend

| Camada | Diretório | Responsabilidade |
| --- | --- | --- |
| App/Rotas | `src/app` | `App.tsx`, `routes.tsx` |
| Core | `src/core` | `api/httpClient.ts`, erros, storage |
| Hooks | `src/hooks` | `useAuth`, `usePolling` etc. |
| Módulos | `src/modules` | Feature-slices (login, dashboard, tickets, atendimento, …) |
| Serviços | `src/services` | Wrappers tipados da API |
| Shared | `src/shared` | Componentes, layouts, `styles/tokens.css` |
| Stores | `src/stores` | Zustand (auth, ui, domínios) |
| Types | `src/types` | Tipos compartilhados |
| Utils | `src/utils` | Utilitários |

**Padrão de feature-slice:** cada módulo em `src/modules/<nome>` contém a página (`<Nome>Page.tsx`) e, quando aplicável, um controller/componente local — espelhando o Planner CA3.

## 4. Banco de dados

- PostgreSQL (Docker) + Prisma ORM.
- Migrations versionadas e reversíveis; jobs de seed para ambiente dev.
- Detalhes do schema em [DATA_MODEL.md](./DATA_MODEL.md).

## 5. Segurança

- Senhas com hash **bcryptjs**.
- Autenticação por **JWT** (`JWT_SECRET`) enviado como `Authorization: Bearer`.
- `helmet` para headers de segurança; `cors` restrito por `FRONTEND_URL`.
- Webhook do WhatsApp validado por token (`WEBHOOK_TOKEN`).
- Middleware `auth` (todas as rotas protegidas) e `admin` (apenas ADMIN).

## 6. Jobs agendados (node-cron)

| Job | Frequência | Responsabilidade |
| --- | --- | --- |
| `sla-breaches` | a cada 5 min | Marca violações de SLA em tickets abertos |
| `purge-events` | diário | Limpa eventos de webhook antigos/processados |

## 7. Filas assíncronas (BullMQ + Redis)

Processamento assíncrono via BullMQ com workers que consomem filas Redis.

| Fila | Worker | Responsabilidade |
| --- | --- | --- |
| `suporte-ca3-notifications` | `NotificationJob` | Cria notificações no DB e emite via Socket.IO |
| `suporte-ca3-deliveries` | `MessageDeliveryJob` | Marca mensagens como entregues |
| `suporte-ca3-realtime` | `RealtimeJob` | Broadcast de eventos (conversas, tickets) via Socket.IO |

**Fluxo:** Controllers → `enqueueNotification/enqueueDelivery/enqueueRealtime` → BullMQ → Workers → Prisma + Socket.IO.

**Configuração:** `REDIS_URL` no `.env` (padrão: `redis://localhost:6379`).

**Graceful shutdown:** `stopQueueWorkers()` é chamado no SIGTERM/SIGINT para encerrar workers graciosamente.

## 8. Tempo real (Socket.IO)

- Server: `server/src/lib/realtime.ts` — JWT auth, rooms por `user:{id}`, `role:{role}`, `agents`, `conversation:{id}`.
- Client: `src/core/socket.ts` + `src/hooks/useRealtime.ts` — conecta com token, expõe `useSocketEvent`.
- Eventos: `conversation:new`, `conversation:updated`, `conversation:message`, `ticket:created`, `ticket:updated`, `notification:new`.
- Frontend usa Socket.IO para atualizações imediatas + polling como fallback (5s).

## 9. Integrações

### WhatsApp Business
- Endpoint `POST /api/whatsapp/webhook` — recebe eventos, valida token, persiste `WebhookEvent` e processa.
- Processamento: resolve contato pelo telefone, cria/atualiza conversa e mensagem.
- Emite eventos `conversation:new` e `conversation:message` via Socket.IO para agentes.
- Estratégia detalhada em [ADR-0003](./adr/0003-whatsapp-integration.md).

## 10. Decisões arquiteturais

Ver [docs/adr](./adr/):
- [0001 — Stack tecnológica](./adr/0001-stack.md)
- [0002 — Estrutura monorepo](./adr/0002-monorepo.md)
- [0003 — Integração WhatsApp](./adr/0003-whatsapp-integration.md)
- [0004 — Estratégia de tempo real](./adr/0004-realtime-strategy.md)
- [0005 — Motor de SLA](./adr/0005-sla-engine.md)
- [0006 — Multi-tenancy](./adr/0006-multi-tenancy.md)

## 11. Multi-tenancy

O sistema suporta multi-organização via modelo `Organization`. Todos os dados são escopados por `organizationId`:

- **Schema**: Modelos `User`, `Team`, `Contact`, `Conversation`, `Ticket`, `SlaPolicy`, `CsatRating`, `Notification`, `AuditLog` e `WebhookEvent` possuem FK `organizationId` (NOT NULL, exceto WebhookEvent).
- **JWT**: Token inclui `organizationId`. Middleware `auth` valida a organização e a injeta em `req.user.organizationId`.
- **Controllers**: Todas as queries e creates são filtrados por `organizationId`.
- **Organização ativa**: Middleware verifica se a organização está ativa antes de processar requisições.
- **Seed**: Cria organização padrão "CA3 Tecnologia" e atribui todos os dados existentes a ela.
- **Frontend**: Página `/organizacoes` (admin) para CRUD de organizações.

## 12. Internacionalização (i18n)

- **Biblioteca**: react-i18next + i18next + i18next-browser-languagedetector.
- **Idiomas**: pt-BR (padrão) e en.
- **Traduções**: arquivos `src/i18n/locales/pt-BR.json` e `en.json` com chaves organizadas por módulo (auth, nav, dashboard, tickets, etc.).
- **Detecção**: localStorage > navigator; fallback para pt-BR.
- **Uso**: `useTranslation()` hook em componentes; `t('chave')` para tradução.
- **Language Switcher**: componente `LanguageSwitcher` na página de Configurações.

## 13. PWA (Progressive Web App)

- **Plugin**: vite-plugin-pwa com `registerType: 'autoUpdate'`.
- **Manifest**: name, short_name, description, theme_color, display: standalone, icons SVG.
- **Service Worker**: workbox com globPatterns para assets; runtimeCaching para API (`NetworkFirst`).
- **Meta tags**: theme-color, apple-mobile-web-app-capable, viewport-fit=cover.
- **Offline**: assets cacheados pelo service worker; API com strategy NetworkFirst.

## 14. Futuro / evolução

- Integrações externas (e-mail, SMS, outros canais).
- Relatórios avançados e BI.
- Dashboard CSAT com tendências.
