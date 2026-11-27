import Icon from '../Icon';
import { aisles } from '../../data/catalog';

/* Roteiro na loja: agrupa os itens escolhidos por corredor. */
export default function StoreRoute({ items, style }) {
  const groups = {};
  items.forEach((item) => {
    const { aisle } = item.product.stock;
    (groups[aisle] = groups[aisle] || []).push(item);
  });

  return (
    <section className="card route reveal" style={style} aria-label="Roteiro na loja">
      <h3 className="section-title"><Icon name="map" /> Seu roteiro na loja</h3>
      <ol className="stops">
        <li className="stop here">
          <span className="stop-badge"><Icon name="user" /></span>
          <div><strong>Você está aqui</strong><span>Totem de autoatendimento · Pintura</span></div>
        </li>
        {Object.keys(groups).sort().map((aisle) => (
          <li key={aisle} className="stop">
            <span className="stop-badge">{aisle}</span>
            <div>
              <strong>Corredor {aisle} · {aisles[aisle]}</strong>
              <span>
                {groups[aisle]
                  .slice()
                  .sort((a, b) => a.product.stock.shelf.localeCompare(b.product.stock.shelf))
                  .map((item, i) => (
                    <span key={item.product.id}>
                      {i > 0 && ' · '}
                      {item.product.shortName} <em>({item.product.stock.shelf})</em>
                    </span>
                  ))}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
