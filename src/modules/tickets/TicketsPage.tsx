import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { PageHeader, Card, Button, Input, Select, LoadingState, ErrorState, Badge } from '@/shared/components'
import { statusTone, priorityTone } from '@/shared/components/Badge'
import { TicketService } from '@/services/TicketService'
import { statusLabels, priorityLabels } from '@/utils/labels'
import { formatDateTime } from '@/utils/formatDate'
import type { Ticket } from '@/types'

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  useEffect(() => {
    void load()
  }, [status, priority])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await TicketService.list({ search, status, priority, limit: 50 })
      setTickets(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tickets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle="Acompanhe e gerencie os chamados"
        actions={
          <Link to="/tickets/novo">
            <Button>
              <Plus className="size-4" /> Novo ticket
            </Button>
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-soft" />
            <Input
              placeholder="Buscar por número, assunto ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void load()}
              className="pl-9"
            />
          </div>
          <Select
            options={[{ value: '', label: 'Todos os status' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'Todas as prioridades' }, ...Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))]}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </div>
      </Card>

      {loading && <LoadingState label="Carregando tickets..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <Card padding={false}>
          {tickets.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-secondary">Nenhum ticket encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-color-border-light text-xs uppercase tracking-wide text-muted-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nº</th>
                    <th className="px-4 py-3 font-medium">Assunto</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Prioridade</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Abertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-color-border-light">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-bg-subtle">
                      <td className="px-4 py-3 font-mono text-xs text-muted-soft">#{t.number}</td>
                      <td className="px-4 py-3">
                        <Link to={`/tickets/${t.id}`} className="font-medium text-text-primary hover:text-info">
                          {t.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(t.status)}>{statusLabels[t.status] ?? t.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={priorityTone(t.priority)}>{priorityLabels[t.priority] ?? t.priority}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{t.category ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{formatDateTime(t.openedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
