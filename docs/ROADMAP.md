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
- [ ] Validação e2e automatizada (Playwright) do fluxo cliente→atendente→ticket

## Fase 2 — Operação
- [x] Webhook WhatsApp (recepção + processamento) — validado E2E
- [x] Relatórios (KPIs, volume, export CSV)
- [x] Notificações em tempo real (polling refinado / WebSocket — ADR-0004; v1: polling)
- [x] Painel de administração (usuários, canais, config)

## Fase 3 — Inteligência operacional
- [ ] WebSocket para mensagens instantâneas
- [ ] Fila assíncrona (Redis) para envio de mensagens/notificações
- [ ] Exportações avançadas e BI
- [ ] Métricas de satisfação (CSAT)

## Fase 4 — Escala
- [ ] Multi-tenant / multi-organização
- [ ] Internacionalização (i18n)
- [ ] Apps (PWA) e integrações externas

---

> O log detalhado de cada entrega está em [log.md](./log.md). Decisões arquiteturais em [docs/adr](./adr/).
