# Suporte CA3

Plataforma profissional de atendimento técnico (SaaS), inspirada no fluxo operacional do **Underchat**, com arquitetura própria, moderna, escalável e identidade visual própria — mantendo consistência com o **Planner CA3**.

> **Para agentes de IA:** leia o [Plano.md](./Plano.md) por completo antes de qualquer tarefa. É a fonte única de verdade operacional.

---

## Visão geral

O **Suporte CA3** centraliza o atendimento técnico em um único painel: conversas multicanal (Web e WhatsApp), tickets com fila e priorização, acordos de nível de serviço (SLA) com detecção de violações, gestão de contatos, equipes de atendimento e relatórios operacionais.

### Módulos principais

| Módulo | Descrição |
| --- | --- |
| **Atendimento** | Conversas em tempo real (polling) entre clientes e atendentes, por canal Web e WhatsApp. |
| **Tickets** | Ciclo de vida do ticket (aberto → em atendimento → resolvido), prioridades, categorias e filas por equipe. |
| **SLA** | Políticas de SLA por categoria, prazos de primeira resposta e resolução, detecção de violação via job agendado. |
| **Contatos** | Cadastro e histórico do consumidor, vinculado a conversas e tickets. |
| **Equipes** | Times de atendentes, supervisores e distribuição de filas. |
| **Relatórios** | KPIs operacionais (volume, tempo médio, conformidade de SLA). |
| **Administração** | Gestão de usuários, configurações de sistema e canais. |

---

## Stack

### Frontend (`/` — raiz do repositório)
- React 19 + TypeScript + Vite
- Tailwind CSS 4 (design tokens via `src/shared/styles/tokens.css`)
- React Router 7, Zustand 5, Axios, Lucide React

### Backend (`/server`)
- Node.js + Express 4 + TypeScript
- Prisma 5 (ORM) + PostgreSQL
- JWT (autenticação), bcryptjs (hash), helmet (segurança), morgan (logs), multer (uploads), node-cron (jobs)

### Infraestrutura
- PostgreSQL (Docker Compose)
- Redis (reservado para filas/futuro WebSocket)
- Docker Compose para ambiente local

---

## Requisitos

- Node.js 20+ e npm
- Docker Desktop (para PostgreSQL/Redis)
- Git

## Como rodar

### 1. Subir o banco de dados

```bash
docker compose up -d
```

### 2. Backend

```bash
cd server
cp .env.example .env   # configure as variáveis
npm install
npx prisma migrate dev
npm run dev            # http://localhost:4000
```

### 3. Frontend

```bash
# na raiz do repositório
npm install
npm run dev            # http://localhost:5173
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL (ex.: `postgresql://CA3:745296@localhost:5432/CA3`) |
| `JWT_SECRET` | Sim | Segredo para assinatura dos tokens JWT |
| `PORT` | Não | Porta do backend (padrão `4000`) |
| `WEBHOOK_TOKEN` | Não | Token para verificação de assinatura do webhook do WhatsApp |
| `FRONTEND_URL` | Não | Origem permitida pelo CORS (padrão `http://localhost:5173`) |

---

## Comandos úteis

### Backend
```bash
cd server
npm run dev              # desenvolvimento com reload
npm run build            # compilação TypeScript + geração do Prisma Client
npm start                # produção (aplica schema + inicia dist/index.js)
npm run prisma:migrate   # cria migration
npm run prisma:seed      # popula dados de exemplo
```

### Frontend
```bash
npm run dev              # dev server
npm run build            # build de produção
npm run lint             # lint (oxlint)
npm run preview          # pré-visualizar build
```

---

## Estrutura do repositório

```
.
├── Plano.md                  # Manual operacional para agentes de IA (fonte única de verdade)
├── README.md                 # Este documento
├── CHANGELOG.md              # Log contínuo de mudanças
├── docs/                     # Documentação do projeto
│   ├── PRD.md                # Documento de requisitos do produto
│   ├── ARCHITECTURE.md       # Arquitetura do sistema
│   ├── DATA_MODEL.md         # Modelo de dados
│   ├── API.md                # Referência da API
│   ├── DESIGN_SYSTEM.md      # Design system
│   ├── DEPLOY.md             # Deploy
│   ├── ROADMAP.md            # Roteiro em fases
│   ├── log.md                # Log contínuo de decisões
│   └── adr/                  # Architecture Decision Records
├── src/                      # Frontend (raiz)
│   ├── app/                  # App.tsx, rotas
│   ├── core/                 # api, erros, storage
│   ├── hooks/                # hooks reutilizáveis
│   ├── modules/              # módulos de funcionalidade
│   ├── services/             # camada de serviços (API)
│   ├── shared/               # componentes, layouts, estilos
│   ├── stores/               # estados globais (Zustand)
│   ├── types/                # tipos compartilhados
│   └── utils/                # utilitários
└── server/                   # Backend
    ├── prisma/               # schema + migrations
    └── src/
        ├── controllers/      # controladores HTTP
        ├── routes/           # rotas Express
        ├── middleware/       # auth, admin, erro
        ├── lib/              # prisma, sla, whatsapp, notify
        ├── jobs/             # jobs agendados (node-cron)
        ├── utils/            # utilitários
        └── index.ts          # entrada do servidor
```

---

## Documentação

- [Plano.md](./Plano.md) — manual operacional para agentes de IA
- [PRD](./docs/PRD.md) — requisitos do produto
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Modelo de dados](./docs/DATA_MODEL.md)
- [API](./docs/API.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Deploy](./docs/DEPLOY.md)
- [Roteiro](./docs/ROADMAP.md)
- [Log de desenvolvimento](./docs/log.md)
- [ADRs](./docs/adr/)

---

## Filosofia

O projeto segue, em ordem de prioridade: **consistência > velocidade; qualidade > quantidade; arquitetura > atalhos**. Detalhes no [Plano.md](./Plano.md) §9.
