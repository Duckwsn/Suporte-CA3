# ADR-0003 — Integração WhatsApp

- **Status:** Aceito (v1: recepção via webhook)
- **Data:** 2026-08-06

## Contexto

O atendimento precisa de canal WhatsApp. A API oficial do WhatsApp Business é webhook-based: o provedor envia eventos (mensagens, status) para um endpoint nosso.

## Decisão

- **Recepção:** `POST /api/whatsapp/webhook` com verificação de token via header `X-CA3-Webhook-Token` (ou parâmetro de handshake `hub.verify_token`).
- **Persistência:** cada evento bruto é gravado em `WebhookEvent` antes do processamento (auditoria e reprocessamento).
- **Processamento:** resolve o contato pelo telefone, cria/atualiza a conversa (canal `WHATSAPP`) e registra a mensagem.
- **Envio (fase P1):** chamada à API do provedor com token da conta WhatsApp Business; não implementado nesta versão.

## Consequências

- Positivas: fluxo simples e auditável, consistente com o padrão do Planner.
- Negativas/riscos: eventos fora de ordem exigem idempotência — chave de idempotência (ID da mensagem) no processamento.
- Decisão alternativa avaliada e rejeitada: SDK proprietário do provedor (acoplamento).
