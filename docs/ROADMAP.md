# Roteiro — Suporte CA3

> Fases de evolução do projeto. Cada fase termina com código funcionando, testado e documentado (critérios do Plano.md §10).

---

## Fase 0 — Fundação
**Objetivo:** base documental e estrutura do projeto.

- [x] Documentos de engenharia (PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY)
- [x] ADRs de decisões iniciais
- [x] Estrutura monorepo (frontend raiz + server/)
- [x] Repositório GitHub configurado (`Duckwsn/Suporte-CA3`)

## Fase 1 — Núcleo (MVP)
**Objetivo:** atendimento de ponta a ponta no canal Web.

- [x] Backend: auth JWT + middleware + health
- [x] Backend: usuários, equipes, contatos
- [x] Backend: conversas e mensagens (canal WEB)
- [x] Backend: tickets + SLA (políticas, engine, job)
- [x] Backend: notificações
- [x] Frontend: tokens, componentes shared, layout
- [x] Frontend: login, dashboard, atendimento, tickets, contatos, equipes
- [x] Seed de desenvolvimento
- [x] Validação e2e automatizada (Playwright) do fluxo cliente→atendente→ticket

## Fase 2 — Operação
- [x] Webhook WhatsApp (recepção + processamento) — validado E2E
- [x] Relatórios (KPIs, volume, export CSV)
- [x] Notificações em tempo real (polling refinado / WebSocket — ADR-0004; v1: polling)
- [x] Painel de administração (usuários, canais, config)

## Fase 3 — Inteligência operacional
- [x] WebSocket (Socket.IO) — infraestrutura server+client, JWT auth, rooms, eventos `conversation:new/updated/message` e `ticket:created/updated` (via BullMQ realtime queue)
- [x] Fila assíncrona (BullMQ/Redis) — 3 filas: notificações, entregas WhatsApp, realtime; workers operacionais; graceful shutdown
- [x] Métricas de satisfação (CSAT) — backend (submit, summary, distribution) + frontend (modal de avaliação, página dedicada `/csat` com distribuição, breakdowns e alertas)
- [x] Corrigir integração: controllers emitem eventos Socket.IO corretamente
- [x] Completar integração: WhatsApp controller emite `conversation:message` e `conversation:new` via socket
- [x] Completar integração: ticket controller emite `ticket:created` e `ticket:updated` via socket
- [x] Unificar `notify()` para usar fila BullMQ
- [x] Exportações avançadas — filtros de período, analytics breakdown (status, prioridade, categoria, canal)
- [x] Frontend: Socket.IO para atualizações imediatas + polling como fallback

## Fase 4 — Escala
- [x] Multi-tenant / multi-organização — Organization model, JWT orgId, tenant scoping em todos os controllers, seed, frontend org management page
- [x] Internacionalização (i18n) — react-i18next, traduções pt-BR/en, language switcher em Configurações
- [x] Apps (PWA) — vite-plugin-pwa, manifest, service worker, offline support, runtime caching

---

> O log detalhado de cada entrega está em [log.md](./log.md). Decisões arquiteturais em [docs/adr](./adr/).
