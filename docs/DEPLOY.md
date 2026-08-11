# Deploy — Suporte CA3

> Guia de implantação. Ambiente local usa Docker Compose; produção segue o padrão do Planner CA3 (Render/Node).

---

## 1. Ambientes

| Ambiente | Backend | Frontend | Banco |
| --- | --- | --- | --- |
| Local (dev) | `http://localhost:4000` | `http://localhost:5173` | PostgreSQL via Docker |
| Produção | serviço Node (ex.: Render) | build estático (ex.: Render Static) | PostgreSQL gerenciado |

## 2. Variáveis de ambiente (produção)

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | URL do PostgreSQL de produção |
| `JWT_SECRET` | Segredo JWT (gerar com `openssl rand -hex 64`) |
| `PORT` | Porta do backend |
| `WEBHOOK_TOKEN` | Token do webhook WhatsApp |
| `FRONTEND_URL` | Origem do frontend para CORS |

> Nunca commitar `.env`/segredos. Usar variáveis do provedor.

## 3. Deploy do backend

```bash
cd server
npm ci
npm run build
npm start
```

- `npm start` executa `prisma db push` (aplica schema) antes de subir `dist/index.js`.
- Em produção, prefira migrations versionadas: `npx prisma migrate deploy`.

## 4. Deploy do frontend

```bash
npm ci
npm run build
# servir o conteúdo de dist/ (static hosting)
```

## 5. Docker Compose (local)

`docker-compose.yml` sobe PostgreSQL (e Redis, quando necessário).

```bash
docker compose up -d
```

## 6. Checagem pós-deploy

- [ ] `GET /api/health` responde `200`.
- [ ] Login funciona com usuário seed/real.
- [ ] Webhook do WhatsApp configurado no provedor aponta para `POST /api/whatsapp/webhook`.
- [ ] Jobs (sla-breaches) estão ativos nos logs.
