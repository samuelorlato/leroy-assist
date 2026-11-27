import Icon from '../Icon';
import ProductArt from '../ProductArt';
import StockBadge from '../StockBadge';
import { brl, location } from '../../lib/format';

/* As 2 alternativas ao produto principal. */
export default function Alternatives({ items, style }) {
  return (
    <section className="reveal" style={style} aria-labelledby="alt-title">
      <h3 className="section-title" id="alt-title">Outras opções</h3>
      <div className="alt-grid">
        {items.map(({ product: p, note }) => (
          <article key={p.id} className={`card alt-card${p.stock.status === 'OUT_OF_STOCK' ? ' is-out' : ''}`}>
            <ProductArt product={p} size="sm" />
            <div className="alt-body">
              <h4>{p.name}</h4>
              <p className="alt-note">{note}</p>
              <div className="alt-meta">
                <span className="price">{brl(p.price)}</span>
                <StockBadge product={p} />
              </div>
              <span className="loc-mini"><Icon name="pin" /> {location(p)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
