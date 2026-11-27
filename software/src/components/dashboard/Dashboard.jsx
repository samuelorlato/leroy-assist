import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import SummaryCard from './SummaryCard';
import MainProduct from './MainProduct';
import Alternatives from './Alternatives';
import KitList from './KitList';
import StoreRoute from './StoreRoute';
import { brl } from '../../lib/format';

/*
 * Painel final com a recomendação. Fica sempre montado e "sobe" por cima do chat
 * quando open = true. Use key={rec.id} no pai para zerar as seleções a cada nova recomendação.
 */
export default function Dashboard({ rec, open, onClose, onReset, onSeller }) {
  const [selected, setSelected] = useState(() => (rec ? rec.complements.map(() => true) : []));
  const backRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const timer = setTimeout(() => backRef.current?.focus({ preventScroll: true }), 120);
    return () => clearTimeout(timer);
  }, [open]);

  const className = `dash${open ? ' open' : ''}`;
  if (!rec) return <section className={className} aria-hidden="true" inert />;

  const items = [
    { product: rec.main.product, qty: rec.main.plan.qty, total: rec.main.plan.total },
    ...rec.complements.filter((_, i) => selected[i]),
  ];
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const toggle = (index) => setSelected((list) => list.map((value, i) => (i === index ? !value : value)));

  // Ordem da animação de entrada de cada bloco.
  let order = 0;
  const reveal = () => ({ '--i': order++ });

  return (
    <section className={className} aria-labelledby="dash-title" aria-hidden={!open} inert={!open}>
      <header className="dash-top">
        <button ref={backRef} type="button" className="btn btn-ghost" onClick={onClose}>
          <Icon name="arrowLeft" /><span>Conversa</span>
        </button>
        <h2 id="dash-title">Sua recomendação</h2>
        <button type="button" className="btn btn-outline" onClick={onReset} aria-label="Nova consulta">
          <Icon name="refresh" /><span className="hide-narrow">Nova consulta</span>
        </button>
      </header>

      <div className="dash-scroll" ref={scrollRef}>
        <div className="dash-content">
          <SummaryCard rec={rec} style={reveal()} />
          {rec.notice && (
            <div className="notice reveal" role="note" style={reveal()}>
              <Icon name="info" /><span>{rec.notice}</span>
            </div>
          )}
          <MainProduct main={rec.main} style={reveal()} />
          <Alternatives items={rec.alternatives} style={reveal()} />
          <KitList items={rec.complements} selected={selected} onToggle={toggle} style={reveal()} />
          <StoreRoute items={items} style={reveal()} />
          <p className="disclaimer reveal" style={reveal()}>
            Preços e estoque de referência desta loja. Confirme os valores no caixa.
          </p>
        </div>
      </div>

      <footer className="dash-foot">
        <div className="total" aria-live="polite">
          <small>Total estimado · {items.length} {items.length === 1 ? 'produto' : 'produtos'}</small>
          <strong>{brl(total)}</strong>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={onSeller}>
          <Icon name="headset" /><span>Chamar vendedor</span>
        </button>
      </footer>
    </section>
  );
}
