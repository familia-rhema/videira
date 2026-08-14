/** Bairros oficiais de São Gonçalo (RJ) — Prefeitura Municipal. */
export const SAO_GONCALO_NEIGHBORHOODS = [
  'Alcântara',
  'Almerinda',
  'Amendoeira',
  'Anaia Grande',
  'Anaia Pequeno',
  'Antonina',
  'Arrastão',
  'Arsenal',
  'Barracão',
  'Barro Vermelho',
  'Boa Vista',
  'Boaçu',
  'Bom Retiro',
  'Brasilândia',
  'Camarão',
  'Centro',
  'Coelho',
  'Colubandê',
  'Convanca',
  'Cruzeiro do Sul',
  'Eliane',
  'Engenho do Roçado',
  'Engenho Pequeno',
  'Estrela do Norte',
  'Fazenda dos Mineiros',
  'Galo Branco',
  'Gebara',
  'Gradim',
  'Guarani',
  'Guaxindiba',
  'Ieda',
  'Ipiíba',
  'Itaoca',
  'Itaúna',
  'Jardim Amendoeira',
  'Jardim Catarina',
  'Jardim Nova República',
  'Joquei',
  'Lagoinha',
  'Laranjal',
  'Largo da Idéia',
  'Lindo Parque',
  'Luiz Caçador',
  'Mangueira',
  'Marambaia',
  'Maria Paula',
  'Miriambi',
  'Monjolo',
  'Morro do Castro',
  'Mutondo',
  'Mutuá',
  'Mutuaguaçu',
  'Mutuapira',
  'Neves',
  'Nova Cidade',
  'Novo México',
  'Pacheco',
  'Palmeira',
  'Parada 40',
  'Paraíso',
  'Patronato',
  'Pita',
  'Porto da Madama',
  'Porto da Pedra',
  'Porto do Rosa',
  'Porto Novo',
  'Porto Velho',
  'Raul Veiga',
  'Recanto das Acácias',
  'Rio do Ouro',
  'Rocha',
  'Rosane',
  'Sacramento',
  'Salgueiro',
  'Santa Catarina',
  'Santa Isabel',
  'Santa Luzia',
  'São Miguel',
  'Tenente Jardim',
  'Tiradentes',
  'Tribobó',
  'Trindade',
  'Várzea das Moças',
  'Venda da Cruz',
  'Vila Candoza',
  'Vila Lage',
  'Vila Lara',
  'Vila Três',
  'Vista Alegre',
  'Zé Garoto',
  'Zumbi',
] as const;

export type SaoGoncaloNeighborhood =
  (typeof SAO_GONCALO_NEIGHBORHOODS)[number];

export function normalizeNeighborhoodQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function filterNeighborhoods(query: string) {
  const normalized = normalizeNeighborhoodQuery(query);
  if (!normalized) return [...SAO_GONCALO_NEIGHBORHOODS];

  return SAO_GONCALO_NEIGHBORHOODS.filter((neighborhood) =>
    normalizeNeighborhoodQuery(neighborhood).includes(normalized),
  );
}
