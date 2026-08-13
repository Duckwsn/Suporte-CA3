# ADR-0006 — Multi-tenancy

## Status

Aceito (2026-08-13)

## Contexto

O Suporte CA3 precisa suportar múltiplas organizações no mesmo banco de dados para escalar como SaaS. Atualmente todos os dados são globais (sem isolamento por organização).

## Decisão

Adotar modelo de multi-tenancy via coluna `organizationId` em todas as tabelas de dados:

1. **Modelo Organization**: nova tabela com `id`, `name`, `slug` (único), `isActive`, `logoUrl`.
2. **FK organizationId**: adicionado como NOT NULL (exceto WebhookEvent) em User, Team, Contact, Conversation, Ticket, SlaPolicy, CsatRating, Notification, AuditLog.
3. **JWT**: payload inclui `organizationId`; middleware valida organização ativa.
4. **Controllers**: todas as queries e creates são filtrados por `organizationId`.
5. **Ticket.number**: sequencial único por organização (não mais global).
6. **Seed**: cria organização padrão e atribui dados existentes.

## Consequências

### Positivas
- Isolamento de dados entre organizações.
- Escalabilidade SaaS — múltiplas organizações no mesmo banco.
- Controle de acesso granular por organização.
- Organização ativa no JWT evita queries extras.

### Negativas
- Complexidade adicional em todos os controllers (scoping por org).
- Migração de dados existentes necessária.
- Webhook WhatsApp precisa de resolução de organização por número de telefone.
- Organização inativa bloqueia acesso (middleware).

## Alternativas consideradas

1. **Schema por organização**: isolamento completo mas complexidade de manutenção e migração.
2. **Row-level security (RLS)**: PostgreSQL nativo mas requer configuração por tabela e pode ter overhead.
3. **Banco por organização**: isolamento máximo mas custo de infraestrutura proibitivo para SaaS.

Escolhemos coluna `organizationId` por ser a solução mais simples e eficiente para o contexto atual, com opção de migrar para RLS no futuro se necessário.
