export type CelulaGroup = 'dk' | 'padrao';

export type CelulaOption = {
  value: string;
  label: string;
  group: CelulaGroup;
};

export const CELULA_GROUP_LABELS: Record<CelulaGroup, string> = {
  dk: 'DK',
  padrao: 'Padrão',
};

export const CELULAS_DK: CelulaOption[] = [
  { value: 'inside', label: 'Inside', group: 'dk' },
  { value: 'gaditas', label: 'Gaditas', group: 'dk' },
  { value: 'efata', label: 'Efata', group: 'dk' },
  { value: 'shekinah', label: 'Shekinah', group: 'dk' },
  { value: 'jeova-nissi', label: 'Jeová Nissi', group: 'dk' },
  { value: 'dokmos', label: 'Dokmos', group: 'dk' },
];

export const CELULAS_PADRAO: CelulaOption[] = [
  { value: 'promise', label: 'Promise', group: 'padrao' },
  { value: 'canaa', label: 'Canaã', group: 'padrao' },
  { value: 'renovo', label: 'Renovo', group: 'padrao' },
  { value: 'nova-uniao', label: 'Nova União', group: 'padrao' },
  { value: 'damasco', label: 'Damasco', group: 'padrao' },
  { value: 'agape', label: 'Ágape', group: 'padrao' },
  { value: 'joao-batista', label: 'João Batista', group: 'padrao' },
  { value: 'siao', label: 'Sião', group: 'padrao' },
  { value: 'neemias', label: 'Neemias', group: 'padrao' },
  { value: 'moria', label: 'Moriá', group: 'padrao' },
  { value: 'atalaias', label: 'Atalaias', group: 'padrao' },
  { value: 'belem', label: 'Belém', group: 'padrao' },
  { value: 'emanuel', label: 'Emanuel', group: 'padrao' },
  { value: '1-corintios-13', label: '1Corintios 13', group: 'padrao' },
  { value: 'liberdade', label: 'Liberdade', group: 'padrao' },
  { value: 'kadosh', label: 'Kadosh', group: 'padrao' },
  { value: 'metanoia', label: 'Metanoia', group: 'padrao' },
  { value: 'soul-casa', label: 'Soul Casa', group: 'padrao' },
  { value: 'filadelfia', label: 'Filadélfia', group: 'padrao' },
  { value: 'bereia', label: 'Beréia', group: 'padrao' },
  { value: 'timoteo', label: 'Timóteo', group: 'padrao' },
  { value: 'samaria', label: 'Samaria', group: 'padrao' },
  { value: 'essencia', label: 'Essência', group: 'padrao' },
  { value: 'ide', label: 'Ide', group: 'padrao' },
  { value: 'identidade', label: 'Identidade', group: 'padrao' },
  { value: 'efraim', label: 'Efraim', group: 'padrao' },
  { value: 'israel', label: 'Israel', group: 'padrao' },
  { value: 'florescer', label: 'Florescer', group: 'padrao' },
  { value: 'jeova-shammah', label: 'Jeová Shammah', group: 'padrao' },
  { value: 'esperanca', label: 'Esperança', group: 'padrao' },
  { value: 'inside-padrao', label: 'Inside', group: 'padrao' },
  { value: 'jeova-nissi-padrao', label: 'Jeová Nissi', group: 'padrao' },
  { value: '2-corintios-5-17', label: '2Corintios 5:17', group: 'padrao' },
  { value: 'efata-padrao', label: 'Efatá', group: 'padrao' },
  { value: 'ekballo', label: 'Ekballo', group: 'padrao' },
  { value: 'gaditas-padrao', label: 'Gaditas', group: 'padrao' },
  { value: 'kairos', label: 'Kairós', group: 'padrao' },
  { value: 'raah', label: 'Raah', group: 'padrao' },
  { value: 'sela', label: 'Selá', group: 'padrao' },
  { value: 'shekinah-padrao', label: 'Shekinah', group: 'padrao' },
  { value: 'veredas', label: 'Veredas', group: 'padrao' },
  { value: 'videira', label: 'Videira', group: 'padrao' },
  { value: 'yahweh', label: 'Yahweh', group: 'padrao' },
  { value: 'yosef', label: 'Yosef', group: 'padrao' },
  { value: 'romanos-8-mulheres', label: 'Romanos 8 (Mulheres)', group: 'padrao' },
  { value: 'dokmos-adols', label: 'Dokmos (Adols)', group: 'padrao' },
  { value: 'lia-mulheres', label: 'Lia (Mulheres)', group: 'padrao' },
  { value: 'priscilas-mulheres', label: 'Priscilas (Mulheres)', group: 'padrao' },
  { value: 'perolas-mulheres-30', label: 'Perolas (Mulheres 30+)', group: 'padrao' },
  { value: 'rei-davi-homens', label: 'Rei Davi (Homens)', group: 'padrao' },
  { value: 'zoe-mulheres', label: 'Zoe (Mulheres)', group: 'padrao' },
  { value: 'marias-mulheres', label: 'Marias (Mulheres)', group: 'padrao' },
  { value: 'blosson-mulheres', label: 'Blosson (Mulheres)', group: 'padrao' },
  { value: 'hayah-mulheres-30', label: 'Hayah (Mulheres 30+)', group: 'padrao' },
  { value: 'zion-homens-25', label: 'Zion (Homens 25+)', group: 'padrao' },
  { value: 'phileo', label: 'Phileo', group: 'padrao' },
  { value: 'devocao', label: 'Devoção', group: 'padrao' },
  { value: 'caminho', label: 'Caminho', group: 'padrao' },
  { value: 'betel', label: 'Betel', group: 'padrao' },
  { value: 'kyrios', label: 'Kyrios', group: 'padrao' },
  { value: 'recomeco', label: 'Recomeço', group: 'padrao' },
  { value: 'legado', label: 'Legado', group: 'padrao' },
  { value: 'peniel', label: 'Peniel', group: 'padrao' },
  { value: 'jeremias', label: 'Jeremias', group: 'padrao' },
  { value: 'hagias', label: 'Hagias', group: 'padrao' },
  { value: 'rabbi', label: 'Rabbi', group: 'padrao' },
  { value: 'cafarnaum', label: 'Cafarnaum', group: 'padrao' },
  { value: 'hope', label: 'Hope', group: 'padrao' },
  { value: 'restauracao', label: 'Restauração', group: 'padrao' },
  { value: 'hosana', label: 'Hosana', group: 'padrao' },
  { value: 'testemunhas', label: 'Testemunhas', group: 'padrao' },
  { value: 'raboni', label: 'Raboni', group: 'padrao' },
  { value: 'barnabe', label: 'Barnabé', group: 'padrao' },
  { value: 'cartas-vivas', label: 'Cartas Vivas', group: 'padrao' },
  { value: 'geracao-brave', label: 'Geração BRAVE', group: 'padrao' },
  { value: 'preciosas-mulheres', label: 'Preciosas (Mulheres)', group: 'padrao' },
  { value: 'casa-de-oracao', label: 'Casa de Oração', group: 'padrao' },
];

export const ALL_CELULAS = [...CELULAS_DK, ...CELULAS_PADRAO];

export function getCelulaLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return ALL_CELULAS.find((celula) => celula.value === value)?.label ?? value;
}

export function isValidCelulaValue(value: string) {
  return ALL_CELULAS.some((celula) => celula.value === value);
}
