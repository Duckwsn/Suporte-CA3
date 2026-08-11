# Design System — Suporte CA3

> Design system **vivo** e obrigatório (Plano.md §7.3). Fonte dos tokens: `src/shared/styles/tokens.css`.
> Consistente com o **Planner CA3** — salvo divergência explícita e justificada.

---

## 1. Identidade

- **Marca:** "Suporte CA3".
- **Escala primária:** azul-índigo (`--scale-primary-*`), mesma família do Planner CA3.
- **Acento (CTA/marca):** âmbar (`--color-brand: #f59e0b`).
- **Fundo de página:** `#f4f6f9` (cinza-azulado claro).
- **Sidebar:** fundo `#0f1f3d` (azul escuro) com item ativo âmbar.

## 2. Tokens principais

| Categoria | Tokens |
| --- | --- |
| Cores primárias | `--scale-primary-50..950` (azul-índigo) |
| Acento | `--color-brand`, `--color-brand-hover`, `--color-brand-bright`, `--color-brand-ink`, `--color-brand-soft` |
| Semânticas | `--color-success`, `--color-warning`, `--color-danger`, `--color-info`, `--color-neutral` (cada uma com `-bg`) |
| Superfícies | `--color-bg-page`, `--color-bg-surface`, `--color-bg-card`, `--color-bg-input`, `--color-card-bg`, `--color-card-border`, `--color-card-shadow` |
| Texto | `--color-text-primary`, `--color-text-secondary`, `--muted`, `--muted-soft` |
| Tipografia | `--font-primary` (Inter), `--font-secondary` (Poppins), `--font-mono` (JetBrains Mono); escala `--text-*` |
| Espaçamento | `--space-1` … `--space-24` |
| Raio | `--radius-xs` … `--radius-full` |
| Sombra | `--shadow-xs` … `--shadow-xl` |
| Z-index | `--z-base` … `--z-tooltip` |
| Breakpoints | `--bp-sm` … `--bp-2xl` |
| Durations | `--duration-fast`, `--duration-normal`, `--duration-slow`, `--easing-default` |

> **Importante:** os tokens **não** devem ser duplicados/renomeados. Quando um token existir no Planner CA3 com o mesmo significado, reutilize o mesmo nome.

## 3. Componentes compartilhados (`src/shared/components`)

| Componente | Uso principal |
| --- | --- |
| `Button` | Ações; variantes `primary`, `secondary`, `ghost`, `danger`; tamanhos `sm`, `md`, `lg` |
| `Input` | Campos de texto; variantes `default`, `error` |
| `Textarea` | Áreas de texto |
| `Select` | Seletores; suporte a options |
| `Switch` | Toggles |
| `Card` | Contêineres de superfície |
| `Badge` | Status/prioridade; variantes semânticas |
| `Avatar` | Identidade de usuário/contato |
| `KpiCard` | Cartões de indicador no dashboard |
| `ProgressBar` | Progresso (ex.: SLA, conclusão) |
| `Modal` / `Drawer` | Diálogos e painéis laterais |
| `Toast` | Feedback transitório |
| `Tooltip` | Dicas contextuais |
| `Skeleton` | Loading estrutural |
| `LoadingState` / `EmptyState` / `ErrorState` | Estados de tela |
| `PageHeader` | Cabeçalho de página |
| `Header` | Topbar (inclui notificações) |
| `Sidebar` | Navegação principal |

**Regras:**
- Um novo componente visual **só** é criado quando não há equivalente reutilizável.
- Todo componente novo deve ser documentado aqui (props, variantes, estados, exemplos).
- Reaproveite os componentes do Planner CA3 sempre que a especificação for idêntica.

## 4. Layout

- `MainLayout` em `src/shared/layouts` compõe `Sidebar` + `Header` + conteúdo.
- Conteúdo sobre fundo `--color-bg-page`; cards sobre `--color-bg-surface` com `--color-card-shadow`.

## 5. Acessibilidade

- Focus ring: `--color-focus-ring` (`#2563eb`).
- Contraste AA nas combinações principais (texto primário sobre superfície; texto secundário `--color-text-secondary`).
- Labels associados a inputs via `htmlFor`/`id`; aria-labels em ícones-only.

## 6. Estado de SLA (semântica de cores)

| Situação | Cor |
| --- | --- |
| Dentro do prazo | `--color-success` |
| Próximo do vencimento | `--color-warning` |
| Violado | `--color-danger` |
| Neutro | `--color-neutral` |

## 7. Governança

- Mudanças de tokens → ADR + atualização deste documento.
- Mudanças de componente → atualização deste documento + exemplo de uso.
- Divergência do Planner CA3 exige justificativa documentada (Plano.md §1).
