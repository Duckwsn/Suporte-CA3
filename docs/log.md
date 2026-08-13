# Log de desenvolvimento — Suporte CA3

> Registro contínuo de decisões e mudanças relevantes. Formato: **data · o que · por que · impactos**.
> Visão resumida no [CHANGELOG.md](../CHANGELOG.md).

---

## 2026-08-13 — Fase 4: i18n + PWA

**O que:**
- Instalado react-i18next, i18next e i18next-browser-languagedetector.
- Criados arquivos de tradução pt-BR.json e en.json com ~150 chaves por módulo.
- Configuração i18n em `src/i18n/index.ts` com detecção de idioma e fallback pt-BR.
- Sidebar usa chaves de tradução para todos os itens de navegação.
- Página de Configurações inclui LanguageSwitcher (pt-BR/en).
- Componente `LanguageSwitcher` reutilizável criado.
- vite-plugin-pwa configurado com manifest, service worker (workbox) e runtime caching.
- Meta tags PWA adicionadas ao index.html (theme-color, apple-mobile-web-app, viewport-fit).
- Build gera registerSW.js e manifest.webmanifest automaticamente.

**Por que:**
- i18n permite expandir para mercados internacionais sem refatorar componentes.
- PWA melhora a experiência em mobile (instalação, offline, performance).
- Ambos são pré-requisitos para escala SaaS global.

**Impactos conhecidos:**
- Traduções atuais são apenas pt-BR e en; outros idiomas precisam de novos arquivos.
- Service worker pode causar caches stale em deploy; `autoUpdate` resolve automaticamente.
- Alguns componentes ainda usam textos hardcoded (serão migrados gradualmente).

---

## 2026-08-13 — Fase 4: Multi-tenant

**O que:**
- Adicionado modelo `Organization` ao Prisma schema com `id`, `name`, `slug`, `isActive`, `logoUrl`.
- Adicionado `organizationId` (FK NOT NULL) a todos os modelos de dados: User, Team, Contact, Conversation, Ticket, SlaPolicy, CsatRating, Notification, AuditLog, WebhookEvent.
- Ticket.number agora é sequencial único por organização (não mais global).
- JWT payload inclui `organizationId`; middleware `auth` valida organização ativa.
- Todos os controllers atualizados para filtrar e criar dados scoped por `organizationId`.
- CRUD de organizações via API (`/api/organizations`) com middleware admin.
- Seed cria organização padrão "CA3 Tecnologia" e atribui todos os dados existentes.
- Script `backfill-org.ts` para popular `organizationId` em dados existentes.
- Frontend: OrganizationsPage (`/organizacoes`) para CRUD de organizações.
- Sidebar: link para "Organizações" com ícone `Building2`.
- Types: tipo `Organization` adicionado; `User` inclui `organizationId`.
- Documentação: ARCHITECTURE.md, DATA_MODEL.md, API.md, ROADMAP.md, CHANGELOG.md atualizados.

**Por que:**
- Multi-tenancy é pré-requisito para escala SaaS — permite múltiplas organizações no mesmo banco.
- Scoping por `organizationId` garante isolamento de dados entre organizações.
- Organização ativa no JWT evita queries desnecessárias ao banco para validação.

**Impactos conhecidos:**
- Todos os endpoints agora requerem `organizationId` no token (obtido via login).
- Register agora requer `organizationId` no body.
- Dados existentes foram migrados para a organização padrão "CA3 Tecnologia".
- Webhook WhatsApp usa `organizationId: 'default'` para contatos novos (precisa de resolução por número de telefone no futuro).

---

## 2026-08-06 — Início do projeto e fundação documental

**O que:**
- Definidos documentos de engenharia: PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY, ROADMAP.
- Criados ADRs: stack (0001), monorepo (0002), WhatsApp (0003), tempo real (0004), SLA (0005).
- Definida stack (React/TS/Vite/Tailwind + Node/Express/Prisma/PostgreSQL) consistente com o Planner CA3.

**Por que:**
- O Plano.md exige documentação contínua e consistência com o Planner CA3.
- Fundamentar decisões antes de código reduz retrabalho e garante rastreabilidade.

**Impactos conhecidos:**
- Backlog de implementação (Fase 1+ do ROADMAP) ainda pendente.
- Referências a FastAPI/Celery no Plano.md interpretadas como exemplos, não como stack (ver ADR-0001).

---

## 2026-08-10 — Infraestrutura, backend e git

**O que:**
- Docker Compose com `postgres:18` e Redis; corrigido o mount do volume para `/var/lib/postgresql` (PG 18+).
- Backend Express/Prisma completo: auth JWT, usuários, equipes, contatos, conversas/mensagens (WEB), tickets + SLA (políticas, engine, jobs), notificações, relatórios e webhook WhatsApp.
- `prisma db push` + seed (admin, agente, cliente); API validada com todos os endpoints 200.
- Corrigido `@types/express` para v4 (`^4.17.21`) e removido `asyncHandler` duplicado das rotas.
- Repositório git inicializado na raiz do projeto, remote `origin` → `Duckwsn/Suporte-CA3`, branch `main`.

**Por que:**
- O `@types/express@5` tipava `req.params` como `string | string[]`, quebrando o build.
- O volume do PG 18 não é mais `/var/lib/postgresql/data`.

**Impactos conhecidos:**
- `server/.env` não versionado; `WEBHOOK_TOKEN` configurado localmente.
- Container do Redis (`suporte-ca3-redis`) provisionado para as fases 3+ (fila/WebSocket).

---

## 2026-08-11 — Fase 1 completa e Fase 2 em andamento

**O que:**
- Frontend: página **Novo ticket** (`/tickets/novo`) e export CSV autenticado (`api.getBlob`).
- Frontend: página **Equipes** (`/equipes`) com criação, exclusão e gestão de membros (drawer); `TeamService.removeTeam` adicionado.
- E2E navegador validado: login admin, dashboard KPIs, conversa atendida, ticket criado/resolvido, relatórios (KPIs/volume/CSV), configurações (SLA/usuários), equipes.
- Fase 2: webhook WhatsApp validado E2E (handshake, recepção, contato+conversa+mensagem+notificação; token inválido → 403 após fix do `timingSafeEqual` com buffers de tamanhos diferentes).
- Fase 2: notificações no Header agora usam polling (5s), mostram contador e "Marcar todas como lidas".
- Fase 2: painel de administração — role de usuário editável, ativar/desativar e criação de usuário (modal).

**Por que:**
- Fechar a Fase 1 (todas as páginas do frontend) e avançar nos itens operacionais da Fase 2.
- O `crypto.timingSafeEqual` lançava exceção (500) quando o token tinha tamanho diferente — agora valida o comprimento antes.

**Impactos conhecidos:**
- Polling de notificações segue o ADR-0004 (latência de até 5s).
- `Paginated<T>` ganhou `unreadCount?: number` para o badge do Header.
- Dados de teste do webhook removidos do banco após validação.

---

## 2026-08-12 — Validação E2E automatizada (Playwright)

**O que:**
- Suíte E2E Playwright (`e2e/`) validando o fluxo cliente → atendente → ticket: conversa aberta pelo cliente, mensagem enviada, atendente assume (API), responde pela UI, converte em ticket e confere draft/dashboard do admin.
- Infra de teste: `@playwright/test`, `playwright.config.ts` (workers=1, baseURL frontend, API URL), `e2e/global-setup.ts` (seed + limpeza), `e2e/helpers.ts` (auth/contatos/conversas/mensagens/tickets via API) e `server/src/e2e-cleanup.ts` (remove dados de teste anteriores).
- Mapeado o fim da Fase 1: item "Validação e2e automatizada" marcado no ROADMAP e registrada a entrega no CHANGELOG.

**Por que:**
- Critério do Plano.md §10 e da ROADMAP: cada fase termina com o fluxo validado e testado de forma automatizada.
- Garantir regressão do atendimento ponta a ponta antes de iniciar a Fase 3.

**Impactos conhecidos:**
- Comando: `npm run test:e2e` (requer backend em :4000, frontend em :5173 e banco via Docker).
- `test-results/` é artefato gerado (não versionar); `.gitignore` deve ignorá-lo.
- Próximo passo da ROADMAP: Fase 3 — WebSocket para mensagens, fila Redis, exportações avançadas/BI e CSAT.

---

## 2026-08-13 — Fase 3 concluída: Inteligência operacional

**O que:**

*Correções (manhã):*
- Corrigido bug crítico: `conversation-controller.ts` usava `'conversation:$1'` (placeholder inválido) em `enqueueRealtime()`; substituído por `'conversation:new'`.
- Corrigidos warnings de lint no `report-controller.ts` (spread desnecessário em 3 consultas).
- `queue/index.ts` agora lê `REDIS_URL` do ambiente em vez de hardcoded `localhost:6379`.
- Adicionada `REDIS_URL` ao `server/.env.example` e `server/.env`.
- `docker-compose.yml`: removido atributo `version` obsoleto.

*WebSocket (Fase B):*
- `whatsapp-controller.ts`: emite `conversation:new` e `conversation:message` via Socket.IO quando mensagem WhatsApp é recebida.
- `ticket-controller.ts`: emite `ticket:created` e `ticket:updated` via Socket.IO em create, update, resolve e reopen.
- `realtime.ts`: adicionadas rooms por conversa (`conversation:{id}`) com join/leave via Socket.IO.
- `queue/index.ts`: tipo `RealtimeJob` estendido para incluir `ticket:created` e `ticket:updated`.
- `TicketsPage.tsx`: `useSocketEvent` para atualização em tempo real.

*Fila Redis (Fase C):*
- `notify()`: migrado para usar `enqueueNotification()` (fila BullMQ) em vez de DB+emit direto.
- `server/index.ts`: graceful shutdown com `stopQueueWorkers()` em SIGTERM/SIGINT.
- `queue/index.ts`: workers armazenados em array para shutdown graciosamente.

*Relatórios avançados (Fase D):*
- `ReportsPage.tsx`: filtros de período (date range picker) com `from` e `to`.
- `ReportsPage.tsx`: seção de Análise com breakdowns por status, prioridade, categoria e canal.
- `ReportService.ts`: `analytics()` e `exportCsv()` agora aceitam parâmetros de data.

*CSAT dedicado (Fase E):*
- `CsatPage.tsx`: página dedicada `/csat` com nota média, distribuição de notas, breakdown por atendente/equipe, alertas para avaliações baixas (1-2 estrelas).
- `Sidebar.tsx`: link para CSAT.
- `routes.tsx`: rota `/csat` adicionada.

*Qualidade (Fase F):*
- `vitest.config.ts` e testes unitários: 9 testes (SLA engine constants, wall clock minutes, token utilities).
- `server/package.json`: scripts `test` e `test:watch` adicionados.

*Documentação (Fase G):*
- `ARCHITECTURE.md`: seções de filas (BullMQ), Socket.IO e WhatsApp atualizadas.
- `API.md`: endpoints de analytics e CSAT documentados.
- `ROADMAP.md`: Fase 3 marcada como concluída.
- `CHANGELOG.md`: entrada completa da Fase 3.

**Por que:**
- Fechar a Fase 3 do ROADMAP: WebSocket, fila Redis, CSAT e relatórios avançados.
- Corrigir bugs que impediam build do backend.
- Unificar notificações via fila para consistência e resiliência.
- Dar visibilidade operacional com analytics e CSAT dedicado.

**Impactos conhecidos:**
- Backend e frontend compilam sem erros; lint passa sem warnings; 9 testes unitários passando.
- Socket.IO emite eventos em tempo real para conversas e tickets.
- Notificações são processadas via fila BullMQ (requer Redis rodando).
- Fase 3 do ROADMAP completamente marcada; próximo marco: Fase 4 (multi-tenant, i18n, PWA).

---
