# ADR-0001 — Stack tecnológica

- **Status:** Aceito
- **Data:** 2026-08-06
- **Autores:** Suporte CA3 (engenharia)

## Contexto

O Plano.md (§1) exige **consistência obrigatória** com o Planner CA3. O projeto de referência (em `ca3-planner`) usa: React 19 + TypeScript + Vite + Tailwind + Zustand no frontend, e Node.js/Express 4 + Prisma 5 + PostgreSQL no backend. O Plano.md (§7.1 e §7.4) menciona "workers Celery" e "FastAPI" como exemplos genéricos de documentação, não como decisão de stack.

## Decisão

Adotar a mesma stack do Planner CA3:

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Zustand 5, Axios, Lucide React.
- **Backend:** Node.js, Express 4, TypeScript, Prisma 5, PostgreSQL.
- **Auxiliares:** JWT (jsonwebtoken), bcryptjs, helmet, cors, morgan, multer, node-cron.

## Consequências

- Positivas: consistência de código, reutilização de componentes/tokens, menor curva para a equipe.
- Negativas/riscos: documentado — a referência a FastAPI/Celery no Plano.md não será seguida; reavaliar em caso de nova diretriz explícita.
- Para jobs assíncronos futuros, usar node-cron (já no padrão do Planner) e, quando escalar, fila com Redis.
