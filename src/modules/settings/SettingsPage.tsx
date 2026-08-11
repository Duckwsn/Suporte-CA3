import { useEffect, useState } from 'react'
import { PageHeader, Card, Input, Button, Select, Switch, LoadingState, ErrorState } from '@/shared/components'
import { SlaService, UserService } from '@/services/AdminService'
import { roleLabels } from '@/utils/labels'
import type { SlaPolicy, User } from '@/types'

const roles = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))

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

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [p, u] = await Promise.all([SlaService.listPolicies(), UserService.list()])
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

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Políticas de SLA e usuários do sistema" />

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
            <h2 className="mb-4 font-semibold text-text-primary">Usuários</h2>
            <div className="flex flex-col gap-2">
              {users.length === 0 && <p className="text-sm text-text-secondary">Nenhum usuário</p>}
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-color-border-light p-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{u.name}</p>
                    <p className="text-xs text-muted-soft">{u.email}</p>
                  </div>
                  <Select
                    className="w-40"
                    options={roles}
                    value={u.role}
                    onChange={() => undefined}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
