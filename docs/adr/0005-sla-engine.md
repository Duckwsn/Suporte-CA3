# ADR-0005 — Motor de SLA

- **Status:** Aceito
- **Data:** 2026-08-06

## Contexto

Garantir prazos de primeira resposta e resolução exige cálculo de datas-alvo e detecção de violações.

## Decisão

- **Políticas (`SlaPolicy`)** por categoria (ou global), com `responseTimeMinutes`, `resolutionTimeMinutes` e `businessHoursOnly`.
- **Cálculo:** ao criar/atualizar um ticket, o serviço de SLA calcula `firstResponseDueAt` e `resolutionDueAt` (respeitando horário comercial quando configurado).
- **Detecção:** job `sla-breaches` (node-cron, a cada 5 min) varre tickets abertos e registra `SlaBreach` quando o prazo expira.
- **Semântica visual:** dentre do prazo (success), próximo (warning), violado (danger).

## Consequências

- Positivas: regra centralizada, auditável, testes unitários fáceis (função pura de cálculo).
- Negativas/riscos: detecção em batch tem latência ≤ intervalo do cron; horário comercial simplificado (feriados ignorados na v1 — evolução registrada).
