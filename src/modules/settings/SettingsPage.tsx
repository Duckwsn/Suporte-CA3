import { useEffect, useState } from 'react'
import { UserPlus, Check, Power } from 'lucide-react'
import { PageHeader, Card, Input, Button, Select, Switch, Modal, LoadingState, ErrorState, Badge } from '@/shared/components'
import { SlaService, UserService } from '@/services/AdminService'
import { roleLabels } from '@/utils/labels'
import type { SlaPolicy, User, Role } from '@/types'

const roles = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))

const emptyNewUser = { name: '', email: '', password: '', role: 'AGENT' as Role }

export function SettingsPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    category: '',
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 480,
    businessHoursOnly: true,
  })
  const [saving, setSaving] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState(emptyNewUser)
  const [savingUser, setSavingUser] = useState(false)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [p, u] = await Promise.all([SlaService.listPolicies(), UserService.list('', 1, 100)])
      setPolicies(p)
      setUsers(u.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  async function createPolicy() {
    setSaving(true)
    setError('')
    try {
      await SlaService.createPolicy({
        ...newPolicy,
        category: newPolicy.category || undefined,
        responseTimeMinutes: Number(newPolicy.responseTimeMinutes),
        resolutionTimeMinutes: Number(newPolicy.resolutionTimeMinutes),
      })
      setNewPolicy({ name: '', category: '', responseTimeMinutes: 60, resolutionTimeMinutes: 480, businessHoursOnly: true })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar política')
    } finally {
      setSaving(false)
    }
  }

  async function togglePolicy(p: SlaPolicy) {
    setError('')
    try {
      await SlaService.updatePolicy(p.id, { isActive: !p.isActive })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar política')
    }
  }

  async function updateRole(u: User, role: Role) {
    if (role === u.role) return
    setError('')
    try {
      await UserService.update(u.id, { role })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar papel')
    }
  }

  async function toggleActive(u: User) {
    setError('')
    try {
      if (u.isActive) {
        await UserService.deactivate(u.id)
      } else {
        await UserService.update(u.id, { isActive: true })
      }
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: !u.isActive } : x)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário')
    }
  }

  async function createUser() {
    setSavingUser(true)
    setError('')
    try {
      await UserService.create(newUser)
      setCreatingUser(false)
      setNewUser(emptyNewUser)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setSavingUser(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Políticas de SLA, usuários e administração do sistema"
        actions={
          <Button onClick={() => setCreatingUser(true)}>
            <UserPlus className="size-4" /> Novo usuário
          </Button>
        }
      />

      {loading && <LoadingState label="Carregando configurações..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Card>
              <h2 className="mb-4 font-semibold text-text-primary">Políticas de SLA</h2>
              {policies.length === 0 && <p className="text-sm text-text-secondary">Nenhuma política cadastrada</p>}
              <div className="flex flex-col gap-3">
                {policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-color-border-light p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-muted-soft">
                        {p.category ?? 'Todas categorias'} · {p.responseTimeMinutes}min resposta / {p.resolutionTimeMinutes}min resolução ·{' '}
                        {p.businessHoursOnly ? 'horário comercial' : '24/7'}
                      </p>
                    </div>
                    <Switch
                      checked={p.isActive}
                      onChange={() => void togglePolicy(p)}
                      label={p.isActive ? 'Ativa' : 'Inativa'}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 font-semibold text-text-primary">Nova política de SLA</h2>
              <div className="flex flex-col gap-3">
                <Input label="Nome" value={newPolicy.name} onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })} placeholder="Ex.: SLA Pro" />
                <Input label="Categoria (opcional)" value={newPolicy.category} onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })} placeholder="Ex.: HARDWARE" />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Tempo resposta (min)"
                    type="number"
                    min={1}
                    value={newPolicy.responseTimeMinutes}
                    onChange={(e) => setNewPolicy({ ...newPolicy, responseTimeMinutes: Number(e.target.value) })}
                  />
                  <Input
                    label="Tempo resolução (min)"
                    type="number"
                    min={1}
                    value={newPolicy.resolutionTimeMinutes}
                    onChange={(e) => setNewPolicy({ ...newPolicy, resolutionTimeMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-color-border-light p-3">
                  <Switch checked={newPolicy.businessHoursOnly} onChange={(v) => setNewPolicy({ ...newPolicy, businessHoursOnly: v })} />
                  <span className="text-sm text-text-secondary">Contar apenas horário comercial</span>
                </div>
                <Button onClick={() => void createPolicy()} loading={saving} disabled={!newPolicy.name.trim()}>
                  Criar política
                </Button>
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Usuários</h2>
              <span className="text-xs text-muted-soft">{users.length} usuários</span>
            </div>
            <div className="flex flex-col gap-2">
              {users.length === 0 && <p className="text-sm text-text-secondary">Nenhum usuário</p>}
              {users.map((u) => (
                <div key={u.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-color-border-light p-3 ${u.isActive ? '' : 'opacity-60'}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{u.name}</p>
                      {!u.isActive && <Badge tone="danger">Inativo</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-soft">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      className="w-40"
                      options={roles}
                      value={u.role}
                      onChange={(e) => void updateRole(u, e.target.value as Role)}
                    />
                    <button
                      onClick={() => void toggleActive(u)}
                      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                      aria-label={u.isActive ? `Desativar ${u.name}` : `Ativar ${u.name}`}
                      title={u.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {u.isActive ? <Power className="size-4" /> : <Check className="size-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={creatingUser}
        title="Novo usuário"
        onClose={() => setCreatingUser(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreatingUser(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void createUser()} loading={savingUser} disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.password}>
              Criar usuário
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Ex.: Ana Atendente" />
          <Input label="E-mail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="ana@empresa.com" />
          <Input label="Senha" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
          <Select
            label="Papel"
            options={roles}
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
          />
        </div>
      </Modal>
    </div>
  )
}
