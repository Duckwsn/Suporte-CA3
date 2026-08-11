import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageHeader, Card, Button, Input, LoadingState, ErrorState, Avatar } from '@/shared/components'
import { ContactService } from '@/services/ContactService'
import { formatDateTime } from '@/utils/formatDate'
import type { Contact } from '@/types'

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await ContactService.list(search)
      setContacts(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Contatos"
        subtitle="Clientes e pessoas atendidas"
        actions={
          <Button>
            <Plus className="size-4" /> Novo contato
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-soft" />
          <Input
            placeholder="Buscar contatos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            className="pl-9"
          />
        </div>
      </Card>

      {loading && <LoadingState label="Carregando contatos..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.length === 0 && <p className="text-sm text-text-secondary">Nenhum contato encontrado</p>}
          {contacts.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-primary">{c.name}</p>
                  <p className="truncate text-xs text-text-secondary">{c.email ?? c.phone ?? '—'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-color-border-light pt-3 text-xs text-muted-soft">
                <span>{c._count ? `${c._count.conversations} conversas · ${c._count.tickets} tickets` : 'Sem dados'}</span>
                <span>{formatDateTime(c.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
