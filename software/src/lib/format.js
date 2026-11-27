/* Formatação em pt-BR */

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function brl(value) {
  return brlFormatter.format(value);
}

export function num(value, digits = 1) {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: digits });
}

// Ex.: "1 balde de 18 L", "2 latas de 3,6 L", "4 folhas"
export function qty(product, amount) {
  const [one, many] = product.unitNames;
  const a = product.attributes;
  const size = a.volume_liters ? ` de ${num(a.volume_liters)} L` : a.weight_kg ? ` de ${num(a.weight_kg)} kg` : '';
  return `${amount} ${amount === 1 ? one : many}${size}`;
}

export function location(product, short = false) {
  const s = product.stock;
  return short ? `${s.aisle} · ${s.shelf}` : `Corredor ${s.aisle} · Prateleira ${s.shelf}`;
}
