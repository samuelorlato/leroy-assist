import { useEffect, useState } from 'react';

/* Aviso rápido no rodapé. Recebe { id, text }; um id novo mostra o aviso de novo. */
export default function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
      {toast?.text}
    </div>
  );
}
