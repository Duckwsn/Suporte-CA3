# Log de desenvolvimento — Suporte CA3

> Registro contínuo de decisões e mudanças relevantes. Formato: **data · o que · por que · impactos**.
> Visão resumida no [CHANGELOG.md](../CHANGELOG.md).

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

## Próximas entradas

- Implementação do schema Prisma e primeira migration.
- Backend: auth, usuários, equipes, contatos, conversas, tickets, SLA, webhook WhatsApp, notificações, relatórios.
- Frontend: tokens, componentes shared, layout, páginas.
- Validação e2e (Playwright) e primeiros commits.
