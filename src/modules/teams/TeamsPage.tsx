import { useEffect, useState } from 'react'
import { Plus, Users, Ticket, UserPlus, Trash2, X } from 'lucide-react'
import { PageHeader, Card, Button, Input, Textarea, Select, Modal, Drawer, LoadingState, ErrorState, Badge, Avatar } from '@/shared/components'
import { TeamService } from '@/services/TeamService'
import { UserService } from '@/services/AdminService'
import { roleLabels } from '@/utils/labels'
import type { Team, User } from '@/types'

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '', supervisorId: '' })

  const [detail, setDetail] = useState<Team | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [memberId, setMemberId] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [t, u] = await Promise.all([TeamService.list(), UserService.list('', 1, 100)])
      setTeams(t)
      setUsers(u.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipes')
    } finally {
      setLoading(false)
    }
  }

  async function createTeam() {
    if (!newTeam.name.trim()) return
    setSaving(true)
    setError('')
    try {
      await TeamService.create({
        name: newTeam.name.trim(),
        description: newTeam.description.trim() || undefined,
        supervisorId: newTeam.supervisorId || undefined,
      })
      setCreating(false)
      setNewTeam({ name: '', description: '', supervisorId: '' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar equipe')
    } finally {
      setSaving(false)
    }
  }

  async function openDetail(team: Team) {
    setError('')
    setMemberId('')
    try {
      const full = await TeamService.detail(team.id)
      setDetail(full)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe')
    }
  }

  async function removeTeam(team: Team) {
    if (!confirm(`Excluir a equipe "${team.name}"?`)) return
    setError('')
    try {
      await TeamService.removeTeam(team.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir equipe')
    }
  }

  async function addMember() {
    if (!detail || !memberId) return
    setError('')
    try {
      await TeamService.addMember(detail.id, memberId)
      setMemberId('')
      await openDetail(detail)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro')
    }
  }

  async function removeMember(userId: string) {
    if (!detail) return
    setError('')
    try {
      await TeamService.removeMember(detail.id, userId)
      await openDetail(detail)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover membro')
    }
  }

  const availableUsers = users.filter((u) => !u.teamId || u.teamId === detail?.id)
  const supervisorOptions = [{ value: '', label: 'Sem supervisor' }, ...users.map((u) => ({ value: u.id, label: u.name }))]

  return (
    <div>
      <PageHeader
        title="Equipes"
        subtitle="Times de atendimento, supervisores e filas"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Nova equipe
          </Button>
        }
      />

      {loading && <LoadingState label="Carregando equipes..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <p className="text-center text-sm text-text-secondary">Nenhuma equipe cadastrada</p>
            </Card>
          )}
          {teams.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-text-primary">{t.name}</h2>
                  <p className="mt-0.5 text-sm text-text-secondary">{t.description || 'Sem descrição'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void removeTeam(t)}
                    className="rounded-md p-1 text-muted-soft hover:bg-bg-subtle hover:text-danger"
                    aria-label={`Excluir ${t.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-muted-soft" /> {t._count?.members ?? 0} membros
                </span>
                <span className="flex items-center gap-1.5">
                  <Ticket className="size-4 text-muted-soft" /> {t._count?.tickets ?? 0} tickets
                </span>
              </div>

              {t.supervisor && (
                <div className="flex items-center gap-2">
                  <Avatar name={t.supervisor.name} size="sm" />
                  <div className="text-xs">
                    <p className="text-muted-soft">Supervisor</p>
                    <p className="font-medium text-text-primary">{t.supervisor.name}</p>
                  </div>
                </div>
              )}

              <div className="mt-auto border-t border-color-border-light pt-3">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => void openDetail(t)}>
                  Gerenciar membros
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={creating}
        title="Nova equipe"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void createTeam()} loading={saving} disabled={!newTeam.name.trim()}>
              Criar equipe
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} placeholder="Ex.: Suporte Nível 1" />
          <Textarea label="Descrição (opcional)" value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} rows={2} placeholder="Ex.: Primeiro ponto de contato" />
          <Select label="Supervisor" options={supervisorOptions} value={newTeam.supervisorId} onChange={(e) => setNewTeam({ ...newTeam, supervisorId: e.target.value })} />
        </div>
      </Modal>

      <Drawer open={!!detail} title={detail?.name ?? ''} onClose={() => setDetail(null)} width="w-[28rem]">
        {detail && (
          <div className="flex flex-col gap-4">
            {detail.description && <p className="text-sm text-text-secondary">{detail.description}</p>}

            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Users className="size-4 text-muted-soft" /> Membros ({detail.members?.length ?? 0})
              </h3>
              {detail.members && detail.members.length === 0 && (
                <p className="text-sm text-text-secondary">Nenhum membro na equipe</p>
              )}
              <div className="flex flex-col gap-2">
                {detail.members?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-color-border-light p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{m.name}</p>
                        <p className="text-xs text-muted-soft">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={m.role === 'SUPERVISOR' ? 'warning' : m.role === 'ADMIN' ? 'danger' : 'info'}>
                        {roleLabels[m.role] ?? m.role}
                      </Badge>
                      <button
                        onClick={() => void removeMember(m.id)}
                        className="rounded-md p-1 text-muted-soft hover:bg-bg-subtle hover:text-danger"
                        aria-label={`Remover ${m.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-color-border-light pt-4">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Adicionar membro</h3>
              {addingMember ? (
                <div className="flex items-end gap-2">
                  <Select
                    className="flex-1"
                    options={availableUsers
                      .filter((u) => !(detail.members ?? []).some((m) => m.id === u.id))
                      .map((u) => ({ value: u.id, label: `${u.name} — ${roleLabels[u.role] ?? u.role}` }))}
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                  />
                  <Button size="sm" onClick={() => void addMember()} disabled={!memberId}>
                    <UserPlus className="size-4" /> Adicionar
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setAddingMember(true)}>
                  <UserPlus className="size-4" /> Adicionar membro
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
