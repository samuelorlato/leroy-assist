import { useEffect, useRef } from 'react';
import Icon from './Icon';

/* Modal de confirmação do "Chamar vendedor" (simulado). */
export default function SellerModal({ open, ticket, onClose }) {
  const okRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const timer = setTimeout(() => okRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      clearTimeout(timer);
      if (previous instanceof HTMLElement && document.contains(previous) && !previous.closest('[inert]')) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return (
    <div
      className={`modal-backdrop${open ? ' open' : ''}`}
      aria-hidden={!open}
      inert={!open}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="seller-title" aria-describedby="seller-desc">
        <div className="modal-icon">
          <Icon name="headset" className="ic-lg" />
          <span className="ok"><Icon name="check" /></span>
        </div>
        <h2 id="seller-title">Vendedor a caminho!</h2>
        <p id="seller-desc">
          Um especialista da seção de <strong>Pintura</strong> foi avisado e vem até este totem em instantes.
        </p>
        <div className="ticket">
          <small>Seu atendimento</small>
          <strong>{ticket || '—'}</strong>
        </div>
        <p className="modal-note">Pode continuar navegando, ele te encontra aqui.</p>
        <button ref={okRef} type="button" className="btn btn-primary btn-lg" onClick={onClose}>
          Ok, vou aguardar
        </button>
      </div>
    </div>
  );
}
