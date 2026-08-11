# CHANGELOG

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e na convenção de log do Planner CA3.
Cada entrada registra: **data · o que foi feito · por que · impactos conhecidos**.

O log contínuo e detalhado fica em [docs/log.md](./docs/log.md).

## [Unreleased]

### Adicionado (2026-08-11)
- **Fase 1 — Núcleo (MVP)** concluída: login, dashboard, atendimento, tickets (+ Novo ticket), contatos, equipes e relatórios com export CSV.
- **Fase 2 — Operação** parcial: webhook WhatsApp validado E2E (recepção + processamento; fix de token 403), notificações com polling em tempo real (5s, contador e "marcar todas como lidas"), painel de administração (editar papel, ativar/desativar e criar usuário).
- Infraestrutura Docker (postgres:18 + redis) com volume corrigido; backend Express/Prisma com todos os endpoints validados; git + GitHub configurados.

### Adicionado (2026-08-06)
- Início do projeto **Suporte CA3**: documentos de engenharia e planejamento.
- Estrutura monorepo consistente com o Planner CA3 (frontend na raiz, backend em `server/`).
- Decisões arquiteturais registradas como ADRs em `docs/adr/`.
- Stack definida: React 19 + TS + Vite + Tailwind (front); Node/Express + Prisma + PostgreSQL (back).
- Documentos criados: PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY, ROADMAP, log.md.

### Pendente (próximas fases)
- Fase 2: canais no painel de administração (parcial) e notificações via WebSocket (ADR-0004).
- Fase 3: WebSocket para mensagens, fila assíncrona (Redis), exportações avançadas e CSAT.
- Fase 4: multi-tenant, i18n, PWA e integrações externas.
- Testes automatizados e documentação de testes.
