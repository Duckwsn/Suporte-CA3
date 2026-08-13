import { NavLink } from 'react-router-dom'
import { Headset, LayoutDashboard, LifeBuoy, Users, MessagesSquare, BarChart3, Star, Settings, UsersRound, Building2, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'

const getItems = (t: (key: string) => string) => [
  { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  { to: '/atendimento', label: t('nav.conversations'), icon: MessagesSquare },
  { to: '/tickets', label: t('nav.tickets'), icon: LifeBuoy },
  { to: '/contatos', label: t('nav.contacts'), icon: Users },
  { to: '/equipes', label: t('nav.teams'), icon: UsersRound },
  { to: '/relatorios', label: t('nav.reports'), icon: BarChart3 },
  { to: '/csat', label: t('nav.csat'), icon: Star },
  { to: '/organizacoes', label: t('nav.organizations'), icon: Building2 },
  { to: '/configuracoes', label: t('nav.settings'), icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const { t } = useTranslation()
  const items = getItems(t)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-overlay bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-drawer flex w-64 flex-col bg-sidebar-bg transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center rounded-md text-sm font-bold text-brand-ink"
              style={{ backgroundColor: 'var(--color-sidebar-logo-bg)' }}
            >
              <Headset className="size-5" />
            </span>
            <span className="text-lg font-semibold text-white">{t('app.name')}</span>
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
