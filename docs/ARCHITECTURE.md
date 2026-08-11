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

## 7. Integrações

### WhatsApp Business
- Endpoint `POST /api/whatsapp/webhook` — recebe eventos, valida token, persiste `WebhookEvent` e processa.
- Processamento: resolve contato pelo telefone, cria/atualiza conversa e mensagem.
- Estratégia detalhada em [ADR-0003](./adr/0003-whatsapp-integration.md).

## 8. Decisões arquiteturais

Ver [docs/adr](./adr/):
- [0001 — Stack tecnológica](./adr/0001-stack.md)
- [0002 — Estrutura monorepo](./adr/0002-monorepo.md)
- [0003 — Integração WhatsApp](./adr/0003-whatsapp-integration.md)
- [0004 — Estratégia de tempo real](./adr/0004-realtime-strategy.md)
- [0005 — Motor de SLA](./adr/0005-sla-engine.md)

## 9. Futuro / evolução

- WebSocket (Socket.IO) para entrega imediata de mensagens — ver ADR-0004.
- Fila de mensagens com Redis para processamento assíncrono.
- Exportação avançada e BI.
