# PRD — Suporte CA3

> Documento de Requisitos do Produto (Product Requirements Document).
> Fonte de verdade do **o quê** e **para quem** o produto é construído. Acompanha [ARCHITECTURE.md](./ARCHITECTURE.md) (o **como**).

---

## 1. Contexto e problema

Equipes de atendimento técnico precisam de um único painel para conduzir conversas com clientes em múltiplos canais, transformar atendimentos em tickets rastreáveis e garantir acordos de nível de serviço (SLA). Hoje esses fluxos são fragmentados, o que gera perda de contexto, atrasos na primeira resposta e ausência de métricas confiáveis.

O **Suporte CA3** resolve isso com um fluxo inspirado no Underchat (atendimento em tempo real com agente humano), porém com arquitetura própria, evolução modular e integração planejada com WhatsApp Business.

## 2. Objetivos

- Centralizar todo o atendimento técnico em um único painel multicanal.
- Rastrear cada atendimento como ticket com fila, prioridade e responsável.
- Garantir conformidade com políticas de SLA (primeira resposta e resolução).
- Dar visibilidade operacional por KPIs e relatórios.
- Manter consistência visual e arquitetural com o **Planner CA3**.

**Não-objetivos (v1):** cobrança/assinaturas, marketplace, app mobile nativo, inteligência artificial de atendimento.

## 3. Personas

| Persona | Papel | Necessidades principais |
| --- | --- | --- |
| **Cliente** | Consumidor que busca suporte técnico | Abrir solicitação, acompanhar o atendimento, conversar com o agente |
| **Atendente (AGENT)** | Atende conversas e tickets | Fila de trabalho, contexto do cliente, prazos de SLA, envio de mensagens |
| **Supervisor (SUPERVISOR)** | Lidera uma equipe | Alocação de tickets, visão da equipe, gestão de SLA |
| **Administrador (ADMIN)** | Configura o sistema | Usuários, equipes, políticas de SLA, canais, relatórios globais |

## 4. Funcionalidades por prioridade

### P0 — Núcleo (MVP)
- **Autenticação e autorização**: login/registro com JWT; roles ADMIN, SUPERVISOR, AGENT, CUSTOMER.
- **Painel (Dashboard)**: KPIs — tickets abertos, conversas ativas, conformidade de SLA, tempo médio de primeira resposta.
- **Atendimento**: conversa (canal Web) entre cliente e atendente; lista de conversas com status; envio de mensagens com polling.
- **Tickets**: criação a partir de conversa ou manual; status (ABERTO, EM_ATENDIMENTO, AGUARDANDO_CLIENTE, RESOLVIDO, FECHADO); prioridades (BAIXA, MEDIA, ALTA, URGENTE); categorias; atribuição a atendente/equipe.
- **Contatos**: cadastro e perfil do consumidor (nome, telefone, e-mail, whatsapp).
- **Equipes**: CRUD de equipes e vínculo de atendentes.

### P1 — Operação
- **SLA**: políticas por categoria (prazo de primeira resposta e de resolução); job agendado para detectar violações; sinalização visual de SLA no ticket.
- **WhatsApp**: webhook de entrada (validação de assinatura), criação/atualização de conversa e mensagens; canal `WHATSAPP`.
- **Notificações**: notificações in-app para novos tickets/mensagens atribuídos.

### P2 — Inteligência operacional
- **Relatórios**: volume por período, tempo médio de atendimento, conformidade de SLA por equipe, exportação CSV.
- **Administração**: gestão de usuários, configuração de canais e parâmetros do sistema.

## 5. Fluxos principais

### 5.1 Cliente abre um atendimento (canal Web)
1. Cliente acessa a área de atendimento e informa seus dados (ou faz login como CUSTOMER).
2. O sistema cria/recupera o **contato** e abre uma **conversa**.
3. O cliente envia a primeira mensagem; uma conversa é criada com status `AGUARDANDO_ATENDENTE`.
4. O atendente assume a conversa → status `EM_ATENDIMENTO`.
5. Ao fim, o atendente pode converter a conversa em **ticket** (se houver problema a rastrear).

### 5.2 Ticket com SLA
1. Ticket criado com categoria → aplica-se a política de SLA compatível.
2. Calculam-se os prazos: `firstResponseDueAt` e `resolutionDueAt`.
3. O job `sla-breaches` (node-cron) verifica tickets abertos e marca `SlaBreach` quando o prazo expira.
4. A interface sinaliza prazos e violações no card/lista do ticket.

### 5.3 Mensagem via WhatsApp
1. WhatsApp Business envia POST para `POST /api/whatsapp/webhook`.
2. O webhook valida a assinatura (token) e persiste um `WebhookEvent`.
3. O evento é processado: encontra o contato pelo número, cria/atualiza a conversa e registra a mensagem.
4. A conversa aparece na fila dos atendentes via polling.

## 6. Métricas de sucesso (KPIs)

- Tempo médio de primeira resposta (FRT).
- Percentual de conformidade de SLA (primeira resposta e resolução).
- Volume de tickets resolvidos por equipe/atendente.
- Tempo médio de resolução (MTTR).
- Taxa de reabertura de tickets.

## 7. Restrições e premissas

- **Consistência**: toda decisão de design/arquitetura segue o [Plano.md](../Plano.md) e o padrão do Planner CA3.
- **SLA**: prazos calculados em horário comercial (configurável); job de detecção roda periodicamente (padrão 5 min).
- **Tempo real**: a v1 usa **polling** (consistente com o Planner CA3); WebSocket é evolução registrada em [ADR-0004](./adr/0004-realtime-strategy.md).
- **WhatsApp**: integração via webhook com token compartilhado (v1); o envio de mensagens para o canal WhatsApp é planejado para fase P1.

## 8. Critérios de aceite do MVP

- [ ] Login/registro e controle de acesso por role funcionam.
- [ ] Cliente consegue abrir conversa e enviar mensagem (canal Web).
- [ ] Atendente consegue ver a fila, assumir e responder conversas.
- [ ] Conversa pode ser convertida em ticket com prioridade/categoria.
- [ ] Política de SLA é aplicada e violações são detectadas pelo job.
- [ ] Webhook do WhatsApp valida assinatura e registra eventos.
- [ ] Dashboard exibe KPIs corretos.
- [ ] Testes automatizados (unitários/integração) e validação e2e (Playwright) aprovados.
