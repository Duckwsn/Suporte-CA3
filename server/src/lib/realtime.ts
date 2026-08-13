import { Server as HttpServer } from 'http'
import { Server as SocketServer, type Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../utils/token'
import prisma from './prisma'

let io: SocketServer | null = null

const AGENT_ROLES = ['AGENT', 'SUPERVISOR', 'ADMIN']

export function initRealtime(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5174',
      credentials: true,
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined
      if (!token) return next(new Error('Token ausente'))
      const payload = verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, email: true, name: true, teamId: true, isActive: true },
      })
      if (!user || !user.isActive) return next(new Error('Usuário inativo ou inexistente'))
      socket.data.user = user
      next()
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) return next(new Error('Sessão expirada'))
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as { id: string; role: string }
    socket.join(`user:${user.id}`)
    socket.join(`role:${user.role}`)
    if (AGENT_ROLES.includes(user.role)) socket.join('agents')

    socket.on('conversation:join', (conversationId: string) => {
      if (typeof conversationId === 'string') socket.join(`conversation:${conversationId}`)
    })

    socket.on('conversation:leave', (conversationId: string) => {
      if (typeof conversationId === 'string') socket.leave(`conversation:${conversationId}`)
    })

    socket.emit('ready', { userId: user.id })
  })

  return io
}

function getIo(): SocketServer {
  if (!io) throw new Error('Realtime não inicializado')
  return io
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  getIo().to(`user:${userId}`).emit(event, payload)
}

export function emitToAgents(event: string, payload: unknown) {
  getIo().to('agents').emit(event, payload)
}

export function emitToConversation(conversationId: string, event: string, payload: unknown) {
  getIo().to(`conversation:${conversationId}`).emit(event, payload)
}

export function emitConversationEvent(event: string, payload: unknown) {
  getIo().to('agents').emit(event, payload)
}