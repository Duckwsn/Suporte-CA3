import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader, Card, Button, LoadingState, ErrorState, Badge } from '@/shared/components'
import { statusTone, priorityTone } from '@/shared/components/Badge'
import { TicketService } from '@/services/TicketService'
import { statusLabels, priorityLabels } from '@/utils/labels'
import { formatDateTime } from '@/utils/formatDate'
import type { Ticket } from '@/types'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) void load()
  }, [id])

  async function load() {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const t = await TicketService.detail(id)
      setTicket(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ticket')
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve() {
    if (!id) return
    try {
      await TicketService.resolve(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    }
  }

  if (loading) return <LoadingState label="Carregando ticket..." />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!ticket) return null

  return (
    <div>
      <PageHeader
        title={`#${ticket.number} · ${ticket.subject}`}
        subtitle={`Aberto em ${formatDateTime(ticket.openedAt)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-2 font-semibold text-text-primary">Descrição</h2>
            <p className="whitespace-pre-wrap text-sm text-text-secondary">{ticket.description}</p>
          </Card>

          <Card className="mt-4">
            <h2 className="mb-2 font-semibold text-text-primary">Resolução</h2>
            <p className="mb-3 text-xs text-muted-soft">
              {ticket.status === 'RESOLVIDO'
                ? 'Este ticket já foi marcado como resolvido.'
                : 'Confirme a resolução do chamado para a equipe e o cliente.'}
            </p>
            <Button onClick={() => void handleResolve()} disabled={ticket.status === 'RESOLVIDO'}>
              {ticket.status === 'RESOLVIDO' ? 'Ticket resolvido' : 'Marcar como resolvido'}
            </Button>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 font-semibold text-text-primary">Detalhes</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-soft">Status</dt>
                <dd>
                  <Badge tone={statusTone(ticket.status)}>{statusLabels[ticket.status] ?? ticket.status}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">Prioridade</dt>
                <dd>
                  <Badge tone={priorityTone(ticket.priority)}>{priorityLabels[ticket.priority] ?? ticket.priority}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">Categoria</dt>
                <dd className="text-text-primary">{ticket.category ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">Solicitante</dt>
                <dd className="text-text-primary">{ticket.contact?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">Atribuído a</dt>
                <dd className="text-text-primary">{ticket.assignee?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">Equipe</dt>
                <dd className="text-text-primary">{ticket.team?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">SLA 1ª resposta</dt>
                <dd className="text-text-primary">{ticket.firstResponseDueAt ? formatDateTime(ticket.firstResponseDueAt) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-soft">SLA resolução</dt>
                <dd className="text-text-primary">{ticket.resolutionDueAt ? formatDateTime(ticket.resolutionDueAt) : '—'}</dd>
              </div>
              {ticket.resolvedAt && (
                <div className="flex justify-between">
                  <dt className="text-muted-soft">Resolvido em</dt>
                  <dd className="text-text-primary">{formatDateTime(ticket.resolvedAt)}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
