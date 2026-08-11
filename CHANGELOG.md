# CHANGELOG

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e na convenção de log do Planner CA3.
Cada entrada registra: **data · o que foi feito · por que · impactos conhecidos**.

O log contínuo e detalhado fica em [docs/log.md](./docs/log.md).

## [Unreleased]

### Adicionado (2026-08-06)
- Início do projeto **Suporte CA3**: documentos de engenharia e planejamento.
- Estrutura monorepo consistente com o Planner CA3 (frontend na raiz, backend em `server/`).
- Decisões arquiteturais registradas como ADRs em `docs/adr/`.
- Stack definida: React 19 + TS + Vite + Tailwind (front); Node/Express + Prisma + PostgreSQL (back).
- Documentos criados: PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY, ROADMAP, log.md.

### Pendente (próximas fases)
- Schema Prisma completo e primeira migration.
- Backend Express: autenticação JWT, módulos de atendimento, tickets, SLA, webhook WhatsApp.
- Frontend: login, dashboard, painel de atendimento, tickets, contatos, equipes, relatórios.
- Infraestrutura Docker (postgres, redis) e scripts de desenvolvimento.
