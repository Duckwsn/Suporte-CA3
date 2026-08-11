CA

Buscar tickets, contatos…

## Documentação do Design System

Guia de referência dos tokens e componentes do Suporte CA3. Cada componente traz props, variantes e um exemplo de uso pronto para copiar.

[Ver showcase](https://7a8d7d94-b69e-4e28-b7e9-042daed7150d.lovableproject.com/)

## SUMÁRIO

[Como usar](#page-0)

[Tokens de cor](#page-0)

[Tipografia](#page-0)

[Espaçamento e raio](#page-0)

[Elevação](#page-0)

[Button](#page-0)

[Badge](#page-0)

[Card](#page-0)

[KpiCard](#page-0)

[ProgressBar](#page-0)

[Formulários](#page-0)

[Estados](#page-0)

[PageHeader](#page-0)

[MainLayout](#page-0)

## Como usar

Todos os componentes vivem em src/shared/components e consomem exclusivamente tokens semânticos. Nunca use classes de cor literais (bg-white, text-black) — use os tokens abaixo.

Copiar

Alias @ aponta para src/.

@/shared/components/<Componente>

## Importação


```
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { MainLayout } from "@/shared/layouts/MainLayout";
```

## Tokens de cor

Escala primária índigo, acento âmbar da marca e cores semânticas de status/SLA.

| TOKEN primary / primary-50… 950 brand success / success-bg warning / warning-bg danger / danger-bg info / info-bg |   | VALOR USO Ações principais, links e destaques de oklch índigo navegação Identidade CA3, CTAs de destaque e âmbar marcações da marca verde SLA dentro do prazo, confirmações âmbar escuro SLA em risco, avisos vermelho SLA estourado, erros e ações destrutivas Mensagens informativas e status neutros azul positivos |
| --- | --- | --- |
| text-primary / text- secondary bg-page / card / border |   | cinza- Texto de conteúdo e texto de apoio azulado superfícies Fundo de página, cartões e divisores |

## Uso de tokens

Sempre via utilitário Tailwind gerado pelo token.

Copiar

## SLA estourado

```
<div className="bg-card text-text-primary border border-border rounded-lg p-4">
<span className="text-danger">SLA estourado /span>
/div>
```

## Tipografia


Poppins para títulos (font-display), Inter para texto (font-sans) e JetBrains Mono para dados técnicos (font-code).

## Espaçamento e raio

Escala de 4px (space-1 a space-24) e raio base de 0.625rem.

| TOKEN | VALOR | USO |
| --- | --- | --- |
| --space-1 … --space-24 | 0.25rem … 6rem | Gaps, paddings e margens |
| --radius-xs | 0.25rem | Chips e marcadores pequenos |
| --radius | 0.625rem | Botões, inputs e cartões |
| --radius-full | 9999px | Badges e avatares |

## Elevação

Cinco níveis de sombra para hierarquia de superfícies.


```
<div className="shadow-xs" />
<div className="shadow-sm" />
<div className="shadow-md" />
<div className="shadow-lg" />
<div className="shadow-xl" />
```

## Button

Ação primária do sistema. Suporta asChild para renderizar links.

## Badge

Rótulo compacto para status, prioridade e categorias.


```
<Badge variant="success">Resolvido /Badge>
<Badge variant="warning">Em risco /Badge>
<Badge variant="danger">Atrasado /Badge>
<Badge variant="info">Aguardando /Badge>
<Badge variant="neutral">Rascunho /Badge>
<Badge variant="brand">VIP /Badge>
<Badge variant="primary">Novo /Badge>
PROP TIPO PADRÃO DESCRIÇÃO
"success" | "warning" | "danger" | "info" Cor semântica
variant "neutral"
| "neutral" | "brand" | "primary" do rótulo
```

## Card

Superfície padrão de conteúdo, com cabeçalho opcional.

## Card com cabeçalho

Copiar

Fila de atendimento

Ver todos

Tickets aguardando triagem

12 tickets na fila.

```
<Card>
<CardHeader
title="Fila de atendimento"
description="Tickets aguardando triagem"
action={<Button variant="ghost" size="sm">Ver todos /Button>}
/>
<p className="text-sm text-text-secondary">12 tickets na fila. /p>
/Card>
```

| PROP TIPO PADRÃO DESCRIÇÃO title ReactNode — Título do CardHeader |
| --- |
| description ReactNode — Texto de apoio do CardHeader action ReactNode — Ação alinhada à direita do cabeçalho |


## KpiCard

Indicador numérico do dashboard, com ícone e tom semântico.

## ProgressBar

Progresso de SLA. Use o tom conforme o risco: success até 70%, warning até 90%, danger acima.


SLA — estourado

98%

<ProgressBar value={42} tone="success" label="SLA — dentro do prazo" />

<ProgressBar value={82} tone="warning" label="SLA — em risco" />

<ProgressBar value={98} tone="danger" label="SLA — estourado" />

| PROP TIPO |   | PADRÃO DESCRIÇÃO |
| --- | --- | --- |
|   |   | Percentual de 0 a 100 (é limitado |
| value | number | — |
|   |   | automaticamente) |
|   | "primary" | "brand" | |   |
| tone | "success" | "warning" | | "primary" Cor da barra |
|   | "danger" |   |
|   |   | Rótulo exibido acima da barra |
| label | string | — |
|   |   | com o percentual |

## Formulários

Input, Textarea, Select e Label compartilham altura, raio e anel de foco.


<Select><option>Alta /option><option>Média /option> /Select>

- <Textarea rows={3} placeholder="Detalhes do atendimento" />

| PROP | TIPO | PADRÃO DESCRIÇÃO |   |
| --- | --- | --- | --- |
| variant | "default" | |   |   |
| (Input) | "error" | "default" | Aplica borda de erro ao campo inválido |
|   | atributos |   | Todos os atributos HTML do elemento |
| ...props | nativos | — |   |
|   |   |   | correspondente são repassados |

## Estados

Carregamento, vazio, erro e skeletons para telas assíncronas.


Criar ticket

## Não foi possível carregar

Falha ao buscar os tickets.

Tentar novamente

```
<EmptyState
title="Nenhum ticket na fila"
description="Novos atendimentos aparecerão aqui."
action={<Button size="sm">Criar ticket /Button>}
/>
<ErrorState
description="Falha ao buscar os tickets."
onRetry={() => refetch()}
/>
```

| PROP TIPO label (LoadingState) string title / description string action (EmptyState) ReactNode onRetry (ErrorState) () => void className (Skeleton) string | PADRÃO DESCRIÇÃO "Carregando…" Texto do carregamento — Conteúdo textual do estado — Ação sugerida ao usuário — Exibe o botão de nova tentativa "h-4 w-full" Dimensões do bloco |
| --- | --- |

## PageHeader

Cabeçalho padrão de todas as páginas internas.

## Cabeçalho com ações


## Tickets

Acompanhe os atendimentos em aberto.

Novo ticket

```
<PageHeader
title="Tickets"
description="Acompanhe os atendimentos em aberto."
actions={<Button variant="brand">Novo ticket /Button>}
/>
```

| PROP | TIPO | PADRÃO DESCRIÇÃO |   |
| --- | --- | --- | --- |
| title | string | — | H1 da página |
| description | string | — | Subtítulo explicativo |
| actions | ReactNode | — | Botões alinhados à direita |

## MainLayout

Estrutura com sidebar escura, header de busca e área de conteúdo.
