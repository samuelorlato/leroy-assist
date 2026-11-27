/*
 * Catálogo simulado da loja física.
 *
 * Espelha os INSERTs de sql/create_tables.sql (tb_category, tb_product, tb_stock e
 * tb_complement), para que o totem mostre exatamente os mesmos produtos, estoques,
 * corredores e complementos que as rotas do back-end entregariam para a LLM
 * (GET /products, GET /stock/{id} e GET /assistant/context).
 *
 * Os campos "shortName", "art", "swatch" e "unitNames" são só de apresentação.
 */

// Mesmo limite de StockStatus.java (quantidade <= 5 => LOW_STOCK).
export const LOW_STOCK_THRESHOLD = 5;

export const categories = {
  1: 'Tintas',
  2: 'Preparação de Superfície',
  3: 'Ferramentas de Pintura',
  4: 'Proteção e Acabamento',
};

export const aisles = {
  A12: 'Tintas',
  A13: 'Preparação de superfície',
  A14: 'Ferramentas e proteção',
};

const UNIT_NAMES = {
  bucket: ['balde', 'baldes'],
  can: ['lata', 'latas'],
  unit: ['unidade', 'unidades'],
  roll: ['rolo', 'rolos'],
};

// tb_product
const rawProducts = [
  {
    id: 1, categoryId: 1, brand: 'Colorare', price: 389.9, unit: 'bucket',
    name: 'Tinta Acrílica Fosca Premium Lavável 18L',
    shortName: 'Tinta Fosca Premium Lavável',
    description: 'Tinta premium para paredes internas, acabamento fosco, alta cobertura e fácil de limpar.',
    attributes: { finish: 'matte', washable: true, indoor: true, outdoor: false, coverage_m2_per_liter: 12, recommended_coats: 2, volume_liters: 18, drying_time_hours: 4 },
    art: 'bucket', swatch: '#2E9E6B',
  },
  {
    id: 2, categoryId: 1, brand: 'Prisma', price: 219.9, unit: 'bucket',
    name: 'Tinta Acrílica Fosca Econômica 18L',
    shortName: 'Tinta Fosca Econômica',
    description: 'Tinta de bom custo-benefício para paredes internas, acabamento fosco, não lavável.',
    attributes: { finish: 'matte', washable: false, indoor: true, outdoor: false, coverage_m2_per_liter: 9, recommended_coats: 3, volume_liters: 18, drying_time_hours: 3 },
    art: 'bucket', swatch: '#E0872B',
  },
  {
    id: 3, categoryId: 1, brand: 'Colorare', price: 129.9, unit: 'can',
    name: 'Tinta Acrílica Acetinada Lavável 3,6L',
    shortName: 'Tinta Acetinada Lavável',
    description: 'Acabamento acetinado com leve brilho, resistente a manchas, ideal para quartos e salas.',
    attributes: { finish: 'satin', washable: true, indoor: true, outdoor: false, coverage_m2_per_liter: 12, recommended_coats: 2, volume_liters: 3.6, drying_time_hours: 4 },
    art: 'can', swatch: '#4A86C5',
  },
  {
    id: 4, categoryId: 2, brand: 'Prisma', price: 79.9, unit: 'can',
    name: 'Selador Acrílico Pigmentado 3,6L',
    shortName: 'Selador Acrílico',
    description: 'Uniformiza a absorção da parede e reduz o consumo de tinta.',
    attributes: { indoor: true, outdoor: true, coverage_m2_per_liter: 10, recommended_coats: 1, volume_liters: 3.6, drying_time_hours: 2 },
    art: 'can', swatch: '#8FA39A',
  },
  {
    id: 5, categoryId: 2, brand: 'Prisma', price: 54.9, unit: 'bucket',
    name: 'Massa Corrida PVA 6kg',
    shortName: 'Massa Corrida',
    description: 'Corrige pequenas imperfeições e nivela paredes internas antes da pintura.',
    attributes: { indoor: true, outdoor: false, weight_kg: 6, recommended_coats: 2, drying_time_hours: 6, needs_sanding: true },
    art: 'bucket', swatch: '#BFA87A',
  },
  {
    id: 6, categoryId: 2, brand: 'Lixar', price: 4.9, unit: 'unit',
    name: 'Lixa para Parede Grão 150',
    shortName: 'Lixa Grão 150',
    description: 'Lixa para acabamento de massa corrida e remoção de imperfeições leves.',
    attributes: { grit: 150, use: 'wall', dry_sanding: true },
    art: 'sandpaper', unitNames: ['folha', 'folhas'],
  },
  {
    id: 7, categoryId: 3, brand: 'Pintar Mais', price: 24.9, unit: 'unit',
    name: 'Rolo de Lã 23cm com Cabo',
    shortName: 'Rolo de Lã',
    description: 'Rolo para aplicação de tintas acrílicas em paredes lisas, acabamento uniforme.',
    attributes: { width_cm: 23, material: 'wool', surface: 'smooth', suitable_for: ['acrylic', 'latex'] },
    art: 'roller', swatch: '#F3ECDD',
  },
  {
    id: 8, categoryId: 3, brand: 'Pintar Mais', price: 14.9, unit: 'unit',
    name: 'Pincel Trincha 2 polegadas',
    shortName: 'Pincel Trincha',
    description: 'Pincel para recortes, cantos e acabamentos onde o rolo não alcança.',
    attributes: { width_inches: 2, bristle: 'synthetic', use: 'edges_and_corners' },
    art: 'brush',
  },
  {
    id: 9, categoryId: 4, brand: 'Fixa', price: 12.9, unit: 'roll',
    name: 'Fita Crepe 48mm x 50m',
    shortName: 'Fita Crepe',
    description: 'Protege rodapés, batentes e tomadas para acabamento limpo nas bordas.',
    attributes: { width_mm: 48, length_m: 50, use: 'masking', removable_days: 7 },
    art: 'tape',
  },
  {
    id: 10, categoryId: 3, brand: 'Pintar Mais', price: 16.9, unit: 'unit',
    name: 'Bandeja para Pintura com Rolo',
    shortName: 'Bandeja',
    description: 'Bandeja plástica com rampa para carregar o rolo com a quantidade certa de tinta.',
    attributes: { material: 'plastic', fits_roller_cm: 23, reusable: true },
    art: 'tray', swatch: '#7DBF45',
  },
];

// tb_stock
const stock = {
  1: { quantity: 24, aisle: 'A12', shelf: 'P1' },
  2: { quantity: 0, aisle: 'A12', shelf: 'P2' },
  3: { quantity: 41, aisle: 'A12', shelf: 'P3' },
  4: { quantity: 33, aisle: 'A13', shelf: 'P1' },
  5: { quantity: 18, aisle: 'A13', shelf: 'P2' },
  6: { quantity: 200, aisle: 'A13', shelf: 'P4' },
  7: { quantity: 57, aisle: 'A14', shelf: 'P1' },
  8: { quantity: 3, aisle: 'A14', shelf: 'P2' },
  9: { quantity: 120, aisle: 'A14', shelf: 'P3' },
  10: { quantity: 45, aisle: 'A14', shelf: 'P4' },
};

// tb_complement: [id_product, id_complement, reason]
const complements = [
  [1, 4, 'Sela a parede e reduz o consumo de tinta.'],
  [1, 5, 'Corrige imperfeições antes da pintura.'],
  [1, 6, 'Alisa a massa corrida para um acabamento uniforme.'],
  [1, 7, 'Aplicação uniforme em paredes lisas.'],
  [1, 10, 'Carrega o rolo com a quantidade certa de tinta.'],
  [1, 9, 'Protege rodapés, batentes e tomadas.'],
  [1, 8, 'Acabamento nos cantos e recortes.'],
  [3, 4, 'Sela a parede e reduz o consumo de tinta.'],
  [3, 7, 'Aplicação uniforme em paredes lisas.'],
  [3, 10, 'Carrega o rolo com a quantidade certa de tinta.'],
  [3, 9, 'Protege rodapés, batentes e tomadas.'],
  [3, 8, 'Acabamento nos cantos e recortes.'],
  [5, 6, 'A massa corrida precisa ser lixada depois de seca.'],
];

export function stockStatus(quantity) {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  return quantity <= LOW_STOCK_THRESHOLD ? 'LOW_STOCK' : 'IN_STOCK';
}

// Produto já "montado" como o back devolveria: produto + categoria + estoque.
export const products = rawProducts.map((p) => Object.freeze({
  ...p,
  categoryName: categories[p.categoryId],
  unitNames: p.unitNames || UNIT_NAMES[p.unit],
  stock: Object.freeze({ ...stock[p.id], status: stockStatus(stock[p.id].quantity) }),
}));

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id) {
  return byId.get(id);
}

export function complementReason(mainId, complementId) {
  const row = complements.find(([p, c]) => p === mainId && c === complementId)
    || complements.find(([, c]) => c === complementId);
  return row ? row[2] : '';
}
