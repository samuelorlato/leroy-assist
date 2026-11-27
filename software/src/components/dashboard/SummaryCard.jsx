import Icon from '../Icon';
import RichText from '../RichText';

/* Resumo do que o assistente entendeu e da recomendação. */
export default function SummaryCard({ rec, style }) {
  return (
    <section className="summary reveal" style={style}>
      <span className="eyebrow"><Icon name="sparkle" /> Análise do Leroy Assist</span>
      <h3>Sua recomendação está pronta</h3>
      <p><RichText text={rec.summary} /></p>
      <div className="tags">
        {rec.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </section>
  );
}
