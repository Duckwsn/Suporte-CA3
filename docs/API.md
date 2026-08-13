# API — Suporte CA3

> Referência dos endpoints do backend (Express). Base URL local: `http://localhost:4000`.
> Autenticação: `Authorization: Bearer <JWT>`. Respostas em JSON.

---

## 1. Autenticação

### POST /api/auth/login
Body: `{ "email": string, "password": string }`
Resposta `200`: `{ "token": string, "user": User, "organization": Organization }`

### POST /api/auth/register
Body: `{ "name": string, "email": string, "password": string, "organizationId": string, "role?": Role }`
Resposta `201`: `{ "token": string, "user": User, "organization": Organization }`

### GET /api/auth/me
Header: Bearer. Resposta `200`: `User`

---

## 2. Usuários (`/api/users`) — ADMIN

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/users` | Lista usuários (filtros: `role`, `search`, `page`, `limit`) |
| GET | `/api/users/:id` | Detalhe de usuário |
| POST | `/api/users` | Cria usuário |
| PATCH | `/api/users/:id` | Atualiza usuário (inclui `role`, `teamId`, `isActive`) |
| DELETE | `/api/users/:id` | Desativa usuário |

---

## 3. Equipes (`/api/teams`) — ADMIN/SUPERVISOR

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/teams` | Lista equipes (inclui `_count.members`) |
| POST | `/api/teams` | Cria equipe |
| GET | `/api/teams/:id` | Detalhe |
| PATCH | `/api/teams/:id` | Atualiza |
| DELETE | `/api/teams/:id` | Remove |
| POST | `/api/teams/:id/members` | Adiciona membro `{ "userId": string }` |
| DELETE | `/api/teams/:id/members/:userId` | Remove membro |

---

## 4. Contatos (`/api/contacts`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/contacts` | Lista (filtros: `search`, `page`, `limit`) |
| GET | `/api/contacts/:id` | Detalhe com conversas/tickets recentes |
| POST | `/api/contacts` | Cria contato |
| PATCH | `/api/contacts/:id` | Atualiza |
| DELETE | `/api/contacts/:id` | Remove (bloqueado se houver conversas/tickets) |

---

## 5. Conversas e mensagens (`/api/conversations`)

### Conversas
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/conversations` | Lista (filtros: `status`, `channel`, `assigneeId`, `page`, `limit`) |
| GET | `/api/conversations/:id` | Detalhe com mensagens |
| POST | `/api/conversations` | Abre conversa `{ "channel", "contactId" }` |
| PATCH | `/api/conversations/:id/assign` | Atribui/assume `{ "assigneeId" }` |
| PATCH | `/api/conversations/:id/status` | Muda status |
| POST | `/api/conversations/:id/messages` | Envia mensagem `{ "senderType", "body", "mediaUrl?" }` |
| GET | `/api/conversations/:id/messages` | Lista mensagens (polling) |

### Mensagens
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/messages/:id` | Detalhe de mensagem |
| PATCH | `/api/messages/:id/read` | Marca como lida |

---

## 6. Tickets (`/api/tickets`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/tickets` | Lista (filtros: `status`, `priority`, `category`, `assigneeId`, `teamId`, `page`, `limit`) |
| GET | `/api/tickets/:id` | Detalhe com SLA e violações |
| POST | `/api/tickets` | Cria ticket (aplica política de SLA) |
| PATCH | `/api/tickets/:id` | Atualiza (status/prioridade/atribuição) |
| POST | `/api/tickets/:id/reopen` | Reabre (recalcula SLA) |
| POST | `/api/tickets/:id/resolve` | Resolve |

---

## 7. SLA (`/api/sla`) — ADMIN/SUPERVISOR

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/sla/policies` | Lista políticas |
| POST | `/api/sla/policies` | Cria política |
| PATCH | `/api/sla/policies/:id` | Atualiza |
| DELETE | `/api/sla/policies/:id` | Remove |

---

## 8. WhatsApp (`/api/whatsapp`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/whatsapp/webhook` | Verificação (handshake) do webhook |
| POST | `/api/whatsapp/webhook` | Recebe eventos (`X-CA3-Webhook-Token` header) |

---

## 9. Notificações (`/api/notifications`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/notifications` | Lista do usuário autenticado (filtro `unread`) |
| PATCH | `/api/notifications/:id/read` | Marca como lida |
| PATCH | `/api/notifications/read-all` | Marca todas como lidas |

---

## 10. Relatórios (`/api/reports`) — SUPERVISOR/ADMIN

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/reports/kpis` | KPIs globais `{ ticketsOpen, conversationsActive, slaCompliance, avgFirstResponseMinutes, resolvedTickets }` |
| GET | `/api/reports/volume` | Volume por dia (query `from`, `to`) |
| GET | `/api/reports/analytics` | Breakdown de tickets (query `from`, `to`): `{ byStatus, byPriority, byCategory, byTeam, byChannel }` |
| GET | `/api/reports/export` | Exporta CSV (query `type`: tickets|conversations|csat; `from`, `to`) |

---

## 11. CSAT (`/api/csat`)

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/csat/conversations/:id` | Submete avaliação `{ rating: 1-5, comment? }` |
| GET | `/api/csat/conversations/:id` | Busca avaliação de uma conversa |
| GET | `/api/csat/summary` | Resumo CSAT (query `days`): `{ total, average, promoterRate, distribution, byAssignee, byTeam }` |

---

## 12. Organizações (`/api/organizations`) — ADMIN

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/organizations` | Lista organizações |
| GET | `/api/organizations/:id` | Detalhe de organização |
| POST | `/api/organizations` | Cria organização `{ "name", "slug" }` |
| PUT | `/api/organizations/:id` | Atualiza `{ "name?", "slug?", "isActive?" }` |
| DELETE | `/api/organizations/:id` | Remove organização |

---

## 13. Erros

Formato padronizado pelo middleware `error-handler`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | FORBIDDEN | UNAUTHORIZED | INTERNAL",
    "message": "descrição legível"
  }
}
```

| Código | Status HTTP |
| --- | --- |
| VALIDATION_ERROR | 400 |
| UNAUTHORIZED | 401 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| INTERNAL | 500 |

---

## 12. Códigos de status de erro

- `401` — token ausente/inválido (middleware `auth`).
- `403` — role insuficiente (middleware `admin`).
- `404` — recurso não encontrado.
- `400` — payload inválido (validação).
