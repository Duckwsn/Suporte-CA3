# Roteiro — Suporte CA3

> Fases de evolução do projeto. Cada fase termina com código funcionando, testado e documentado (critérios do Plano.md §10).

---

## Fase 0 — Fundação (em andamento)
**Objetivo:** base documental e estrutura do projeto.

- [x] Documentos de engenharia (PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY)
- [x] ADRs de decisões iniciais
- [x] Estrutura monorepo (frontend raiz + server/)
- [ ] Repositório GitHub configurado (`Duckwsn/Suporte-CA3`)

## Fase 1 — Núcleo (MVP)
**Objetivo:** atendimento de ponta a ponta no canal Web.

- [ ] Backend: auth JWT + middleware + health
- [ ] Backend: usuários, equipes, contatos
- [ ] Backend: conversas e mensagens (canal WEB)
- [ ] Backend: tickets + SLA (políticas, engine, job)
- [ ] Backend: notificações
- [ ] Frontend: tokens, componentes shared, layout
- [ ] Frontend: login, dashboard, atendimento, tickets, contatos, equipes
- [ ] Seed de desenvolvimento
- [ ] Validação e2e (Playwright) do fluxo cliente→atendente→ticket

## Fase 2 — Operação
- [ ] Webhook WhatsApp (recepção + processamento)
- [ ] Relatórios (KPIs, volume, export CSV)
- [ ] Notificações em tempo real (polling refinado / WebSocket — ADR-0004)
- [ ] Painel de administração (usuários, canais, config)

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
