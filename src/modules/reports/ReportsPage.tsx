import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { PageHeader, Card, KpiCard, Button, LoadingState, ErrorState } from '@/shared/components'
import { ReportService } from '@/services/ReportService'
import type { ReportKpis, VolumePoint } from '@/types'

export function ReportsPage() {
  const [kpis, setKpis] = useState<ReportKpis | null>(null)
  const [volume, setVolume] = useState<VolumePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [k, v] = await Promise.all([ReportService.kpis(), ReportService.volume()])
      setKpis(k)
      setVolume(v)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const maxCount = Math.max(1, ...volume.map((v) => v.count))

  async function handleExport() {
    try {
      const blob = await ReportService.exportCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tickets.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erro ao exportar CSV')
    }
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Indicadores de atendimento"
        actions={
          <Button variant="secondary" onClick={handleExport}>
            <Download className="size-4" /> Exportar CSV
          </Button>
        }
      />

      {loading && <LoadingState label="Carregando relatórios..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && kpis && (
        <>
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

          <Card className="mt-6">
            <h2 className="mb-4 font-semibold text-text-primary">Volume de tickets (30 dias)</h2>
            {volume.length === 0 ? (
              <p className="text-sm text-text-secondary">Sem dados no período</p>
            ) : (
              <div className="flex h-48 items-end gap-1">
                {volume.map((v) => (
                  <div key={v.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-soft">{v.count}</span>
                    <div
                      className="w-full rounded-t bg-info/70 transition-all"
                      style={{ height: `${Math.max(2, (v.count / maxCount) * 100)}%` }}
                      title={`${v.date}: ${v.count}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
