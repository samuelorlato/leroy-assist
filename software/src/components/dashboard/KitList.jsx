import Icon from '../Icon';
import ProductArt from '../ProductArt';
import StockBadge from '../StockBadge';
import { brl, location, qty } from '../../lib/format';

/* Produtos que complementam a compra (tb_complement). O cliente pode incluir/remover. */
export default function KitList({ items, selected, onToggle, style }) {
  return (
    <section className="reveal" style={style} aria-labelledby="kit-title">
      <div className="section-head">
        <h3 className="section-title" id="kit-title">Complete seu projeto</h3>
        <span>Toque para incluir ou remover</span>
      </div>
      <ul className="kit">
        {items.map((item, i) => (
          <li key={item.product.id}>
            <button type="button" className="kit-item" aria-pressed={selected[i]} onClick={() => onToggle(i)}>
              <ProductArt product={item.product} size="xs" />
              <span className="kit-info">
                <strong>{item.product.name}</strong>
                <span className="kit-reason">{item.reason}</span>
                <span className="kit-meta">
                  <span className="loc-mini"><Icon name="pin" /> {location(item.product, true)}</span>
                  <StockBadge product={item.product} />
                </span>
              </span>
              <span className="kit-price">
                <strong>{brl(item.total)}</strong>
                <small>{qty(item.product, item.qty)}</small>
              </span>
              <span className="kit-check" aria-hidden="true"><Icon name="check" /></span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
