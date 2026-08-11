export type Role = 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'CUSTOMER'
export type ConversationChannel = 'WEB' | 'WHATSAPP' | 'EMAIL'
export type ConversationStatus = 'AGUARDANDO_ATENDENTE' | 'EM_ATENDIMENTO' | 'RESOLVIDO' | 'FECHADO'
export type MessageSenderType = 'CONTACT' | 'AGENT' | 'SYSTEM'
export type MessageStatus = 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'FALHOU'
export type TicketStatus = 'ABERTO' | 'EM_ATENDIMENTO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'FECHADO'
export type TicketPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type SlaBreachType = 'PRIMEIRA_RESPOSTA' | 'RESOLUCAO'
export type NotificationType = 'TICKET_ATRIBUIDO' | 'NOVA_MENSAGEM' | 'SLA_VIOLADO'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  teamId: string | null
  isActive: boolean
  avatarUrl?: string | null
  createdAt: string
  team?: { id: string; name: string } | null
}

export interface Team {
  id: string
  name: string
  description?: string | null
  supervisorId?: string | null
  supervisor?: { id: string; name: string } | null
  members?: User[]
  _count?: { members: number; tickets: number }
}

export interface Contact {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  whatsappId?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  _count?: { conversations: number; tickets: number }
}

export interface Conversation {
  id: string
  channel: ConversationChannel
  status: ConversationStatus
  contactId: string
  assigneeId?: string | null
  teamId?: string | null
  title?: string | null
  startedAt: string
  lastMessageAt?: string | null
  resolvedAt?: string | null
  contact?: Pick<Contact, 'id' | 'name' | 'phone' | 'email' | 'whatsappId'>
  assignee?: { id: string; name: string } | null
  team?: { id: string; name: string } | null
  _count?: { messages: number; tickets: number }
  messages?: Message[]
  tickets?: TicketSummary[]
}

export interface Message {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderId?: string | null
  body: string
  mediaUrl?: string | null
  status: MessageStatus
  deliveredAt?: string | null
  readAt?: string | null
  createdAt: string
  sender?: { id: string; name: string; role?: Role } | null
}

export interface SlaPolicy {
  id: string
  name: string
  category?: string | null
  responseTimeMinutes: number
  resolutionTimeMinutes: number
  businessHoursOnly: boolean
  isActive: boolean
  _count?: { tickets: number }
}

export interface SlaBreach {
  id: string
  ticketId: string
  type: SlaBreachType
  dueAt: string
  detectedAt: string
  resolved: boolean
}

export interface Ticket {
  id: string
  number: number
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category?: string | null
  conversationId?: string | null
  contactId?: string | null
  assigneeId?: string | null
  teamId?: string | null
  slaPolicyId?: string | null
  firstResponseDueAt?: string | null
  resolutionDueAt?: string | null
  firstResponseAt?: string | null
  resolvedAt?: string | null
  openedAt: string
  createdAt: string
  updatedAt: string
  contact?: Pick<Contact, 'id' | 'name' | 'phone' | 'email'> | null
  assignee?: { id: string; name: string; email: string } | null
  team?: { id: string; name: string } | null
  slaPolicy?: { id: string; name: string; category?: string | null } | null
  slaBreaches?: SlaBreach[]
}

export interface TicketSummary {
  id: string
  number: number
  subject: string
  status: TicketStatus
  priority: TicketPriority
}

export interface Notification {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  body?: string | null
  readAt?: string | null
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ReportKpis {
  ticketsOpen: number
  conversationsActive: number
  slaCompliance: number
  avgFirstResponseMinutes: number
  resolvedTickets: number
}

export interface VolumePoint {
  date: string
  count: number
}
