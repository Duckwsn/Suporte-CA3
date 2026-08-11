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
