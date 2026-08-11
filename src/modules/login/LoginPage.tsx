import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Headset } from 'lucide-react'
import { Button, Input } from '@/shared/components'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-brand)' }}>
            <Headset className="size-6 text-brand-ink" />
          </span>
          <h1 className="text-2xl font-bold text-text-primary">Suporte CA3</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-color-card-border bg-bg-card p-6" style={{ boxShadow: 'var(--color-card-shadow)' }}>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Entrar</h2>
          {error && (
            <div className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</div>
          )}
          <div className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Entrar
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-text-secondary">
            Não tem conta?{' '}
            <Link to="/register" className="font-medium text-info hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
