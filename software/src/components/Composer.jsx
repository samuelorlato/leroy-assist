import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { SPEED } from '../lib/config';

/*
 * Campo de mensagem + microfone (simulado) + enviar.
 * O microfone mostra "Ouvindo…" por alguns segundos, "transcreve" uma frase de
 * exemplo letra por letra e envia sozinho, como um assistente de voz.
 */
export default function Composer({ busy, inert, onSubmit, getVoiceSample, onToast }) {
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const latest = useRef({ onSubmit, getVoiceSample });

  useEffect(() => {
    latest.current = { onSubmit, getVoiceSample };
  });

  // Fim da "escuta": depois de ~2,4 s gera a transcrição.
  useEffect(() => {
    if (!listening) return undefined;
    const timer = setTimeout(() => {
      setListening(false);
      setTranscript(latest.current.getVoiceSample());
    }, 2400 * SPEED);
    return () => clearTimeout(timer);
  }, [listening]);

  // "Digita" a transcrição no campo e envia.
  useEffect(() => {
    if (transcript == null) return undefined;
    let i = 0;
    let sendTimer;
    const typer = setInterval(() => {
      i += 1;
      setValue(transcript.slice(0, i));
      if (i >= transcript.length) {
        clearInterval(typer);
        sendTimer = setTimeout(() => {
          if (latest.current.onSubmit(transcript)) setValue('');
          setTranscript(null);
        }, 550 * SPEED);
      }
    }, 32);
    return () => {
      clearInterval(typer);
      clearTimeout(sendTimer);
    };
  }, [transcript]);

  function toggleMic() {
    if (listening) {
      setListening(false);
      setTranscript(getVoiceSample());
      return;
    }
    if (busy) {
      onToast('Só um instante, estou terminando de responder…');
      return;
    }
    setValue('');
    setTranscript(null);
    setListening(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (onSubmit(value)) setValue('');
  }

  return (
    <form className={`composer${listening ? ' listening' : ''}`} onSubmit={handleSubmit} autoComplete="off" inert={inert}>
      <div className="composer-row">
        <button
          type="button"
          className="round-btn mic-btn"
          onClick={toggleMic}
          aria-pressed={listening}
          aria-label={listening ? 'Parar de ouvir' : 'Falar pelo microfone'}
        >
          <Icon name="mic" />
        </button>
        <div className="input-wrap">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={200}
            enterKeyHint="send"
            placeholder="Digite sua dúvida…"
            aria-label="Escreva sua mensagem"
            disabled={listening}
            readOnly={transcript != null}
          />
          <div className="listening-overlay" aria-hidden="true">
            <span className="bars"><i /><i /><i /><i /><i /></span>
            <span>Ouvindo… pode falar</span>
          </div>
        </div>
        <button type="submit" className="round-btn send-btn" aria-label="Enviar mensagem" disabled={busy || listening || !value.trim()}>
          <Icon name="send" />
        </button>
      </div>
      <p className="composer-hint">Toque no microfone para falar ou digite sua dúvida</p>
    </form>
  );
}
