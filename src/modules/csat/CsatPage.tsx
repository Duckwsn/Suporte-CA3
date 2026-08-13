import { useEffect, useState } from 'react'
import { Star, TrendingUp, Users, AlertTriangle } from 'lucide-react'
import { PageHeader, Card, KpiCard, LoadingState, ErrorState, ProgressBar } from '@/shared/components'
import { ReportService } from '@/services/ReportService'
import type { CsatSummary } from '@/types'

export function CsatPage() {
  const [csat, setCsat] = useState<CsatSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await ReportService.csatSummary(90)
      setCsat(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar CSAT')
    } finally {
      setLoading(false)
    }
  }

  const maxDistribution = Math.max(1, ...(csat?.distribution.map((d) => d.count) ?? [0]))
  const lowRatings = csat?.distribution.filter((d) => d.rating <= 2).reduce((sum, d) => sum + d.count, 0) ?? 0

  return (
    <div>
      <PageHeader
        title="Satisfação do Cliente (CSAT)"
        subtitle="Métricas de qualidade do atendimento"
      />

      {loading && <LoadingState label="Carregando métricas CSAT..." />}
      {!loading && error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && csat && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Nota média"
              value={`${csat.average.toFixed(2)}/5`}
              tone={csat.average >= 4 ? 'success' : csat.average >= 3 ? 'warning' : 'danger'}
            />
            <KpiCard label="Total de avaliações" value={csat.total} />
            <KpiCard
              label="Promotores (4-5)"
              value={`${csat.promoterRate}%`}
              tone={csat.promoterRate >= 70 ? 'success' : csat.promoterRate >= 50 ? 'warning' : 'danger'}
            />
            <KpiCard
              label="Avaliações baixas (1-2)"
              value={lowRatings}
              tone={lowRatings === 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-5 text-info" />
                <h2 className="font-semibold text-text-primary">Distribuição de notas</h2>
              </div>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const item = csat.distribution.find((d) => d.rating === star)
                  const pct = csat.total > 0 ? ((item?.count ?? 0) / csat.total) * 100 : 0
                  return (
                    <div key={star}>
                      <p className="mb-1 flex items-center justify-between text-sm text-text-secondary">
                        <span className="flex items-center gap-1.5">
                          {star} <Star className="size-3.5 text-brand" />
                        </span>
                        <span className="font-medium text-text-primary">{item?.count ?? 0} ({pct.toFixed(1)}%)</span>
                      </p>
                      <ProgressBar value={item?.count ?? 0} max={maxDistribution} />
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <Users className="size-5 text-info" />
                <h2 className="font-semibold text-text-primary">Por atendente</h2>
              </div>
              {csat.byAssignee.length === 0 ? (
                <p className="text-sm text-text-secondary">Nenhum dado disponível</p>
              ) : (
                <div className="space-y-3">
                  {csat.byAssignee.map((a) => (
                    <div key={a.assigneeId} className="flex items-center justify-between rounded-lg border border-color-border-light p-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{a.name}</p>
                        <p className="text-xs text-text-secondary">{a.count} avaliação(ões)</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className={`size-4 ${a.average >= 4 ? 'text-success' : a.average >= 3 ? 'text-warning' : 'text-danger'}`} />
                        <span className="text-sm font-semibold">{a.average.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {csat.byTeam.length > 0 && (
            <Card className="mt-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="size-5 text-info" />
                <h2 className="font-semibold text-text-primary">Por equipe</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {csat.byTeam.map((t) => (
                  <div key={t.teamId} className="flex items-center justify-between rounded-lg border border-color-border-light p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{t.name}</p>
                      <p className="text-xs text-text-secondary">{t.count} avaliação(ões)</p>
                    </div>
                    <span className="text-sm font-semibold text-brand">{t.average.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lowRatings > 0 && (
            <Card className="mt-6 border-warning/30 bg-warning-bg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-warning" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Atenção: avaliações baixas</p>
                  <p className="text-xs text-text-secondary">
                    {lowRatings} avaliação(ões) com nota 1 ou 2 nos últimos 90 dias. Revise o atendimento correspondente.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {!loading && !error && csat && csat.total === 0 && (
        <Card className="mt-6">
          <p className="text-center text-sm text-text-secondary">Nenhuma avaliação registrada ainda.</p>
        </Card>
      )}
    </div>
  )
}
