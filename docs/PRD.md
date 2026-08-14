# PRD — Sporos

**Sistema de Consolidação de Sementes**

| | |
|---|---|
| **Produto** | Sporos |
| **Versão do documento** | 1.0 (MVP) |
| **Data** | 2026-06-28 |
| **Responsável de produto** | Marcus Dutra |
| **Stakeholder principal** | Pastor Rafa (admin) |
| **Stack** | Next.js + AlignUI (frontend) · PostgreSQL (banco) |

---

## 1. Visão geral

O **Sporos** é um sistema de **consolidação** de novos convertidos ("sementes") de uma igreja. O objetivo é que cada semente cadastrada seja acompanhada por um consolidador ("regador") até estar **integrada** — ou seja, até concluir as três conquistas independentes de discipulado inicial.

> **Sporos** (σπόρος) = "semente", em grego. A metáfora central do produto: cada pessoa é uma semente que precisa ser **regada** até dar fruto (integração).

### 1.1 Problema

Hoje a consolidação é manual e descentralizada (WhatsApp, memória, planilhas). Pessoas que confessam a fé no apelo se perdem porque ninguém tem visibilidade de **quem está parado e há quanto tempo**. Não há histórico, não há divisão clara de responsabilidade, e a liderança não enxerga métricas de avanço.

### 1.2 Solução (MVP)

Um dashboard que:
1. Cadastra sementes via formulário simples (usável na rua e na igreja).
2. Mostra a **lista de pessoas ordenada por saúde** (quem precisa de atenção primeiro).
3. Registra as **3 conquistas independentes** de cada semente, com data.
4. Mantém uma **linha do tempo** (audit log) de tudo que acontece com cada semente.
5. Permite que o admin configure **fluxos de follow-up** (gatilho → ação) num **builder visual**, que geram tarefas para os consolidadores.
6. Dá à liderança métricas de avanço por período.

### 1.3 Não-objetivos (fora do escopo do MVP)

- ❌ Gerenciamento de células além de criar e nomear (módulo completo de células é futuro).
- ❌ Gerenciamento de membros / cadastro eclesiástico completo.
- ❌ O conteúdo/operação do curso **Visão Rhema** (turmas, presença, inscrições) — será definido com o Pastor Rafa numa fase futura; por ora a conclusão é apenas um marco com data.
- ❌ Disparo automático de mensagens (WhatsApp API) — o MVP gera **tarefas/lembretes**; o disparo é V2.
- ❌ Crianças (< 12 anos).
- ❌ Acompanhamento de família como unidade.
- ❌ Registro de ex-membros / histórico anterior.
- ❌ Múltiplas filiais — MVP é **somente a sede**.

---

## 2. Conceito central: Sementes, Conquistas e Saúde

### 2.1 As 3 conquistas (independentes e sem ordem)

A consolidação **não é um funil linear**. São três conquistas independentes que podem ser obtidas em **qualquer ordem**:

| Conquista | Campo | Descrição |
|---|---|---|
| **Visão Rhema** | `rhema_concluido_em` | Concluiu o curso Visão Rhema. |
| **Batismo** | `batizado_em` | Batizado pela igreja (evento a cada 3 meses) **ou** marcado como já batizado em outra igreja (opcional, só se a pessoa quiser rebatizar). |
| **Célula** | `entrou_celula_em` | Entrou em uma célula (GC). |

➡️ Uma semente está **INTEGRADA** quando as **3 conquistas** estão preenchidas.

> Regra de imutabilidade: conquistas **não podem ser desfeitas**. A única alteração permitida é **trocar de célula** (a pessoa continua em célula, só muda qual) — e essa troca é registrada na linha do tempo.

### 2.2 Saúde da semente

A **saúde** é a métrica que governa toda a operação. Ela indica **quanto tempo a pessoa está sem avançar** — quanto mais parada, pior a saúde, e quem está pior aparece primeiro para o consolidador.

**Regras de cálculo:**

- A saúde é **por pessoa** (não por trilha).
- O relógio da saúde mede o tempo desde o **último avanço**, onde **avanço = preencher uma das 3 conquistas**.
- ⚠️ **Registrar um contato (ligar/WhatsApp) NÃO segura a saúde.** Só preencher um dos 3 marcos reseta o relógio.
- Enquanto a semente **não está integrada**, o relógio corre. Quando **integrada**, a saúde deixa de degradar (estado final).
- O ponto de partida do relógio é a **data de cadastro** (até a primeira conquista).

**Parâmetros configuráveis pelo admin (Pastor Rafa):**

```
carencia_dias        = 30   # dias 100% saudável antes de começar a degradar
limiar_amarelo_dias  = 45   # a partir daqui: atenção
limiar_vermelho_dias = 60   # a partir daqui: crítico
```

**Estados de saúde (derivados):**

| Estado | Condição (dias desde último avanço) | Cor |
|---|---|---|
| Saudável | `≤ carencia_dias` | 🟢 Verde |
| Atenção | `> carencia_dias` e `≤ limiar_amarelo_dias` | 🟡 Amarelo |
| Em risco | `> limiar_amarelo_dias` e `≤ limiar_vermelho_dias` | 🟠 Laranja |
| Crítico | `> limiar_vermelho_dias` | 🔴 Vermelho |
| Integrado | 3 conquistas preenchidas | ✅ (estado final, fora do ranking) |

> A saúde é **calculada (derivada)**, não armazenada — para nunca ficar desatualizada. Pode ser exposta como uma `VIEW` no PostgreSQL ou calculada na query de listagem (ver §6.4).

---

## 3. Papéis e permissões

| Papel | Quem | Permissões |
|---|---|---|
| **Admin** | Pastor Rafa | Tudo dos consolidadores + configurar parâmetros de saúde, criar/editar fluxos de follow-up, criar/nomear células, ver todas as sementes e todas as métricas. |
| **Consolidador (Regador)** | Time de evangelistas / Flame Keepers | Cadastrar sementes, ver e atualizar suas sementes (e as da equipe — ver §3.1), registrar conquistas, registrar contatos, concluir tarefas. |

### 3.1 Abordador vs. Regador

- **Abordador**: quem cadastrou a semente. No formulário, vem pré-preenchido com o usuário logado, mas é **trocável** (a pessoa que aborda na rua nem sempre é quem tem a conta).
- **Regador**: o consolidador **dono atual** da semente (responsável por consolidar).
- Por padrão, **abordador = regador**, mas podem ser pessoas diferentes.
- A carga é **dividida entre a equipe** ("os toques são divididos"). Cada semente tem um regador dono; trocas de regador são registradas na linha do tempo.

> **MVP:** todos os consolidadores **veem todas** as sementes (operação em equipe na sede), mas cada uma tem um regador responsável visível. Permissões granulares de "só vejo as minhas" ficam para depois.

---

## 4. Funcionalidades (MVP)

### F1 — Formulário de cadastro de semente

Formulário **deliberadamente simples**, usável na rua (mobile) e na igreja.

**Campos do MVP:**
- Nome *(obrigatório)*
- Telefone / WhatsApp *(obrigatório — é o canal de consolidação)*
- Bairro
- Abordador *(pré-setado = usuário logado, trocável)*

**Campos futuros (planejados, não no MVP):** de onde veio, se já é batizada, idade/faixa, gênero, observações.

**Regras:**
- A pessoa **vira semente no momento do cadastro**.
- Idade mínima do público: **12 anos** (adolescentes e adultos). Sem crianças.

### F2 — Lista de sementes (tela principal do consolidador)

A tela onde o dia começa. *"Abrir a lista, ver a saúde, chamar no WhatsApp."*

- **Ordenada por saúde** (pior primeiro) por padrão.
- Cada linha mostra: nome, indicador de saúde (cor + dias parada), conquistas obtidas (3 ícones/badges), regador, telefone com **ação rápida de WhatsApp**.
- **Filtros:** por conquista (Visão Rhema / Batismo / Célula — feita ou pendente), por estado de saúde, por regador, por célula.
- **Filtro de período** aplicável às métricas/entradas: dia, semana, mês, trimestre e **customizado**.
- Ação rápida: abrir WhatsApp (`https://wa.me/<telefone>`).

### F3 — Perfil da semente + Linha do tempo (audit log)

Inspirado na referência de UI fornecida (timeline tipo "Situação Eclesiástica / GC").

- Dados da pessoa + estado de saúde atual.
- **Linha do tempo imutável** com TODOS os eventos, em ordem cronológica:
  - Cadastro da semente
  - Conquista de Visão Rhema / Batismo / Célula (com data)
  - Entrada em célula / **troca de célula** (de qual para qual)
  - Troca de regador
  - Contato registrado (ligação / WhatsApp)
  - Tarefa criada / concluída
- Ações no perfil: registrar conquista, registrar contato, trocar regador, trocar célula.

### F4 — Registro de conquistas

- Botão por conquista: marca como concluída **com data** (default = hoje, editável).
- Conquistas **não podem ser desfeitas** (apenas registradas).
- Batismo: opção "já batizado em outra igreja" (não obrigatório rebatizar; só se a pessoa quiser).
- Ao registrar a 3ª conquista, a semente passa a **INTEGRADA** e sai do ranking de saúde (vira evento de celebração na timeline).

### F5 — Células (gestão mínima)

- Admin cria e nomeia células (ex.: *"GC — Travessa Liberdade // Irene e Isaías"*).
- Semente pode ser **encaixada** numa célula e **trocar** de célula.
- Troca de célula gera evento na timeline. Histórico de células preservado (não sobrescreve — registra a transição).
- Sem gestão completa de células (presença, reuniões, multiplicação) no MVP.

### F6 — Builder visual de fluxo de follow-up ⭐

A peça mais sofisticada do produto. **Não é hard-coded** — o admin desenha os fluxos.

- **Canvas visual** estilo n8n/Zapier: nós conectados (arrastar e ligar).
- **Nós de gatilho** (ex.: *"semente sem avanço há X dias"*, *"semente cadastrada"*, *"conquistou batismo"*).
- **Nós de ação** (MVP): *"criar tarefa para o regador"* (ex.: "Ligar para lembrar do próximo batismo").
- **Nós de ação (V2):** *"enviar mensagem WhatsApp automática"*, *"esperar N dias"*, condicionais ramificados.
- No MVP, a saída dos fluxos são **tarefas/lembretes** atribuídas ao regador — sem disparo automático de mensagem.

### F7 — Tarefas / lembretes

- Geradas pelos fluxos de follow-up (F6) ou criadas manualmente.
- Atribuídas a um regador, com prazo.
- Concluir tarefa = registra evento na timeline (mas **não** segura a saúde).

### F8 — Dashboard de métricas (para a liderança)

Métrica-mãe do Pastor Rafa: **quantas pessoas estão dando o próximo passo.**

- **KPIs por período** (dia/semana/mês/trimestre/custom):
  - Pessoas que avançaram (conquistas registradas no período)
  - Sementes novas cadastradas
  - Batizados no período
  - Pessoas em célula / em Visão Rhema
  - Total de integrados
- Distribuição da base por estado de saúde (quantos verdes/amarelos/vermelhos).
- Filtros por conquista e por regador.

---

## 5. Fluxos principais (passo a passo)

### 5.1 Cadastro (entrada da semente)

```
Evangelista/Flame Keeper aborda a pessoa (rua ou apelo no culto)
  → abre o formulário (mobile ou desktop)
  → preenche nome + telefone + bairro (abordador já vem setado)
  → salva
  → semente criada, saúde = 100% (relógio começa do cadastro)
  → evento "Cadastro" entra na timeline
```

### 5.2 Dia típico do consolidador

```
Abre o Sporos
  → vê a lista ordenada por saúde (pior primeiro)
  → identifica quem está parado há mais tempo
  → abre o WhatsApp da pessoa direto da lista
  → conversa / convida para próximo passo
  → registra o contato (vai pra timeline, mas NÃO muda a saúde)
  → quando a pessoa avança, registra a conquista → saúde reseta
```

### 5.3 Integração (conclusão)

```
Semente conquista as 3 (em qualquer ordem):
  Visão Rhema  ✔  (data)
  Batismo      ✔  (data)
  Célula       ✔  (data)
  → status = INTEGRADA → sai do ranking de saúde → celebração na timeline
```

---

## 6. Modelo de dados (PostgreSQL)

> Esquema inicial. Use `uuid` como PK, timestamps em UTC. ORM sugerido: **Drizzle** (queries de saúde por data ficam mais transparentes) ou Prisma.

### 6.1 Tabelas

```sql
-- Usuários do sistema (consolidadores e admin)
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  role         TEXT NOT NULL DEFAULT 'consolidador'
                 CHECK (role IN ('admin','consolidador')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Células (gestão mínima no MVP)
CREATE TABLE cells (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,             -- "GC - Travessa Liberdade // Irene e Isaías"
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sementes (pessoas em consolidação)
CREATE TABLE seeds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL,       -- canal de consolidação
  neighborhood        TEXT,                -- bairro
  abordador_id        UUID REFERENCES users(id),   -- quem cadastrou
  regador_id          UUID REFERENCES users(id),   -- dono atual da consolidação

  -- As 3 conquistas independentes (NULL = não conquistada)
  rhema_concluido_em  DATE,
  batizado_em         DATE,
  ja_batizado_externo BOOLEAN NOT NULL DEFAULT false,  -- batizado em outra igreja
  entrou_celula_em    DATE,
  cell_id             UUID REFERENCES cells(id),       -- célula atual

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Marco do último avanço: dirige o cálculo de saúde.
  -- Atualizado SOMENTE quando uma conquista é registrada.
  last_advance_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Linha do tempo / audit log (imutável)
CREATE TABLE seed_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_id      UUID NOT NULL REFERENCES seeds(id),
  type         TEXT NOT NULL,    -- 'cadastro' | 'conquista_rhema' | 'conquista_batismo'
                                 -- | 'conquista_celula' | 'troca_celula' | 'troca_regador'
                                 -- | 'contato' | 'tarefa_criada' | 'tarefa_concluida' | 'integrada'
  description  TEXT,             -- texto livre exibido na timeline
  metadata     JSONB,            -- { from_cell, to_cell, channel, ... }
  actor_id     UUID REFERENCES users(id),   -- quem realizou
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tarefas / lembretes
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_id       UUID REFERENCES seeds(id),
  assignee_id   UUID REFERENCES users(id),   -- regador responsável
  title         TEXT NOT NULL,
  due_at        TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','concluida','cancelada')),
  flow_id       UUID REFERENCES flows(id),    -- de qual fluxo nasceu (se automática)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuração global (parâmetros de saúde)
CREATE TABLE settings (
  key          TEXT PRIMARY KEY,    -- 'carencia_dias', 'limiar_amarelo_dias', ...
  value        JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fluxos de follow-up (builder visual)
CREATE TABLE flows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true,
  graph        JSONB NOT NULL,      -- nós + arestas do canvas visual
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.2 Princípios do modelo

- **`last_advance_at`** é o único campo que dirige a saúde. Atualizado **exclusivamente** ao registrar uma conquista — nunca por contato/tarefa.
- **`seed_events`** é **append-only** (nunca UPDATE/DELETE). É a fonte de verdade da timeline e da auditoria.
- Saúde é **derivada**, nunca persistida como estado mutável.

### 6.3 Status de integração (derivado)

```sql
-- INTEGRADA quando as 3 conquistas estão preenchidas
is_integrated = (rhema_concluido_em IS NOT NULL
             AND batizado_em IS NOT NULL
             AND entrou_celula_em IS NOT NULL)
```

### 6.4 Cálculo de saúde (exemplo de query)

```sql
SELECT
  s.*,
  EXTRACT(DAY FROM now() - s.last_advance_at) AS dias_parada,
  CASE
    WHEN s.rhema_concluido_em IS NOT NULL
     AND s.batizado_em IS NOT NULL
     AND s.entrou_celula_em IS NOT NULL          THEN 'integrado'
    WHEN now() - s.last_advance_at <= INTERVAL '30 days' THEN 'saudavel'
    WHEN now() - s.last_advance_at <= INTERVAL '45 days' THEN 'atencao'
    WHEN now() - s.last_advance_at <= INTERVAL '60 days' THEN 'em_risco'
    ELSE 'critico'
  END AS estado_saude
FROM seeds s
ORDER BY s.last_advance_at ASC;   -- pior saúde (mais antigo) primeiro
```

> Os intervalos `30/45/60` devem vir da tabela `settings`, não hard-coded.

---

## 7. Considerações técnicas

- **Frontend:** Next.js (App Router) + AlignUI ([starter](https://github.com/alignui/alignui-nextjs-typescript-starter), [docs](https://alignui.com/docs)). Aproveitar componentes de **Table** (lista de sementes) e layout de **timeline** (perfil).
- **Banco:** **PostgreSQL**. Recomendação: **Supabase** (Postgres gerenciado + Auth + Row Level Security) para resolver login e papéis admin/consolidador sem backend separado no MVP.
- **Builder visual (F6):** avaliar **React Flow** (`@xyflow/react`) para o canvas de nós/arestas; persistir o grafo em `flows.graph` (JSONB).
- **WhatsApp:** no MVP, apenas link `wa.me` (sem API). Disparo automático via API oficial do WhatsApp Business é V2 (tem custo por conversa e aprovação de templates).
- **Mobile:** o formulário de cadastro (F1) precisa ser **responsivo/mobile-first** (uso na rua).
- **Timezone:** armazenar em UTC, exibir no fuso local (America/Sao_Paulo).

---

## 8. Escopo: MVP vs. V2

| Funcionalidade | MVP | V2+ |
|---|:---:|:---:|
| Formulário simples de cadastro | ✅ | |
| Lista de sementes ordenada por saúde | ✅ | |
| Filtros (conquista, saúde, regador, célula, período) | ✅ | |
| Registro das 3 conquistas com data | ✅ | |
| Perfil + linha do tempo (audit log) | ✅ | |
| Células: criar/nomear + encaixar/trocar | ✅ | |
| Parâmetros de saúde configuráveis (admin) | ✅ | |
| Builder visual de fluxo (gatilho → criar tarefa) | ✅ | |
| Tarefas/lembretes | ✅ | |
| Dashboard de métricas por período | ✅ | |
| Papéis admin/consolidador | ✅ | |
| Disparo automático de WhatsApp nos fluxos | | 🔜 |
| Campos extras da semente (origem, batismo prévio, etc.) | | 🔜 |
| Módulo completo de Visão Rhema (turmas, presença) | | 🔜 |
| Módulo completo de células | | 🔜 |
| Múltiplas filiais | | 🔜 |
| Permissões granulares ("só as minhas sementes") | | 🔜 |
| Família como unidade | | 🔜 |

---

## 9. Histórias de usuário (MVP)

**Cadastro**
- Como evangelista, quero cadastrar uma pessoa com nome, telefone e bairro em poucos segundos no celular, para não perder o contato feito na rua.
- Como evangelista, quero que o abordador venha pré-preenchido comigo mas seja trocável, para registrar quem realmente abordou.

**Consolidação**
- Como consolidador, quero ver minha lista ordenada por quem está mais parado, para priorizar quem precisa de atenção.
- Como consolidador, quero abrir o WhatsApp da pessoa direto da lista, para agilizar o contato.
- Como consolidador, quero registrar quando alguém conclui Visão Rhema, batiza ou entra em célula, para que a saúde dela reset e ela suba na minha lista de "ok".
- Como consolidador, quero ver a linha do tempo completa de uma pessoa, para entender seu histórico antes de falar com ela.

**Células**
- Como admin, quero criar e nomear células, para encaixar as sementes.
- Como consolidador, quero trocar uma pessoa de célula e ver o histórico dessa troca.

**Fluxos & tarefas**
- Como admin, quero desenhar visualmente um fluxo "sem avanço há X dias → criar tarefa de ligar", para automatizar lembretes sem programar.
- Como consolidador, quero ver minhas tarefas pendentes geradas pelos fluxos, para saber o que fazer hoje.

**Liderança**
- Como Pastor Rafa, quero ver quantas pessoas deram o próximo passo no período, para medir a saúde da consolidação.
- Como Pastor Rafa, quero configurar os limiares de saúde, para ajustar à realidade da igreja.

---

## 10. Métricas de sucesso

- **Adoção:** todos os ~30–50 consolidadores usando semanalmente.
- **Cobertura:** % das sementes cadastradas com pelo menos 1 conquista em 30 dias.
- **Redução de "perdidos":** queda no nº de sementes em estado crítico (vermelho).
- **Taxa de integração:** % de sementes que atingem as 3 conquistas.

---

## 11. Dimensionamento

- **Volume:** ~20–30 sementes novas/mês.
- **Usuários:** ~30–50 consolidadores + 1 admin.
- **Carga por consolidador:** ~5–6 sementes ativas simultâneas.
- **Escala:** uma sede. Baixíssimo volume de dados — sem preocupação de performance no MVP.

---

## 12. Questões em aberto (a definir com o Pastor Rafa)

1. **Visão Rhema:** como exatamente se marca a conclusão (presença, evento único)? — definir na fase do módulo Rhema.
2. **Valores default** dos limiares de saúde (30/45/60 é só ponto de partida).
3. **Nós e gatilhos** específicos do builder de fluxo a serem priorizados.
4. **Mensagens-padrão** de follow-up (boas-vindas, convite, pós-batismo) — Pastor Rafa vai configurar.
5. Documento de gestão de células/membros que o Marcus vai fornecer.

---

*Documento vivo — atualizar conforme as decisões com o Pastor Rafa forem fechadas.*
