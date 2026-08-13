# Modelo de Dados — Suporte CA3

> PostgreSQL via Prisma ORM. Migrations versionadas em `server/prisma/migrations`.
> Nomenclatura em inglês, snake_case nos campos, valores de enum em UPPER_SNAKE_CASE.

---

## 1. Diagrama conceitual

```
Organization ──── User (1:N)
  │  │  │  │  │  │  │  │
  │  │  │  │  │  │  │  └── Team.supervisor
  │  │  │  │  │  │  │
  │  │  │  │  │  │  └── Conversation.assignee
  │  │  │  │  │  └── Ticket.assignee
  │  │  │  │  └── Notification.recipient
  │  │  │  └── AuditLog.user
  │  │  └── CsatRating.assignee
  │  │
  │  ├── Team (1:N)
  │  ├── Contact (1:N)
  │  ├── Conversation (1:N) ──── Message (1:N)
  │  ├── Ticket (1:N) ──── SlaBreach (1:N)
  │  ├── SlaPolicy (1:N)
  │  ├── CsatRating (1:N)
  │  ├── Notification (1:N)
  │  ├── AuditLog (1:N)
  │  └── WebhookEvent (1:N)
```

## 2. Enums

| Enum | Valores |
| --- | --- |
| `Role` | `ADMIN`, `SUPERVISOR`, `AGENT`, `CUSTOMER` |
| `ConversationChannel` | `WEB`, `WHATSAPP`, `EMAIL` |
| `ConversationStatus` | `AGUARDANDO_ATENDENTE`, `EM_ATENDIMENTO`, `RESOLVIDO`, `FECHADO` |
| `MessageSenderType` | `CONTACT`, `AGENT`, `SYSTEM` |
| `MessageStatus` | `ENVIADA`, `ENTREGUE`, `LIDA`, `FALHOU` |
| `TicketStatus` | `ABERTO`, `EM_ATENDIMENTO`, `AGUARDANDO_CLIENTE`, `RESOLVIDO`, `FECHADO` |
| `TicketPriority` | `BAIXA`, `MEDIA`, `ALTA`, `URGENTE` |
| `SlaBreachType` | `PRIMEIRA_RESPOSTA`, `RESOLUCAO` |
| `NotificationType` | `TICKET_ATRIBUIDO`, `NOVA_MENSAGEM`, `SLA_VIOLADO` |
| `WebhookSource` | `WHATSAPP` |

## 3. Modelos

### Organization
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| name | String | nome da organização |
| slug | String | único, URL-friendly |
| isActive | Boolean | padrão `true` |
| logoUrl | String? | |
| createdAt / updatedAt | DateTime | |

### User
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| name | String | |
| email | String | único, normalizado (lowercase) |
| passwordHash | String | bcrypt |
| role | Role | padrão `AGENT` |
| organizationId | UUID | FK → Organization |
| teamId | UUID? | FK → Team |
| isActive | Boolean | padrão `true` |
| avatarUrl | String? | |
| createdAt / updatedAt | DateTime | |

### Team
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| name | String | único por organização |
| description | String? | |
| organizationId | UUID | FK → Organization |
| supervisorId | UUID? | FK → User |
| members | User[] | relação |

### Contact
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| name | String | |
| phone | String? | |
| email | String? | |
| whatsappId | String? | ID do contato no WhatsApp |
| notes | String? | |
| organizationId | UUID | FK → Organization |
| createdAt / updatedAt | DateTime | |

### Conversation
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| channel | ConversationChannel | |
| status | ConversationStatus | |
| contactId | UUID | FK → Contact |
| organizationId | UUID | FK → Organization |
| assigneeId | UUID? | FK → User (atendente) |
| title | String? | |
| startedAt | DateTime | |
| lastMessageAt | DateTime? | |
| resolvedAt | DateTime? | |

### Message
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| conversationId | UUID | FK → Conversation |
| senderType | MessageSenderType | |
| senderId | UUID? | FK → User (quando AGENT/SYSTEM) |
| body | String | |
| mediaUrl | String? | |
| status | MessageStatus | |
| deliveredAt / readAt | DateTime? | |
| createdAt | DateTime | |

### Ticket
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| number | Int | sequencial único por organização |
| subject | String | |
| description | String | |
| status | TicketStatus | |
| priority | TicketPriority | |
| category | String | ex.: `HARDWARE`, `SOFTWARE`, `REDE` |
| conversationId | UUID? | FK → Conversation |
| contactId | UUID? | FK → Contact |
| organizationId | UUID | FK → Organization |
| assigneeId | UUID? | FK → User |
| teamId | UUID? | FK → Team |
| slaPolicyId | UUID? | FK → SlaPolicy |
| firstResponseDueAt / resolutionDueAt | DateTime? | calculados pelo SLA |
| firstResponseAt / resolvedAt | DateTime? | |
| openedAt / updatedAt | DateTime | |

### SlaPolicy
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| name | String | |
| category | String? | categoria-alvo (nulo = global) |
| organizationId | UUID | FK → Organization |
| responseTimeMinutes | Int | prazo primeira resposta |
| resolutionTimeMinutes | Int | prazo resolução |
| businessHoursOnly | Boolean | padrão `true` |
| isActive | Boolean | |
| createdAt / updatedAt | DateTime | |

### SlaBreach
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| ticketId | UUID | FK → Ticket |
| type | SlaBreachType | |
| dueAt | DateTime | prazo original |
| detectedAt | DateTime | momento da detecção |
| resolved | Boolean | padrão `false` |

### WebhookEvent
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| source | WebhookSource | |
| payload | Json | payload bruto |
| signatureValid | Boolean | |
| processedAt | DateTime? | |
| error | String? | |
| receivedAt | DateTime | |

### Notification
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| recipientId | UUID | FK → User |
| type | NotificationType | |
| title | String | |
| body | String? | |
| readAt | DateTime? | |
| createdAt | DateTime | |

### AuditLog
| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | PK |
| userId | UUID? | FK → User |
| action | String | ex.: `ticket.assigned` |
| entityType / entityId | String | |
| meta | Json? | |
| createdAt | DateTime | |

## 4. Regras de integridade

- `Ticket.number` é sequencial único por período.
- Exclusão de `Contact` não é permitida se houver conversas/tickets (restrição de integridade).
- Campos de SLA (`firstResponseDueAt`, `resolutionDueAt`) são recalculados ao reabrir um ticket.
- `Conversation` pode ter apenas um `assigneeId` ativo (a troca de atendente é transacional).
