import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ca3.com.br' },
    update: {},
    create: {
      name: 'Administrador CA3',
      email: 'admin@ca3.com.br',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const suporte = await prisma.team.upsert({
    where: { name: 'Suporte N1' },
    update: {},
    create: {
      name: 'Suporte N1',
      description: 'Equipe de primeiro nível de atendimento técnico',
      supervisorId: admin.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'agente@ca3.com.br' },
    update: {},
    create: {
      name: 'Agente CA3',
      email: 'agente@ca3.com.br',
      passwordHash,
      role: 'AGENT',
      teamId: suporte.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'cliente@ca3.com.br' },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      email: 'cliente@ca3.com.br',
      passwordHash,
      role: 'CUSTOMER',
    },
  })

  await prisma.slaPolicy.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'SLA Padrão',
      category: 'HARDWARE',
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 480,
      businessHoursOnly: true,
    },
  })

  const contact = await prisma.contact.upsert({
    where: { whatsappId: '55-11-999999999' },
    update: {},
    create: {
      name: 'Contato Demo',
      phone: '+55 11 99999-9999',
      whatsappId: '55-11-999999999',
      email: 'contato@demo.com.br',
    },
  })

  const existingConv = await prisma.conversation.findFirst({ where: { contactId: contact.id } })
  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        channel: 'WEB',
        status: 'AGUARDANDO_ATENDENTE',
        contactId: contact.id,
        title: 'Preciso de ajuda com meu equipamento',
      },
    })
  }

  console.log('Seed concluído.')
  console.log('Usuários: admin@ca3.com.br / agente@ca3.com.br / cliente@ca3.com.br (senha: Admin@123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
