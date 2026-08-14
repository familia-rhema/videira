# Design System — Sporos

**Identidade visual e tokens, sobre o AlignUI 2.0**

| | |
|---|---|
| **Produto** | Sporos |
| **Base** | [AlignUI Next.js + TypeScript Starter](https://github.com/alignui/alignui-nextjs-typescript-starter) |
| **Engine** | Tailwind CSS + CSS Variables + `tailwind-variants` (tv) |
| **Fonte** | Inter (sans) + Geist Mono (mono) |
| **Ícones** | Remix Icon (`@remixicon/react`) |
| **Modos** | Light + Dark (via `next-themes`, classe `.dark`) |
| **Data** | 2026-06-28 |

> Este documento define a **identidade do Sporos sobre os tokens do AlignUI**. Não reinventamos componentes: usamos os do AlignUI e apenas (1) remapeamos a cor primária, (2) damos significado de produto às famílias semânticas, (3) definimos quais componentes usar em cada tela. Todos os valores abaixo são extraídos do código real do starter (`tailwind.config.ts` + `app/globals.css`).

---

## 1. Princípios

1. **Token semântico > token bruto.** Sempre use `bg-bg-white-0`, `text-text-strong-950`, `border-stroke-soft-200` — nunca `bg-white` ou `text-neutral-950` direto. Assim o dark mode funciona sozinho.
2. **A saúde da semente é o sistema de cor mais importante.** Ela reaproveita as famílias semânticas nativas do AlignUI (success/away/warning/error) — nunca a cor primária.
3. **Cor primária = ação e marca, não estado.** Botões primários, links, foco. Nunca para comunicar saúde/sucesso/erro.
4. **Mobile-first no cadastro.** O formulário de entrada da semente é usado na rua; ele é a única tela projetada primeiro para telas pequenas.
5. **100% em português** nas labels de UI.

---

## 2. Cor

### 2.1 Escalas brutas (do AlignUI)

O AlignUI fornece escalas completas (50–950 + alphas) para: `gray`, `slate`, `neutral`, `blue`, `orange`, `red`, `green`, `yellow`, `purple`, `sky`, `pink`, `teal`. `neutral` é um alias de `gray` (a base neutra do tema).

Valores-âncora (base 500):

| Família | Base (500) | Uso no Sporos |
|---|---|---|
| `blue` | `#335cff` | — (primária padrão do AlignUI) |
| `teal` | `#22d3bb` | **Cor primária do Sporos** (ver 2.2) |
| `green` | `#1fc16b` | Saúde: **Saudável** / conquista feita |
| `yellow` | `#f6b51e` | Saúde: **Atenção** |
| `orange` | `#fa7319` | Saúde: **Em risco** |
| `red` | `#fb3748` | Saúde: **Crítico** / destrutivo |
| `purple` | `#7d52f4` | Acento de "feature" / Batismo (opcional) |
| `sky` | `#47c2ff` | Acento "verified" / Visão Rhema (opcional) |

### 2.2 Cor primária do Sporos — Teal

**Decisão:** a primária do Sporos é **teal** (`#22d3bb`), não o azul padrão do AlignUI.

**Por quê:** (a) remete a "broto/semente/vida" sem ser verde — e o **verde está reservado para "saúde/sucesso"**, então usar verde como marca causaria colisão; (b) o teal dá personalidade orgânica mantendo aparência de ferramenta limpa.

**Como aplicar** — sobrescreva apenas 6 variáveis em `app/globals.css` (o resto do AlignUI já consome `--primary-*`):

```css
/* :root  (light) */
--primary-base:    var(--teal-500);   /* #22d3bb */
--primary-darker:  var(--teal-700);   /* #178c7d */
--primary-dark:    var(--teal-800);   /* #1a7569 */
--primary-alpha-24: var(--teal-alpha-24);
--primary-alpha-16: var(--teal-alpha-16);
--primary-alpha-10: var(--teal-alpha-10);

/* .dark — opcional: AlignUI mantém o mesmo base no dark por padrão */
```

> **Alternativa zero-esforço:** se preferir não mexer, mantenha o **azul padrão** (`--primary-base: var(--blue-500)`). Ele também não colide com as cores de saúde. Trocar depois é só editar essas 6 linhas.

### 2.3 Tokens semânticos de superfície (já resolvem light/dark)

Sempre use estes — eles invertem sozinhos no dark mode:

| Categoria | Tokens | Uso |
|---|---|---|
| **Background** | `bg-strong-950`, `bg-surface-800`, `bg-sub-300`, `bg-soft-200`, `bg-weak-50`, `bg-white-0` | `bg-white-0` = card/superfície base; `bg-weak-50` = fundo de página/zebra |
| **Text** | `text-strong-950`, `text-sub-600`, `text-soft-400`, `text-disabled-300`, `text-white-0` | `strong` = título; `sub` = corpo secundário; `soft` = legenda |
| **Stroke** | `stroke-strong-950`, `stroke-sub-300`, `stroke-soft-200`, `stroke-white-0` | `soft-200` = borda padrão de card/input |

### 2.4 Cores de estado (semantic state colors)

Cada família semântica tem 4 tons: `dark`, `base`, `light`, `lighter`. Padrão de uso: texto/ícone = `dark` ou `base`; fundo de badge = `lighter`; borda = `light`.

| Semantic | Família | Significado nativo |
|---|---|---|
| `success` | green | Sucesso |
| `warning` | orange | Aviso |
| `error` | red | Erro |
| `away` | yellow | Ausência/ocioso |
| `information` | blue | Informação |
| `feature` | purple | Destaque/feature |
| `verified` | sky | Verificado |
| `highlighted` | pink | Realce |
| `stable` | teal | Estável |
| `faded` | neutral | Neutro/desabilitado |

---

## 3. Mapeamento semântico do Sporos ⭐

A tradução do domínio do produto para os tokens. **Esta é a parte específica do Sporos.**

### 3.1 Saúde da semente

A saúde (definida no PRD: tempo desde o último avanço) usa as famílias de estado. Reforçada **sempre com ícone + label**, nunca só cor (acessibilidade/daltonismo).

| Estado de saúde | Token semântico | Cor | Ícone Remix sugerido |
|---|---|---|---|
| 🟢 Saudável (`≤ carência`) | `success` | green `#1fc16b` | `ri-checkbox-circle-fill` |
| 🟡 Atenção (`> carência`) | `away` | yellow `#f6b51e` | `ri-time-fill` |
| 🟠 Em risco | `warning` | orange `#fa7319` | `ri-error-warning-fill` |
| 🔴 Crítico | `error` | red `#fb3748` | `ri-alarm-warning-fill` |
| ✅ Integrado (final) | `stable` (teal) ou `verified` | teal `#22d3bb` | `ri-seedling-fill` |

> Componente: **`StatusBadge`** (do AlignUI) com a cor mapeada. Para o ranking da lista, use também a barra/dot de cor à esquerda da linha.

### 3.2 Conquistas (3 marcos independentes)

Cada conquista tem uma cor de acento estável para virar reconhecível na UI (badges, ícones na timeline):

| Conquista | Acento | Token | Ícone Remix |
|---|---|---|---|
| Visão Rhema | sky | `verified` | `ri-book-open-fill` |
| Batismo | purple | `feature` | `ri-drop-fill` |
| Célula (GC) | teal/primary | `primary` | `ri-group-fill` |

Estado de cada conquista numa semente:
- **Feita** → badge preenchido com o acento + ícone.
- **Pendente** → badge `faded`/outline cinza.

### 3.3 Timeline (linha do tempo)

Reaproveita o **`VerticalStepper`** do AlignUI (já existe em `components/ui/vertical-stepper.tsx`). Cada evento = um passo, com cor do dot conforme o tipo:

| Evento | Cor do nó |
|---|---|
| Cadastro | `faded` (neutro) |
| Conquista (Rhema/Batismo/Célula) | acento da conquista (3.2) |
| Troca de célula / regador | `information` (blue) |
| Contato registrado | `faded` (neutro, discreto) |
| Tarefa concluída | `success` |
| Integrada 🎉 | `stable` (teal, destaque) |

---

## 4. Tipografia

O AlignUI define escalas nomeadas (use as classes `text-*`, não tamanhos arbitrários). Fonte: **Inter**.

### 4.1 Títulos (`title-*`) — peso 500

| Classe | Tamanho / line-height | Uso |
|---|---|---|
| `text-title-h1` | 56 / 64 | Hero (raro) |
| `text-title-h4` | 32 / 40 | Título de página |
| `text-title-h5` | 24 / 32 | Título de seção / nome da semente no perfil |
| `text-title-h6` | 20 / 28 | Título de card |

### 4.2 Labels (`label-*`) — peso 500 / Parágrafos (`paragraph-*`) — peso 400

| Classe | Tamanho | Uso |
|---|---|---|
| `text-label-md` | 16 | Botões, labels de form |
| `text-label-sm` | 14 | Labels compactas, células de tabela (cabeçalho) |
| `text-label-xs` | 12 | Badges, tags |
| `text-paragraph-md` | 16 | Corpo padrão |
| `text-paragraph-sm` | 14 | Corpo secundário, descrições |
| `text-paragraph-xs` | 12 | Legendas, timestamps |

### 4.3 Subheadings (`subheading-*`) — uppercase tracking

`text-subheading-xs` (12, tracking 0.04em) — usar para **rótulos de seção em caixa alta** (ex.: "SITUAÇÃO ECLESIÁSTICA" da referência), em `text-soft-400`.

### 4.4 Mono

`font-mono` (Geist Mono) — apenas para IDs, números de telefone alinhados, dados técnicos.

---

## 5. Espaçamento, raio e sombra

### 5.1 Border radius

AlignUI adiciona dois raios nomeados além da escala Tailwind padrão:

| Classe | Valor | Uso |
|---|---|---|
| `rounded-10` | 10px | Botões, inputs, badges |
| `rounded-20` | 20px | Cards, modais, containers grandes |
| `rounded-full` | — | Avatares, dots de saúde, pills |

### 5.2 Sombras (nomeadas)

Use só as nomeadas do AlignUI — não invente:

| Classe | Uso |
|---|---|
| `shadow-regular-xs` | Elevação mínima (inputs) |
| `shadow-regular-sm` | Cards em repouso |
| `shadow-regular-md` | Dropdowns, popovers |
| `shadow-custom-sm` / `-md` | Cards com profundidade (perfil, modais) |
| `shadow-tooltip` | Tooltips |
| `shadow-button-primary-focus` | Anel de foco do botão primário |

### 5.3 Espaçamento

Escala Tailwind padrão (múltiplos de 4px). Convenções:
- Padding de card: `p-4` (16px) mobile, `p-5`/`p-6` desktop.
- Gap entre campos de form: `gap-3` (12px).
- Densidade da lista de sementes: **média** — linhas com `py-3`, `px-4`.

---

## 6. Componentes AlignUI por tela do Sporos

Inventário real do starter (`components/ui/`) mapeado às telas do PRD:

### 6.1 F1 — Formulário de cadastro (mobile-first)
- `Input`, `Label`, `Hint` (mensagens de erro/ajuda)
- `Select` / `Dropdown` (abordador)
- `Button` (primário "Cadastrar"), `FancyButton` (CTA destacado)

### 6.2 F2 — Lista de sementes
- `Table` — estrutura da lista
- `StatusBadge` — indicador de saúde (cor de 3.1)
- `Badge` / `Tag` — conquistas obtidas
- `Avatar` — foto/inicial da semente e do regador
- `SegmentedControl` / `TabMenuHorizontal` — alternar visões/filtros
- `Select`, `Datepicker` — filtros (conquista, regador, período)
- `Pagination`
- `CompactButton` — ação rápida WhatsApp na linha

### 6.3 F3 — Perfil + Timeline
- `VerticalStepper` — a linha do tempo (núcleo da tela; ver 3.3)
- `Avatar`, `StatusBadge`, `Badge`
- `Divider`
- `Modal` / `Drawer` — registrar conquista, trocar célula/regador
- `TabMenuVertical` ou `TabMenuHorizontal` — abas do perfil (Visão geral / Timeline / Tarefas)

### 6.4 F5 — Células
- `Table`, `Modal` (criar/editar célula), `Dropdown`

### 6.5 F6 — Builder de fluxo (visual)
- Canvas: **React Flow** (`@xyflow/react`) — não faz parte do AlignUI; instalar à parte
- Nós estilizados com tokens AlignUI (`bg-bg-white-0`, `shadow-custom-sm`, `rounded-20`, `border-stroke-soft-200`)
- `Dropdown`, `Select`, `Input` dentro dos nós (config de gatilho/ação)

### 6.6 F7 — Tarefas
- `Table` ou lista de `Card`s, `Checkbox`, `StatusBadge`, `Datepicker`

### 6.7 F8 — Dashboard de métricas
- `ProgressCircle` — % de integração / distribuição de saúde
- `ProgressBar` — avanço por etapa
- Cards de KPI (compostos com tokens), `Badge`, `Datepicker` (filtro de período)

### 6.8 Globais / layout
- `Header` (já no starter), `ThemeSwitch` (light/dark)
- `Notification` / `NotificationProvider` (toasts via `sonner`)
- `Tooltip`, `Modal`, `Drawer`, `CommandMenu` (busca global ⌘K)

---

## 7. Convenções de código

- **Utilitário de classes:** sempre `cn()` de `utils/cn.ts` (clsx + tailwind-merge configurado com os grupos custom do AlignUI). Nunca concatenar strings de classe manualmente.
- **Variantes de componente:** `tailwind-variants` (`tv`) — seguir o padrão dos componentes existentes em `components/ui/`.
- **Polimorfismo:** usar `utils/polymorphic.ts` quando um componente precisar de `asChild`.
- **Ícones:** `@remixicon/react` (a classe `.remixicon` já tem ajuste de escala em `globals.css`).
- **Tema:** `next-themes` com classe `.dark`; o toggle é o `ThemeSwitch`.

---

## 8. Acessibilidade

- **Saúde nunca só por cor** — sempre cor + ícone + label textual (ex.: "Crítico · 62 dias").
- Contraste: usar os pares de token (`text-strong-950` sobre `bg-white-0`) que já passam AA.
- Foco visível: usar os tokens `shadow-button-*-focus` do AlignUI; não remover outline sem substituto.
- Alvos de toque ≥ 44px no formulário mobile (campos e botões em `size` md/lg).

---

## 9. Decisões em aberto

1. **Primária teal vs. azul** — recomendado teal (§2.2); confirmar com o stakeholder. Troca = 6 linhas de CSS.
2. **Acentos de conquista** (sky/purple/teal) — provisórios; ajustar quando houver identidade visual da igreja.
3. **Ilustrações / empty states** — definir se haverá tema orgânico (sementes/plantas) ou interface limpa só com ícones.
4. **Logo e wordmark do Sporos** — pendente.

---

*Documento vivo. Base de tokens extraída do AlignUI 2.0 starter. Atualizar ao conectar o Figma MCP para refinar telas específicas (timeline, builder).*
