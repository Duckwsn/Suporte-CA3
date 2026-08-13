import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { LoginPage } from '@/modules/login/LoginPage'
import { RegisterPage } from '@/modules/register/RegisterPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { TicketsPage } from '@/modules/tickets/TicketsPage'
import { NewTicketPage } from '@/modules/tickets/NewTicketPage'
import { TicketDetailPage } from '@/modules/tickets/TicketDetailPage'
import { ConversationsPage } from '@/modules/conversations/ConversationsPage'
import { ContactsPage } from '@/modules/contacts/ContactsPage'
import { TeamsPage } from '@/modules/teams/TeamsPage'
import { ReportsPage } from '@/modules/reports/ReportsPage'
import { CsatPage } from '@/modules/csat/CsatPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import OrganizationsPage from '@/modules/organizations/OrganizationsPage'
import { NotFoundPage } from '@/modules/not-found/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/atendimento" element={<ConversationsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/novo" element={<NewTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/contatos" element={<ContactsPage />} />
        <Route path="/equipes" element={<TeamsPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/csat" element={<CsatPage />} />
        <Route path="/organizacoes" element={<OrganizationsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
