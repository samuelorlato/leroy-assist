import Icon from '../Icon';
import ProductArt from '../ProductArt';
import StockBadge from '../StockBadge';
import { brl, location, qty } from '../../lib/format';

/* Card do produto principal: preço, estoque, corredor/prateleira, quantidade e motivos. */
export default function MainProduct({ main, style }) {
  const { product: p, plan, reasons } = main;
  return (
    <article className="card main-card reveal" style={style} aria-labelledby="main-name">
      <span className="ribbon"><Icon name="star" /> Melhor escolha para você</span>

      <div className="main-head">
        <ProductArt product={p} size="lg" />
        <div className="main-info">
          <p className="p-brand">{p.brand} · {p.categoryName}</p>
          <h3 className="p-name" id="main-name">{p.name}</h3>
          <div className="price-row">
            <span className="price">{brl(p.price)}</span>
            <span className="per">/ {p.unitNames[0]}</span>
          </div>
          <StockBadge product={p} />
        </div>
      </div>

      <div className="locate">
        <span className="pin"><Icon name="pin" /></span>
        <div className="where"><small>Onde encontrar</small><strong>{location(p)}</strong></div>
        <div className="qty"><small>Leve</small><strong>{qty(p, plan.qty)}</strong></div>
      </div>

      <div className="why">
        <h4 className="section-title">Por que esta tinta?</h4>
        <ul>
          {reasons.map((reason) => (
            <li key={reason.title}>
              <span className="ck"><Icon name="check" /></span>
              <div><strong>{reason.title}</strong><span>{reason.text}</span></div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
