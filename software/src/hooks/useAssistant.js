/*
 * Hook que controla a conversa simulada.
 *
 * Fluxo: mensagem do cliente -> "digitando…" -> pergunta com chips -> ...
 *        -> análise -> painel de recomendação.
 *
 * O estado que a tela desenha fica em useState (mensagens, painel, modal...).
 * O estado interno do roteiro (respostas, pergunta em aberto, sessão) fica em useRef,
 * porque as funções assíncronas precisam sempre do valor mais recente.
 */
import { useRef, useState } from 'react';
import * as A from '../lib/assistant';
import { products } from '../data/catalog';
import { SPEED } from '../lib/config';

const CANCELLED = Symbol('cancelled');

// Frases "ouvidas" pelo microfone simulado, de acordo com a pergunta em aberto.
const VOICE_SAMPLES = {
  start: 'Quero pintar a parede do meu quarto',
  room: 'Vai ser no quarto',
  size: 'É de tamanho médio',
  wall: 'Tem alguns furinhos na parede',
  priority: 'Quero uma tinta fácil de limpar',
};

const SUGGESTIONS = [
  { label: 'Quero pintar a parede do meu quarto', emoji: '🛏️', action: { type: 'send' } },
  { label: 'Qual tinta usar na sala?', emoji: '🛋️', action: { type: 'send' } },
  { label: 'Preciso de um vendedor', emoji: '🙋', action: { type: 'send' } },
];

const SELLER_CHIP = { label: 'Chamar vendedor', icon: 'headset', variant: 'primary', action: { type: 'seller' } };

export const PROCESS_STEPS = [
  'Entendendo o que você precisa',
  `Consultando o catálogo · ${products.length} produtos`,
  'Verificando estoque e localização',
  'Montando sua recomendação',
];

let seq = 0;
const nextId = () => {
  seq += 1;
  return seq;
};

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms * SPEED); });

const typingTime = (text) => Math.min(1700, Math.max(650, 380 + String(text).replace(/\*\*/g, '').length * 10));

const welcomeMessage = () => ({ id: nextId(), role: 'system', kind: 'welcome', chips: SUGGESTIONS, chipsActive: true });

const newFlow = () => ({ slots: {}, pending: null, busy: false, ticket: null });

export function useAssistant() {
  const [messages, setMessages] = useState(() => [welcomeMessage()]);
  const [busy, setBusyState] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  const session = useRef(0); // muda a cada "Nova conversa" e cancela respostas pendentes
  const flow = useRef(newFlow());

  /* ---------- Utilitários ---------- */
  function setBusy(value) {
    flow.current.busy = value;
    setBusyState(value);
  }

  function push(message) {
    const item = { id: nextId(), ...message };
    setMessages((list) => [...list, item]);
    return item.id;
  }

  function patch(id, changes) {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }

  function remove(id) {
    setMessages((list) => list.filter((m) => m.id !== id));
  }

  // Esconde os chips já respondidos (os "persistentes" só quando começa um fluxo novo).
  function retireChips(includePersistent = false) {
    setMessages((list) => list.map((m) => (
      m.chipsActive && (includePersistent || !m.persistent) ? { ...m, chipsActive: false } : m
    )));
  }

  async function pause(ms) {
    const current = session.current;
    await sleep(ms);
    if (current !== session.current) throw CANCELLED;
  }

  // Mostra "digitando…" e depois a mensagem do assistente.
  async function say(text, options = {}) {
    const { chips, persistent = false, delay, ...extra } = options;
    const typingId = push({ role: 'bot', kind: 'typing' });
    try {
      await pause(delay ?? typingTime(text));
    } finally {
      remove(typingId);
    }
    return push({ role: 'bot', kind: 'text', text, chips, chipsActive: !!chips, persistent, ...extra });
  }

  async function run(task) {
    const current = session.current;
    setBusy(true);
    try {
      await task();
    } catch (err) {
      if (err !== CANCELLED) console.error(err);
    } finally {
      if (current === session.current) setBusy(false);
    }
  }

  function questionChips(key) {
    return A.QUESTIONS[key].options(flow.current.slots).map((option) => ({
      ...option,
      action: { type: 'answer', key, value: option.value },
    }));
  }

  /* ---------- Roteiro da conversa ---------- */
  async function route(text) {
    const t = A.normalize(text);
    const f = flow.current;

    if (A.RX.reset.test(t)) return reset();
    if (A.RX.seller.test(t)) return callSeller('chat');

    if (f.pending) {
      const value = A.parse[f.pending](t, false);
      if (value) {
        // Aproveita outras informações que vieram na mesma frase.
        Object.entries(A.extract(t)).forEach(([k, v]) => {
          if (k !== f.pending && !f.slots[k]) f.slots[k] = v;
        });
        return answer(f.pending, value);
      }
      return say('Hmm, não entendi muito bem 😅 Toque em uma das opções abaixo ou escreva de outro jeito.', {
        chips: questionChips(f.pending),
      });
    }

    if (A.RX.trigger.test(t)) return startFlow(t);
    if (A.RX.thanks.test(t)) return say('Por nada! 😊 Se precisar de mais alguma coisa, é só me chamar.');
    if (A.RX.greeting.test(t)) {
      return say('Oi! 👋 Me conta o que você quer fazer. Por exemplo: **“quero pintar a parede do meu quarto”**.', {
        chips: SUGGESTIONS,
      });
    }
    return fallback();
  }

  async function startFlow(t) {
    retireChips(true);
    flow.current.slots = A.extract(t);
    flow.current.pending = null;

    const { room } = flow.current.slots;
    if (room && !A.isSupportedRoom(room)) return unsupported(room);

    await say('Boa! Vou te ajudar a escolher a tinta certa e tudo o que você precisa pra pintar. 🎨 São só algumas perguntas rápidas.');
    return askNext(A.describeDetected(flow.current.slots));
  }

  async function askNext(prefix = '') {
    const next = A.nextQuestion(flow.current.slots);
    if (!next) return finish(prefix);
    flow.current.pending = next;
    const question = A.QUESTIONS[next].prompt(flow.current.slots);
    return say(`${prefix ? `${prefix} ` : ''}${question}`, { chips: questionChips(next) });
  }

  async function answer(key, value) {
    flow.current.slots[key] = value;
    flow.current.pending = null;
    if (key === 'room' && !A.isSupportedRoom(value)) return unsupported(value);
    return askNext(A.ack(key, value));
  }

  async function unsupported(room) {
    delete flow.current.slots.room;
    flow.current.pending = 'room';
    return say(A.unsupportedText(room), {
      chips: [SELLER_CHIP, { label: 'Escolher outro ambiente', emoji: '↩️', action: { type: 'reask' } }],
    });
  }

  async function fallback() {
    return say('Hmm, ainda estou aprendendo sobre isso 🤔 Por enquanto eu ajudo com **pintura de paredes internas**: tintas, preparação e ferramentas.\nQuer chamar um vendedor?', {
      chips: [SELLER_CHIP, { label: 'Quero pintar uma parede', emoji: '🎨', action: { type: 'send' } }],
    });
  }

  async function processing() {
    await pause(250);
    const id = push({ role: 'bot', kind: 'processing', current: 0, done: false });
    for (let i = 0; i < PROCESS_STEPS.length; i += 1) {
      patch(id, { current: i });
      await pause(650);
    }
    patch(id, { current: PROCESS_STEPS.length, done: true });
  }

  async function finish(prefix = '') {
    flow.current.pending = null;
    await say(`${prefix ? `${prefix} ` : ''}Perfeito, já tenho tudo o que preciso! Vou consultar o catálogo e o estoque desta loja…`);
    await processing();

    const rec = A.recommend(flow.current.slots);
    setRecommendation(rec);

    await say('Prontinho! Esta é a melhor opção pra você.', {
      kind: 'result',
      product: rec.main.product,
      count: rec.complements.length,
      persistent: true,
      chips: [{ label: 'Ver recomendação completa', icon: 'arrowRight', variant: 'primary', action: { type: 'openDashboard' } }],
    });
    await pause(900);
    setDashboardOpen(true);
  }

  /* ---------- Vendedor ---------- */
  function ensureTicket() {
    if (!flow.current.ticket) {
      flow.current.ticket = `P-${String(Math.floor(Math.random() * 90) + 10).padStart(3, '0')}`;
      setTicket(flow.current.ticket);
    }
    return flow.current.ticket;
  }

  async function callSeller(origin) {
    const already = !!flow.current.ticket;
    const code = ensureTicket();
    const text = already
      ? `O vendedor já está a caminho 🙋 Seu atendimento: **${code}**.`
      : `Pronto! Chamei um vendedor da seção de Pintura 🙋 Ele já vem até este totem. Seu atendimento: **${code}**.`;

    if (origin === 'chat') {
      await say(text);
      setSellerOpen(true);
      const { pending } = flow.current;
      if (pending) {
        await say(`Enquanto ele não chega, podemos continuar. ${A.QUESTIONS[pending].prompt(flow.current.slots)}`, {
          chips: questionChips(pending),
        });
      }
      return;
    }

    // Botão do topo ou do painel: abre o modal na hora e registra no chat.
    setSellerOpen(true);
    if (!flow.current.busy) push({ role: 'bot', kind: 'text', text });
  }

  /* ---------- API usada pelos componentes ---------- */
  function submit(raw) {
    const text = String(raw || '').trim();
    if (!text || flow.current.busy) return false;
    retireChips();
    push({ role: 'user', kind: 'text', text });
    run(() => route(text));
    return true;
  }

  function selectChip(chip) {
    const { action } = chip;
    if (action.type === 'openDashboard') {
      setDashboardOpen(true);
      return;
    }
    if (flow.current.busy) return;
    if (action.type === 'send') {
      submit(chip.label);
      return;
    }
    retireChips();
    push({ role: 'user', kind: 'text', text: chip.hint ? `${chip.label} (${chip.hint})` : chip.label });
    if (action.type === 'answer') run(() => answer(action.key, action.value));
    else if (action.type === 'seller') run(() => callSeller('chat'));
    else if (action.type === 'reask') run(() => askNext());
  }

  function reset() {
    session.current += 1;
    flow.current = newFlow();
    setBusyState(false);
    setMessages([welcomeMessage()]);
    setRecommendation(null);
    setDashboardOpen(false);
    setSellerOpen(false);
    setTicket(null);
    setSessionKey((k) => k + 1);
  }

  return {
    messages,
    busy,
    recommendation,
    dashboardOpen,
    sellerOpen,
    ticket,
    sessionKey,
    submit,
    selectChip,
    reset,
    requestSeller: (origin) => { callSeller(origin); },
    openDashboard: () => setDashboardOpen(true),
    closeDashboard: () => setDashboardOpen(false),
    closeSeller: () => setSellerOpen(false),
    voiceSample: () => VOICE_SAMPLES[flow.current.pending] || VOICE_SAMPLES.start,
  };
}
