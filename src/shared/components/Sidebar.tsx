import { NavLink } from 'react-router-dom'
import { Headset, LayoutDashboard, LifeBuoy, Users, MessagesSquare, BarChart3, Settings, UsersRound, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/atendimento', label: 'Atendimento', icon: MessagesSquare },
  { to: '/tickets', label: 'Tickets', icon: LifeBuoy },
  { to: '/contatos', label: 'Contatos', icon: Users },
  { to: '/equipes', label: 'Equipes', icon: UsersRound },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-overlay bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-dropdown flex w-64 flex-col bg-sidebar-bg transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center rounded-md text-sm font-bold text-brand-ink"
              style={{ backgroundColor: 'var(--color-sidebar-logo-bg)' }}
            >
              <Headset className="size-5" />
            </span>
            <span className="text-lg font-semibold text-white">Suporte CA3</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white lg:hidden" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-item-active-bg text-sidebar-item-active-text'
                    : 'text-sidebar-item-inactive hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>
      </aside>
    </>
  )
}
