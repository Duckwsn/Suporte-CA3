import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader, Card, Button, Input, Textarea, Select, ErrorState } from '@/shared/components'
import { TicketService } from '@/services/TicketService'
import { priorityLabels } from '@/utils/labels'

const CATEGORIES = ['Hardware', 'Software', 'Rede', 'Acesso', 'Outros']

export function NewTicketPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIA')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      setError('Assunto e descrição são obrigatórios')
      return
    }
    setSaving(true)
    setError('')
    try {
      const ticket = await TicketService.create({
        subject: subject.trim(),
        description: description.trim(),
        priority: priority as 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE',
        category: category || null,
      })
      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar ticket')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Novo ticket"
        subtitle="Abra um chamado de suporte"
        actions={
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">Assunto</label>
            <Input
              placeholder="Resumo do problema"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">Descrição</label>
            <Textarea
              placeholder="Descreva o problema em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Prioridade</label>
              <Select
                options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">Categoria</label>
              <Select
                options={[{ value: '', label: 'Sem categoria' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={() => setError('')} />}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/tickets')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="size-4" /> {saving ? 'Criando...' : 'Criar ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
