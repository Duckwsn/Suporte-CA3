import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, KpiCard, Card, LoadingState, ErrorState } from '@/shared/components'
import { ReportService } from '@/services/ReportService'
import { TicketService } from '@/services/TicketService'
import { ConversationService } from '@/services/ConversationService'
import type { ReportKpis, Ticket, Conversation } from '@/types'
import { statusTone, priorityTone, Badge } from '@/shared/components/Badge'
import { statusLabels, priorityLabels } from '@/utils/labels'
import { formatDateTime } from '@/utils/formatDate'

export function DashboardPage() {
  const [kpis, setKpis] = useState<ReportKpis | null>(null)
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setError('')
    try {
      const [k, t, c] = await Promise.all([
        ReportService.kpis(),
        TicketService.list({ limit: 5 }),
        ConversationService.list({ limit: 5 }),
      ])
      setKpis(k)
      setRecentTickets(t.items)
      setRecentConversations(c.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!kpis) return <LoadingState label="Carregando painel..." />

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do atendimento" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tickets abertos" value={kpis.ticketsOpen} />
        <KpiCard label="Conversas ativas" value={kpis.conversationsActive} />
        <KpiCard
          label="Conformidade de SLA"
          value={`${kpis.slaCompliance}%`}
          tone={kpis.slaCompliance >= 90 ? 'success' : kpis.slaCompliance >= 70 ? 'warning' : 'danger'}
        />
        <KpiCard label="Tempo médio 1ª resposta" value={`${kpis.avgFirstResponseMinutes} min`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Tickets recentes</h2>
            <Link to="/tickets" className="text-sm text-info hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-color-border-light">
            {recentTickets.length === 0 && <p className="py-4 text-sm text-text-secondary">Nenhum ticket</p>}
            {recentTickets.map((t) => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-bg-subtle">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    #{t.number} · {t.subject}
                  </p>
                  <p className="text-xs text-text-secondary">{formatDateTime(t.openedAt)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Badge tone={statusTone(t.status)}>{statusLabels[t.status] ?? t.status}</Badge>
                  <Badge tone={priorityTone(t.priority)}>{priorityLabels[t.priority] ?? t.priority}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Conversas recentes</h2>
            <Link to="/atendimento" className="text-sm text-info hover:underline">
              Ir ao atendimento
            </Link>
          </div>
          <div className="divide-y divide-color-border-light">
            {recentConversations.length === 0 && <p className="py-4 text-sm text-text-secondary">Nenhuma conversa</p>}
            {recentConversations.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{c.title ?? c.contact?.name}</p>
                  <p className="text-xs text-text-secondary">{c.channel}</p>
                </div>
                <Badge tone={statusTone(c.status)}>{statusLabels[c.status] ?? c.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
