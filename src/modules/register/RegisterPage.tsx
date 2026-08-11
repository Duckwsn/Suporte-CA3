import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Select } from '@/shared/components'
import { useAuth } from '@/hooks/useAuth'
import { roleLabels } from '@/utils/labels'

const roles = Object.entries(roleLabels).map(([value, label]) => ({ value, label }))

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, role)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-sm rounded-xl border border-color-card-border bg-bg-card p-6" style={{ boxShadow: 'var(--color-card-shadow)' }}>
        <h1 className="mb-1 text-lg font-semibold text-text-primary">Criar conta</h1>
        <p className="mb-4 text-sm text-text-secondary">Registre-se para acessar o atendimento</p>

        {error && <div className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Select label="Tipo de conta" options={roles} value={role} onChange={(e) => setRole(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">
            Cadastrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-info hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
