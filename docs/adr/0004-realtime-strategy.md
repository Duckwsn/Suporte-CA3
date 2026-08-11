# ADR-0004 — Estratégia de tempo real

- **Status:** Aceito (v1: polling)
- **Data:** 2026-08-06

## Contexto

Conversas de atendimento precisam de atualização quase em tempo real. O Planner CA3 usa polling (`useNotificationPoll`), sem WebSocket. Adicionar Socket.IO aumenta a complexidade da infraestrutura.

## Decisão

- **v1:** **polling** no frontend (`usePolling`) para conversas e notificações, com intervalo configurável (padrão 3–5 s).
- **Evolução:** WebSocket (Socket.IO) quando o volume/UX exigir entrega imediata — com heartbeat e reconnection.
- O backend expõe endpoints idempotentes e baratos para polling (`GET .../messages?since=<timestamp>`).

## Consequências

- Positivas: simplicidade, consistência com o Planner CA3, sem infraestrutura adicional.
- Negativas/riscos: latência de até um intervalo de polling; carga proporcional ao nº de clientes — mitigada por consultas leves e índice em `lastMessageAt`.
