/* Selo de estoque: Em estoque / Últimas unidades / Sem estoque (StockStatus do back). */
export default function StockBadge({ product }) {
  const { status, quantity } = product.stock;
  if (status === 'OUT_OF_STOCK') return <span className="badge out">Sem estoque</span>;
  if (status === 'LOW_STOCK') return <span className="badge low">Últimas {quantity} unidades</span>;
  return <span className="badge in">Em estoque · {quantity} un.</span>;
}
