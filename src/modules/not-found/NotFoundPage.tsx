import { Link } from 'react-router-dom'
import { Button } from '@/shared/components'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-number text-text-primary">404</p>
      <p className="text-text-secondary">Página não encontrada</p>
      <Link to="/dashboard">
        <Button>Voltar ao dashboard</Button>
      </Link>
    </div>
  )
}
