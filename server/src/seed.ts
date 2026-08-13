import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const org = await prisma.organization.upsert({
    where: { slug: 'ca3-tecnologia' },
    update: {},
    create: {
      name: 'CA3 Tecnologia',
      slug: 'ca3-tecnologia',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ca3.com.br' },
    update: {},
    create: {
      name: 'Administrador CA3',
      email: 'admin@ca3.com.br',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  const existingTeam = await prisma.team.findFirst({
    where: { name: 'Suporte N1', organizationId: org.id },
  })
  const suporte = existingTeam ?? await prisma.team.create({
    data: {
      name: 'Suporte N1',
      description: 'Equipe de primeiro nível de atendimento técnico',
      organizationId: org.id,
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
      organizationId: org.id,
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
      organizationId: org.id,
    },
  })

  await prisma.slaPolicy.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'SLA Padrão',
      category: 'HARDWARE',
      organizationId: org.id,
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
      organizationId: org.id,
    },
  })

  const existingConv = await prisma.conversation.findFirst({ where: { contactId: contact.id } })
  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        channel: 'WEB',
        status: 'AGUARDANDO_ATENDENTE',
        contactId: contact.id,
        organizationId: org.id,
        title: 'Preciso de ajuda com meu equipamento',
      },
    })
  }

  console.log('Seed concluído.')
  console.log(`Organização: ${org.name} (${org.slug})`)
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
