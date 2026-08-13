import { test, expect } from '@playwright/test'
import {
  loginViaApi,
  createContact,
  createConversation,
  sendMessage,
  createTicket,
  randomEmail,
} from './helpers'

const ADMIN = { email: 'admin@ca3.com.br', password: 'Admin@123' }
const AGENT = { email: 'agente@ca3.com.br', password: 'Admin@123' }
const CUSTOMER = { email: 'cliente@ca3.com.br', password: 'Admin@123' }

test.describe('Fluxo cliente → atendente → ticket', () => {
  test('cliente abre conversa, atendente assume e converte em ticket', async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000)

    const customerToken = (await loginViaApi(request, CUSTOMER.email, CUSTOMER.password)).token
    const agentToken = (await loginViaApi(request, AGENT.email, AGENT.password)).token

    const contact = await createContact(request, customerToken, {
      name: `Cliente E2E ${Date.now()}`,
      email: randomEmail(),
    })

    const conversation = await createConversation(request, customerToken, {
      contactId: contact.id,
      title: 'E2E: preciso de suporte com o sistema',
    })

    await sendMessage(request, customerToken, conversation.id, {
      senderType: 'CONTACT',
      body: 'E2E: minha tela de login está com erro. Podem ajudar?',
    })

    // --- Atendente entra no painel ---
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(AGENT.email)
    await page.getByLabel('Senha').fill(AGENT.password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard')

    // Abre a aba "Atendimento"
    await page.goto('/atendimento')
    await expect(page.getByRole('heading', { name: 'Atendimento' })).toBeVisible()

    // A conversa do cliente deve aparecer na fila (pode aparecer em mais de uma aba)
    const conversationRow = page
      .getByRole('button', { name: /E2E: preciso de suporte com o sistema/ })
      .first()
    await expect(conversationRow).toBeVisible({ timeout: 20_000 })
    await conversationRow.click()

    // A mensagem enviada pelo cliente deve estar visível
    await expect(page.getByText('E2E: minha tela de login está com erro. Podem ajudar?')).toBeVisible()

    // Atendente assume (API: assign → EM_ATENDIMENTO)
    const agentSession = await loginViaApi(request, AGENT.email, AGENT.password)
    const assignRes = await request.patch(
      `${process.env.E2E_API_URL ?? 'http://localhost:4000/api'}/conversations/${conversation.id}/assign`,
      {
        headers: { Authorization: `Bearer ${agentSession.token}` },
        data: { assigneeId: agentSession.user.id },
      },
    )
    expect(assignRes.ok()).toBeTruthy()

    // Atendente envia resposta pela UI
    await page.getByPlaceholder('Digite sua mensagem...').fill('E2E: atendente aqui, vou verificar o problema.')
    await page.getByRole('button', { name: 'Enviar' }).click()
    await expect(
      page.getByText('E2E: atendente aqui, vou verificar o problema.'),
    ).toBeVisible({ timeout: 15_000 })

    // --- Converte em ticket ---
    const ticket = await createTicket(request, agentToken, {
      subject: 'E2E: erro no login',
      description: 'E2E: cliente relatou erro na tela de login.',
      priority: 'ALTA',
      category: 'Software',
      conversationId: conversation.id,
      contactId: contact.id,
    })
    expect(ticket.number).toBeGreaterThan(0)

    // Valida o ticket na página de tickets (link contém apenas o assunto; usar a linha do número)
    await page.goto('/tickets')
    const ticketRow = page.locator('tr').filter({ hasText: `#${ticket.number}` })
    const ticketLink = ticketRow.getByRole('link', { name: 'E2E: erro no login' })
    await expect(ticketLink).toBeVisible({ timeout: 15_000 })

    // Abre o detalhe e confere status/prioridade
    await ticketLink.click()
    await expect(page.getByRole('heading', { name: new RegExp(`#${ticket.number} · E2E: erro no login`) })).toBeVisible()
    await expect(page.getByText('Alta')).toBeVisible()
    await expect(page.getByText('Aberto', { exact: true })).toBeVisible()
    await expect(page.getByText('Cliente E2E', { exact: false })).toBeVisible()
  })

  test('ticket criado manualmente aparece no dashboard do admin', async ({ page, request }) => {
    test.setTimeout(90_000)

    const adminToken = (await loginViaApi(request, ADMIN.email, ADMIN.password)).token
    const ticket = await createTicket(request, adminToken, {
      subject: 'E2E: chamado manual do admin',
      description: 'E2E: criado diretamente pelo admin para validar o dashboard.',
      priority: 'MEDIA',
      category: 'Rede',
    })

    await page.goto('/login')
    await page.getByLabel('E-mail').fill(ADMIN.email)
    await page.getByLabel('Senha').fill(ADMIN.password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    const link = page.getByRole('link', { name: new RegExp(`#${ticket.number} · E2E: chamado manual do admin`) })
    await expect(link).toBeVisible({ timeout: 15_000 })
  })
})
