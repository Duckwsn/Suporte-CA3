import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { isValidWebhookToken } from '../lib/whatsapp'
import { notifyAllAgents } from '../lib/notify'
import { AppError } from '../core/errors'
import { asyncHandler } from '../utils/asyncHandler'

export const verify = asyncHandler(async (req: Request, res: Response) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  if (mode === 'subscribe' && token === process.env.WEBHOOK_TOKEN) {
    res.status(200).send(String(req.query['hub.challenge'] ?? ''))
    return
  }
  res.status(403).end()
})

export const receive = asyncHandler(async (req: Request, res: Response) => {
  const signatureValid = isValidWebhookToken(req.headers['x-ca3-webhook-token'] as string)

  const event = await prisma.webhookEvent.create({
    data: {
      source: 'WHATSAPP',
      payload: req.body ?? {},
      signatureValid,
    },
  })

  if (!signatureValid) {
    throw AppError.forbidden('Assinatura de webhook inválida')
  }

  await processWhatsAppEvent(event.id, req.body ?? {})

  await prisma.webhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } })
  res.status(200).json({ ok: true, id: event.id })
})

async function processWhatsAppEvent(_eventId: string, payload: Record<string, unknown>) {
  const message = extractMessage(payload)
  if (!message) return

  const phone = String(message.from ?? '')
  if (!phone) return

  const contact = await prisma.contact.upsert({
    where: { whatsappId: phone },
    update: {},
    create: { name: `WhatsApp ${phone}`, whatsappId: phone, phone },
  })

  let conversation = await prisma.conversation.findFirst({
    where: { channel: 'WHATSAPP', contactId: contact.id, status: { in: ['AGUARDANDO_ATENDENTE', 'EM_ATENDIMENTO'] } },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        channel: 'WHATSAPP',
        contactId: contact.id,
        status: 'AGUARDANDO_ATENDENTE',
        title: `WhatsApp ${phone}`,
      },
    })
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'CONTACT',
      body: String(message.body ?? ''),
      status: 'ENVIADA',
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  })

  await notifyAllAgents('NOVA_MENSAGEM', 'Nova mensagem WhatsApp', `Nova mensagem de ${contact.name}`)
}

function extractMessage(payload: Record<string, unknown>): { from?: unknown; body?: unknown } | null {
  const entries = (payload.entry as Array<{ changes?: Array<{ value?: { messages?: Array<Record<string, unknown>> } }> }>) ?? []
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? []
      if (messages.length > 0) {
        const first = messages[0]
        const text = first.text as { body?: unknown } | undefined
        return { from: first.from, body: text?.body }
      }
    }
  }
  return null
}
