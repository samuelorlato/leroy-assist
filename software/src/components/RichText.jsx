import { Fragment } from 'react';

/*
 * Renderiza os textos do assistente sem usar innerHTML:
 *   **trecho**  -> <strong>
 *   \n          -> quebra de linha
 */
export default function RichText({ text }) {
  return String(text).split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : <Fragment key={j}>{part}</Fragment>
      ))}
    </Fragment>
  ));
}
