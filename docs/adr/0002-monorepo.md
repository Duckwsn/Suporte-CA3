# ADR-0002 — Estrutura monorepo

- **Status:** Aceito
- **Data:** 2026-08-06

## Contexto

O Planner CA3 organiza o código como monorepo com o frontend na raiz e o backend em `server/`. A manutenção de um padrão único facilita commits atômicos, CI/CD e a navegação da equipe.

## Decisão

- **Raiz do repositório:** frontend (React/Vite) — `package.json`, `src/`, `index.html`, `vite.config.ts`.
- **`server/`:** backend Express — `package.json`, `prisma/`, `src/`.
- **`docs/`:** documentação central (PRD, ARCHITECTURE, DATA_MODEL, API, DESIGN_SYSTEM, DEPLOY, ROADMAP, log, adr).
- **`docker-compose.yml`:** infraestrutura local (PostgreSQL/Redis).

## Consequências

- Espelha o Planner CA3 → consistência garantida (Plano.md §1).
- Scripts raiz orquestram ambos os lados (`build:all`, `start`).
- Árvores `node_modules/` separadas (raiz e `server/`) — aceitável no padrão atual.
