import Chips from './Chips';
import Icon from './Icon';
import ProductArt from './ProductArt';
import RichText from './RichText';
import Welcome from './Welcome';
import { PROCESS_STEPS } from '../hooks/useAssistant';
import { location } from '../lib/format';

function BotRow({ cont, className = '', children }) {
  return (
    <div className={`msg bot ${cont ? 'cont' : ''} ${className}`.trim()}>
      <div className="avatar" aria-hidden="true"><Icon name="logo" /></div>
      <div className="msg-body">{children}</div>
    </div>
  );
}

function Typing({ cont }) {
  return (
    <BotRow cont={cont} className="typing">
      <div className="bubble">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <span>digitando…</span>
      </div>
    </BotRow>
  );
}

function Processing({ message, cont }) {
  const { current, done } = message;
  return (
    <BotRow cont={cont} className="proc">
      <div className="bubble">
        <span className="proc-title"><Icon name="sparkle" /><span>{done ? 'Análise concluída' : 'Analisando…'}</span></span>
        <ul className="steps">
          {PROCESS_STEPS.map((step, i) => {
            const state = done || i < current ? 'done' : i === current ? 'active' : '';
            return (
              <li key={step} className={state}>
                <span className="st"><Icon name="check" /></span>
                <span>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </BotRow>
  );
}

function Result({ message, cont, onChip }) {
  const p = message.product;
  return (
    <BotRow cont={cont}>
      <div className="bubble">
        <p>Prontinho! ✅ Esta é a melhor opção pra você:</p>
        <div className="mini">
          <ProductArt product={p} size="xs" />
          <span className="mini-info">
            <strong>{p.name}</strong>
            <span><Icon name="pin" /> {location(p)}</span>
          </span>
        </div>
        <p>Separei também <strong>{message.count} itens</strong> pra completar o projeto.</p>
      </div>
      {message.chipsActive && <Chips chips={message.chips} onSelect={onChip} />}
    </BotRow>
  );
}

export default function ChatMessage({ message, cont, onChip }) {
  switch (message.kind) {
    case 'welcome':
      return <Welcome chips={message.chips} chipsActive={message.chipsActive} onChip={onChip} />;
    case 'typing':
      return <Typing cont={cont} />;
    case 'processing':
      return <Processing message={message} cont={cont} />;
    case 'result':
      return <Result message={message} cont={cont} onChip={onChip} />;
    default:
      break;
  }

  if (message.role === 'user') {
    return (
      <div className="msg user">
        <div className="bubble">{message.text}</div>
      </div>
    );
  }

  return (
    <BotRow cont={cont}>
      <div className="bubble"><RichText text={message.text} /></div>
      {message.chipsActive && <Chips chips={message.chips} onSelect={onChip} />}
    </BotRow>
  );
}
