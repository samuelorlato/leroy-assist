import Icon from './Icon';

/* Botões de resposta rápida que aparecem abaixo das perguntas do assistente. */
export default function Chips({ chips, onSelect }) {
  return (
    <div className="chips" role="group" aria-label="Opções de resposta">
      {chips.map((chip, i) => (
        <button
          key={chip.label}
          type="button"
          className={`chip${chip.variant === 'primary' ? ' primary' : ''}`}
          style={{ '--i': i }}
          onClick={() => onSelect(chip)}
        >
          {chip.icon && <Icon name={chip.icon} />}
          {!chip.icon && chip.emoji && <span className="emoji" aria-hidden="true">{chip.emoji}</span>}
          <span>
            {chip.label}
            {chip.hint && <> <span className="hint">{chip.hint}</span></>}
          </span>
        </button>
      ))}
    </div>
  );
}
