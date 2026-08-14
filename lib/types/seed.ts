export type AbordagemTipo = 'criativa' | 'direta';

export const ABORDAGEM_TIPO_LABELS: Record<AbordagemTipo, string> = {
  criativa: 'Criativa',
  direta: 'Direta',
};

export type AceitouJesus = 'sim' | 'nao' | 'ja_cristao';

export const ACEITOU_JESUS_LABELS: Record<AceitouJesus, string> = {
  sim: 'Sim',
  nao: 'Não',
  ja_cristao: 'Já é cristão',
};

export type UserRole = 'admin' | 'lider' | 'voluntario';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const SEED_GENDER_LABELS = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
} as const;

export type SeedGender = keyof typeof SEED_GENDER_LABELS;

export type SeedEventType =
  | 'cadastro'
  | 'marco_confissao'
  | 'marco_rhema'
  | 'marco_batismo'
  | 'marco_celula'
  | 'troca_celula'
  | 'troca_regador'
  | 'contato'
  | 'tarefa_criada'
  | 'tarefa_concluida'
  | 'integrada'
  | 'desistencia'
  | 'reativada'
  | 'inscricao_rhema';

export const ACAO_LABELS = {
  visita: 'Visita',
  mensagem: 'Mensagem de WhatsApp',
  ligacao: 'Ligação',
  convite_celula: 'Convite para célula',
  outro: 'Outra ação',
} as const;

export type AcaoKind = keyof typeof ACAO_LABELS;

export type SeedEvent = {
  id: string;
  seedId: string;
  type: SeedEventType;
  description: string;
  metadata?: Record<string, unknown>;
  actorId: string | null;
  occurredAt: string;
};

export type Seed = {
  id: string;
  name: string;
  phone: string;
  neighborhood: string | null;
  gender: SeedGender | null;
  abordadorId: string;
  regadorId: string;
  confissaoFeEm: string | null;
  rhemaConcluidoEm: string | null;
  batizadoEm: string | null;
  jaBatizadoExterno: boolean;
  entrouCelulaEm: string | null;
  cellId: string | null;
  /** Integrado = engajado no voluntariado (marcação manual do líder). */
  integradoEm: string | null;
  desistiuEm: string | null;
  desistenciaMotivo: string | null;
  abordagemData: string | null;
  abordagemLocal: string | null;
  abordagemTipo: AbordagemTipo | null;
  aceitouJesus: AceitouJesus | null;
  direcionadoCelula: boolean | null;
  celulaEncaminhada: string | null;
  createdAt: string;
  lastAdvanceAt: string;
};

export type HealthState =
  | 'integrado'
  | 'saudavel'
  | 'atencao'
  | 'em_risco'
  | 'critico';

export type HealthSettings = {
  carenciaDias: number;
  limiarAmareloDias: number;
  limiarVermelhoDias: number;
};

export type SeedWithHealth = Seed & {
  health: HealthState;
  diasParada: number;
  isIntegrated: boolean;
};

export type CreateSeedInput = {
  name: string;
  phone: string;
  neighborhood?: string;
  gender?: SeedGender;
  abordadorId: string;
  abordagemData?: string;
  abordagemLocal?: string;
  abordagemTipo?: AbordagemTipo;
  aceitouJesus?: AceitouJesus;
  direcionadoCelula?: boolean;
  celulaEncaminhada?: string;
};

export type SeedStore = {
  seeds: Seed[];
  events: SeedEvent[];
};
