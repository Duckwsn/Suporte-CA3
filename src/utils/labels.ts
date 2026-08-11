export const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  AGENT: 'Atendente',
  CUSTOMER: 'Cliente',
}

export const statusLabels: Record<string, string> = {
  AGUARDANDO_ATENDENTE: 'Aguardando',
  EM_ATENDIMENTO: 'Em atendimento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
  ABERTO: 'Aberto',
  AGUARDANDO_CLIENTE: 'Aguardando cliente',
}

export const priorityLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

export const channelLabels: Record<string, string> = {
  WEB: 'Web',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase()
}
