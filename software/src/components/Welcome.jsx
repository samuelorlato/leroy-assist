import Chips from './Chips';
import Icon from './Icon';

/* Apresentação inicial do totem, com sugestões de perguntas. */
export default function Welcome({ chips, chipsActive, onChip }) {
  return (
    <section className="welcome">
      <div className="welcome-mark" aria-hidden="true"><Icon name="logo" /></div>
      <h1>Olá! Eu sou o Leroy Assist 👋</h1>
      <p>
        Me conta o que você quer fazer e eu encontro os produtos certos pra você, com <strong>estoque</strong> e{' '}
        <strong>corredor</strong> de cada item aqui na loja.
      </p>
      <ul className="features">
        <li><Icon name="chat" /><span>Fale ou digite</span></li>
        <li><Icon name="box" /><span>Estoque desta loja</span></li>
        <li><Icon name="pin" /><span>Corredor e prateleira</span></li>
      </ul>
      {chipsActive && (
        <div className="suggest">
          <p className="suggest-caption">Experimente</p>
          <Chips chips={chips} onSelect={onChip} />
        </div>
      )}
    </section>
  );
}
