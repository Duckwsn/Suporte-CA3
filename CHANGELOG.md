# CHANGELOG

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e na convenção de log do Planner CA3.
Cada entrada registra: **data · o que foi feito · por que · impactos conhecidos**.

O log contínuo e detalhado fica em [docs/log.md](./docs/log.md).

## [Unreleased]

### Fase 4 — Escala: i18n + PWA (2026-08-13)

**Adicionado — i18n:**
- **react-i18next** + i18next + i18next-browser-languagedetector instalados.
- **Traduções**: arquivos `pt-BR.json` e `en.json` com ~150 chaves organizadas por módulo.
- **Configuração**: `src/i18n/index.ts` com detecção de idioma (localStorage > navigator) e fallback pt-BR.
- **Sidebar**: todos os itens de navegação usam chaves de tradução.
- **Settings**: seção de idioma com `LanguageSwitcher` (Select pt-BR/en).
- **Components**: `LanguageSwitcher` reutilizável.

**Adicionado — PWA:**
- **vite-plugin-pwa**: configurado com `registerType: 'autoUpdate'`.
- **Manifest**: name, short_name, theme_color, display: standalone, icons SVG.
- **Service Worker**: workbox com cache de assets e runtime caching para API (NetworkFirst).
- **Meta tags**: theme-color, apple-mobile-web-app-capable, viewport-fit=cover.
- **Build**: gera `registerSW.js` e `manifest.webmanifest` automaticamente.

### Fase 4 — Escala: Multi-tenant (2026-08-13)

**Adicionado — Backend:**
- **Organization model**: novo modelo `Organization` no Prisma schema com `id`, `name`, `slug`, `isActive`, `logoUrl`.
- **Tenant scoping**: `organizationId` adicionado como FK NOT NULL em `User`, `Team`, `Contact`, `Conversation`, `Ticket`, `SlaPolicy`, `CsatRating`, `Notification`, `AuditLog` e `WebhookEvent`.
- **JWT**: payload agora inclui `organizationId`; middleware `auth` valida organização ativa.
- **Controllers**: todos os controllers agora filtram e criam dados scoped por `organizationId`.
- **Organization routes**: CRUD completo (`/api/organizations`) com middleware admin.
- **Seed**: cria organização padrão "CA3 Tecnologia" e atribui todos os dados existentes.
- **Backfill script**: `backfill-org.ts` para popular `organizationId` em dados existentes.

**Adicionado — Frontend:**
- **OrganizationsPage** (`/organizacoes`): página admin para listar, criar e ativar/desativar organizações.
- **OrganizationService**: service para CRUD de organizações via API.
- **Sidebar**: link para "Organizações" com ícone `Building2`.
- **Types**: tipo `Organization` adicionado ao frontend; `User` agora inclui `organizationId`.

**Adicionado — Documentação:**
- **ARCHITECTURE.md**: seção 11 (Multi-tenancy) documentando o modelo de dados, JWT, controllers e frontend.
- **DATA_MODEL.md**: diagrama e modelos atualizados com `Organization` e `organizationId` em todas as tabelas.
- **API.md**: endpoints de organizações documentados; register/login atualizados com `organizationId`.
- **ROADMAP.md**: item "Multi-tenant / multi-organização" marcado como concluído.

**Mudado:**
- **token.ts**: `TokenPayload` agora inclui `organizationId`.
- **auth.ts** (middleware): valida organização ativa e injeta `organizationId` em `req.user`.
- **notify.ts**: funções `notify`, `notifyTeam`, `notifyAllAgents` agora aceitam `organizationId`.
- **queue/index.ts**: `NotificationJob` inclui `organizationId`; workers filtram por organização.

### Fase 3 — Inteligência operacional concluída (2026-08-13)

**Corrigido:**
- **conversation-controller.ts**: eventos Socket.IO usavam `'conversation:$1'` (inválido); corrigido para `'conversation:new'`.
- **report-controller.ts**: warnings de spread desnecessário no lint (unicorn/no-useless-spread).
- **queue/index.ts**: conexão Redis agora lê `REDIS_URL` do ambiente em vez de hardcoded `localhost:6379`.
- **docker-compose.yml**: removido atributo `version` obsoleto.

**Adicionado — Backend:**
- **Socket.IO**: eventos `ticket:created` e `ticket:updated` em ticket-controller; eventos `conversation:new` e `conversation:message` em whatsapp-controller.
- **BullMQ/Redis**: `notify()` unificado para usar fila; graceful shutdown com `stopQueueWorkers()`; `REDIS_URL` configurável via ambiente.
- **Realtime**: rooms por conversa (`conversation:{id}`) com join/leave via Socket.IO; tipo `RealtimeJob` estendido para ticket events.

**Adicionado — Frontend:**
- **Página CSAT** (`/csat`): dashboard dedicado com nota média, distribuição de notas, breakdown por atendente/equipe, alertas para avaliações baixas.
- **Relatórios**: filtros de período (date range picker); seção de Análise com breakdowns por status, prioridade, categoria e canal.
- **Tickets**: `useSocketEvent` para `ticket:created` e `ticket:updated` (atualização em tempo real).
- **Sidebar**: link para CSAT.

**Adicionado — Qualidade:**
- **Testes unitários**: vitest configurado no backend; 9 testes (SLA engine, token utilities).
- **docs**: ARCHITECTURE.md atualizado com seções de filas, Socket.IO e WhatsApp; API.md atualizado com endpoints de analytics e CSAT; ROADMAP.md refletindo estado real.

### Adicionado (2026-08-11)
- **Fase 1 — Núcleo (MVP)** concluída: login, dashboard, atendimento, tickets (+ Novo ticket), contatos, equipes e relatórios com export CSV.
- **Fase 2 — Operação** parcial: webhook WhatsApp validado E2E, notificações com polling, painel de administração.
- Infraestrutura Docker (postgres:18 + redis); backend Express/Prisma; git + GitHub configurados.

### Adicionado (2026-08-12)
- **Fase 1 → Fase 2 concluídas**: suíte E2E Playwright (`e2e/`) validando o fluxo cliente→atendente→ticket.

### Pendente (próximas fases)
- Fase 4: multi-tenant, i18n, PWA e integrações externas.
