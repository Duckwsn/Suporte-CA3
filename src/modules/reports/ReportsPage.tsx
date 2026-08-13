import { useEffect, useState } from 'react'
import { Download, Star, BarChart3 } from 'lucide-react'
import { PageHeader, Card, KpiCard, Button, Input, LoadingState, ErrorState, ProgressBar } from '@/shared/components'
import { ReportService } from '@/services/ReportService'
import type { AnalyticsBreakdown, CsatSummary, ReportKpis, VolumePoint } from '@/types'

export function ReportsPage() {
  const [kpis, setKpis] = useState<ReportKpis | null>(null)
  const [volume, setVolume] = useState<VolumePoint[]>([])
  const [csat, setCsat] = useState<CsatSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    void load()
  }, [from, to])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [k, v, c, a] = await Promise.all([
        ReportService.kpis(),
        ReportService.volume(from || undefined, to || undefined),
        ReportService.csatSummary(),
        ReportService.analytics(from || undefined, to || undefined),
      ])
      setKpis(k)
      setVolume(v)
      setCsat(c)
      setAnalytics(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const maxCount = Math.max(1, ...volume.map((v) => v.count))
  const maxDistribution = Math.max(1, ...(csat?.distribution.map((d) => d.count) ?? [0]))

  async function handleExport() {
    try {
      const blob = await ReportService.exportCsv('tickets', from || undefined, to || undefined)
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

  const maxAnalytics = Math.max(1, ...(analytics?.byStatus.map((s) => s.count) ?? [0]))

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

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="De"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
          <Input
            label="Até"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
          {(from || to) && (
            <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo('') }}>
              Limpar filtros
            </Button>
          )}
        </div>
      </Card>

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

          {analytics && (
            <Card className="mt-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="size-5 text-info" />
                <h2 className="font-semibold text-text-primary">Análise de tickets</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-medium text-text-primary">Por status</h3>
                  <div className="space-y-2">
                    {analytics.byStatus.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="w-32 truncate text-xs text-text-secondary">{item.key}</span>
                        <div className="flex-1">
                          <ProgressBar value={item.count} max={maxAnalytics} />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-text-primary">Por prioridade</h3>
                  <div className="space-y-2">
                    {analytics.byPriority.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="w-32 truncate text-xs text-text-secondary">{item.key}</span>
                        <div className="flex-1">
                          <ProgressBar value={item.count} max={maxAnalytics} />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-text-primary">Por categoria</h3>
                  <div className="space-y-2">
                    {analytics.byCategory.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="w-32 truncate text-xs text-text-secondary">{item.key}</span>
                        <div className="flex-1">
                          <ProgressBar value={item.count} max={maxAnalytics} />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-medium text-text-primary">Por canal</h3>
                  <div className="space-y-2">
                    {analytics.byChannel.map((item) => (
                      <div key={item.key} className="flex items-center gap-3">
                        <span className="w-32 truncate text-xs text-text-secondary">{item.key}</span>
                        <div className="flex-1">
                          <ProgressBar value={item.count} max={maxAnalytics} />
                        </div>
                        <span className="text-xs font-medium text-text-primary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="mt-6" padding>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Satisfação (CSAT)</h2>
              <div className="flex items-center gap-1 text-brand">
                <Star className="size-4 fill-current" />
                <span className="font-semibold">{csat ? csat.average.toFixed(2) : '-'}/5</span>
              </div>
            </div>
            {csat && csat.total > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <KpiCard label="Avaliações" value={csat.total} />
                    <KpiCard label="Promotores (4-5)" value={`${csat.promoterRate}%`} />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-text-primary">Distribuição</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const item = csat.distribution.find((d) => d.rating === star)
                      return (
                        <div key={star}>
                          <p className="mb-0.5 flex items-center justify-between text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              {star} <Star className="size-3 text-brand" />
                            </span>
                            <span>{item?.count ?? 0}</span>
                          </p>
                          <ProgressBar value={item?.count ?? 0} max={maxDistribution} />
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-text-primary">Por atendente</h3>
                  {csat.byAssignee.length === 0 ? (
                    <p className="text-sm text-text-secondary">Sem dados</p>
                  ) : (
                    <div className="space-y-2">
                      {csat.byAssignee.map((a) => (
                        <div key={a.assigneeId} className="flex items-center justify-between rounded-md border border-color-border-light px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{a.name}</p>
                            <p className="text-xs text-text-secondary">{a.count} avaliação(ões)</p>
                          </div>
                          <span className="text-sm font-semibold text-brand">{a.average.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Nenhuma avaliação registrada ainda.</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
