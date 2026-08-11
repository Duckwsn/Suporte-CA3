import { useEffect, useRef, useState } from 'react'
import { PageHeader, Card, Button, Badge, Avatar, LoadingState, ErrorState, Input } from '@/shared/components'
import { statusTone } from '@/shared/components/Badge'
import { ConversationService } from '@/services/ConversationService'
import { usePolling } from '@/hooks/usePolling'
import { statusLabels, channelLabels } from '@/utils/labels'
import { formatDateTime } from '@/utils/formatDate'
import type { Conversation, Message } from '@/types'

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void loadConversations()
  }, [])

  async function loadConversations() {
    setError('')
    try {
      const res = await ConversationService.list({ limit: 50 })
      setConversations(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversas')
    } finally {
      setLoading(false)
    }
  }

  async function openConversation(id: string) {
    setError('')
    try {
      const conv = await ConversationService.detail(id)
      setActive(conv)
      setMessages(conv.messages ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir conversa')
    }
  }

  usePolling(
    async () => {
      await loadConversations()
      if (active) await openConversation(active.id)
    },
    5000,
  )

  async function sendMessage() {
    if (!active || !text.trim()) return
    try {
      await ConversationService.sendMessage(active.id, { senderType: 'AGENT', body: text })
      setText('')
      await openConversation(active.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const statusTabs: Array<{ value: string; label: string }> = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'AGUARDANDO_ATENDENTE', label: 'Fila' },
    { value: 'EM_ATENDIMENTO', label: 'Em atendimento' },
    { value: 'RESOLVIDO', label: 'Resolvidas' },
  ]
  const [tab, setTab] = useState('TODAS')

  const filtered =
    tab === 'TODAS' ? conversations : conversations.filter((c) => c.status === tab)

  return (
    <div>
      <PageHeader title="Atendimento" subtitle="Converse com clientes em tempo real" />

      {loading && <LoadingState label="Carregando conversas..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void loadConversations()} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card padding={false} className="lg:col-span-1">
            <div className="flex gap-1 overflow-x-auto border-b border-color-border-light p-2">
              {statusTabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    tab === t.value ? 'bg-brand text-brand-ink' : 'text-muted-soft hover:bg-bg-subtle'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="max-h-[600px] divide-y divide-color-border-light overflow-y-auto">
              {filtered.length === 0 && <p className="p-6 text-center text-sm text-text-secondary">Nenhuma conversa</p>}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => void openConversation(c.id)}
                  className={`flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg-subtle ${
                    active?.id === c.id ? 'bg-bg-subtle' : ''
                  }`}
                >
                  <Avatar name={c.contact?.name ?? '?'} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{c.title ?? c.contact?.name}</p>
                    <p className="truncate text-xs text-text-secondary">{channelLabels[c.channel] ?? c.channel}</p>
                  </div>
                  <Badge tone={statusTone(c.status)}>{statusLabels[c.status] ?? c.status}</Badge>
                </button>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-2">
            {!active ? (
              <Card className="flex h-full min-h-48 items-center justify-center text-sm text-text-secondary">
                Selecione uma conversa para começar a atender
              </Card>
            ) : (
              <Card padding={false} className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-color-border-light px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={active.contact?.name ?? '?'} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{active.title ?? active.contact?.name}</p>
                      <p className="text-xs text-text-secondary">
                        {active.contact?.email ?? active.contact?.phone ?? channelLabels[active.channel]}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTone(active.status)}>{statusLabels[active.status] ?? active.status}</Badge>
                </div>

                <div className="max-h-[480px] flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 && <p className="text-center text-sm text-text-secondary">Nenhuma mensagem</p>}
                  {messages.map((m) => {
                    const mine = m.senderType === 'AGENT'
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            mine ? 'bg-brand text-brand-ink' : 'bg-bg-subtle text-text-primary'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className={`mt-1 text-[10px] ${mine ? 'text-brand-ink/70' : 'text-muted-soft'}`}>
                            {m.sender?.name ?? 'Sistema'} · {formatDateTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={endRef} />
                </div>

                <div className="flex gap-2 border-t border-color-border-light p-3">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void sendMessage()}
                    placeholder="Digite sua mensagem..."
                  />
                  <Button onClick={() => void sendMessage()} disabled={!text.trim()}>
                    Enviar
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
