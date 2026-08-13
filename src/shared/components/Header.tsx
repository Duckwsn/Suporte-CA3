import { useState } from 'react'
import { Bell, LogOut, Menu, CheckCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { NotificationService } from '@/services/ReportService'
import { usePolling } from '@/hooks/usePolling'
import { useSocketEvent } from '@/hooks/useRealtime'
import type { Notification } from '@/types'
import { Avatar } from './Avatar'
import { timeAgo } from '@/utils/formatDate'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  async function load() {
    try {
      const res = await NotificationService.list()
      setNotifications(res.items)
      setUnreadCount(res.unreadCount ?? res.items.filter((n) => !n.readAt).length)
    } catch {
      // silencioso
    }
  }

  usePolling(() => void load())

  useSocketEvent('notification:new', (payload) => {
    const n = payload as Notification
    setNotifications((prev) => [n, ...prev].slice(0, 50))
    setUnreadCount((count) => count + 1)
  })

  async function markAllRead() {
    try {
      await NotificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
      setUnreadCount(0)
    } catch {
      // silencioso
    }
  }

  function toggle() {
    setOpen((v) => !v)
  }

  return (
    <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-topbar-border bg-bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-text-secondary hover:text-text-primary lg:hidden" aria-label="Abrir menu">
          <Menu className="size-6" />
        </button>
        <span className="text-sm text-text-secondary">Painel de atendimento</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={toggle}
            className="relative rounded-md p-2 text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
            aria-label="Notificações"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-color-card-border bg-bg-surface shadow-lg animate-scale-up" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex items-center justify-between border-b border-color-border-light px-4 py-2">
                <span className="text-sm font-semibold text-text-primary">Notificações</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllRead()}
                    className="flex items-center gap-1 text-xs text-brand hover:underline"
                    aria-label="Marcar todas como lidas"
                  >
                    <CheckCheck className="size-3.5" /> Marcar todas
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-sm text-text-secondary">Nenhuma notificação</p>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-color-border-light px-4 py-3 last:border-0 ${n.readAt ? '' : 'bg-bg-subtle'}`}
                  >
                    <p className="text-sm font-medium text-text-primary">{n.title}</p>
                    {n.body && <p className="text-xs text-text-secondary">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-soft">{timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-color-border-light pl-3">
          <Avatar name={user?.name ?? '?'} size="sm" />
          <span className="hidden text-sm text-text-primary sm:inline">{user?.name}</span>
          <button onClick={logout} className="rounded-md p-2 text-text-secondary hover:bg-bg-subtle hover:text-danger" aria-label="Sair" title="Sair">
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
