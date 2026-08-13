import { useState, useEffect } from 'react'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { OrganizationService } from '@/services/OrganizationService'
import type { Organization } from '@/types'

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOrgs()
  }, [])

  async function loadOrgs() {
    try {
      const data = await OrganizationService.list()
      setOrgs(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.slug) return
    setSaving(true)
    try {
      const org = await OrganizationService.create(form)
      setOrgs((prev) => [...prev, org])
      setShowCreate(false)
      setForm({ name: '', slug: '' })
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(org: Organization) {
    await OrganizationService.update(org.id, { isActive: !org.isActive })
    setOrgs((prev) => prev.map((o) => (o.id === org.id ? { ...o, isActive: !o.isActive } : o)))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Organizações" subtitle="Gerencie organizações do sistema">
        <Button onClick={() => setShowCreate(true)}>Nova Organização</Button>
      </PageHeader>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : orgs.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">Nenhuma organização encontrada</Card>
      ) : (
        <div className="grid gap-4">
          {orgs.map((org) => (
            <Card key={org.id} className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium text-slate-900">{org.name}</h3>
                <p className="text-sm text-slate-500">{org.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={org.isActive ? 'success' : 'danger'}>
                  {org.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleToggle(org)}>
                  {org.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Organização">
        <div className="space-y-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Minha Empresa"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
            placeholder="ex: minha-empresa"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !form.name || !form.slug}>
              {saving ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
