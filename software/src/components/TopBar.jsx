import Icon from './Icon';

export default function TopBar({ inert, onSeller, onReset }) {
  return (
    <header className="topbar" inert={inert}>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true"><Icon name="logo" /></span>
        <div className="brand-text">
          <strong>Leroy Assist</strong>
          <span><i className="status-dot" aria-hidden="true" />Assistente de compras · Seção de Pintura</span>
        </div>
      </div>
      <div className="topbar-actions">
        <button type="button" className="btn btn-outline seller-top" onClick={onSeller} aria-label="Chamar vendedor">
          <Icon name="headset" />
          <span className="hide-narrow">Chamar vendedor</span>
        </button>
        <button type="button" className="btn btn-ghost icon-btn" onClick={onReset} aria-label="Nova conversa" title="Nova conversa">
          <Icon name="refresh" />
        </button>
      </div>
    </header>
  );
}
