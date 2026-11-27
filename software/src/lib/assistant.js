/*
 * "Cérebro" simulado do assistente (sem React, só regras).
 *
 * No produto real, essa parte seria a LLM: ela recebe o contexto de
 * GET /assistant/context (candidatos + estoque + regras) e devolve a recomendação.
 * Aqui tudo é regra fixa, seguindo as mesmas restrições definidas em
 * AssistantContextService.java:
 *   - recomendar só produtos do catálogo;
 *   - nunca indicar como principal um produto OUT_OF_STOCK;
 *   - justificar com os atributos do produto;
 *   - 1 principal + até 2 alternativas + complementos;
 *   - fora do escopo => sugerir chamar um vendedor.
 *
 * Os textos usam **negrito** (renderizado pelo componente <RichText>).
 */
import { products, getProduct, complementReason } from '../data/catalog';
import { brl, num, qty } from './format';

/* ---------- Texto ---------- */
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // remove acentos (e "m²" vira "m2")
    .replace(/[^a-z0-9.,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const toNumber = (s) => parseFloat(String(s).replace(',', '.'));

// Palavras que disparam o fluxo de pintura e outras intenções.
export const RX = {
  trigger: /\b(tintas?|pint\w*|repint\w*|paredes?|quartos?|salas?|escritorios?|comodos?|dormitorios?|demaos?|lavave(l|is)|acetinad\w*|foscas?|seladora?|massa corrida)\b/,
  seller: /\b(vendedor(a|es)?|atendente|atendimento|funcionario|humano|falar com (alguem|uma pessoa))\b/,
  reset: /\b(recomecar|reiniciar|comecar de novo|nova (conversa|consulta)|do zero)\b/,
  greeting: /^(oi+|ola|opa|eai|e ai|hey|bom dia|boa tarde|boa noite|tudo bem)\b/,
  thanks: /\b(obrigad[oa]|valeu|brigad[oa])\b/,
};

/* ---------- Vocabulário ---------- */
const ROOMS = {
  quarto: { label: 'Quarto', emoji: '🛏️', g: 'm', of: 'do quarto', your: 'o seu quarto', ack: 'Quarto, ótimo!' },
  sala: { label: 'Sala', emoji: '🛋️', g: 'f', of: 'da sala', your: 'a sua sala', ack: 'Sala, boa escolha!' },
  escritorio: { label: 'Escritório', emoji: '💻', g: 'm', of: 'do escritório', your: 'o seu escritório', ack: 'Escritório, beleza!' },
  externa: { label: 'Área externa', emoji: '🏡', unsupported: 'Para **área externa** a tinta precisa aguentar sol e chuva, e as que eu conheço até agora são só para ambientes internos.' },
  banheiro: { label: 'Banheiro', emoji: '🚿', unsupported: 'Para **banheiro** o ideal é uma tinta própria para umidade, e eu ainda não conheço essa linha.' },
  cozinha: { label: 'Cozinha', emoji: '🍳', unsupported: 'Para **cozinha** o ideal é uma tinta própria para umidade e gordura, e eu ainda não conheço essa linha.' },
};

// Área aproximada de parede (m²) por tamanho de cômodo: perímetro x 2,6 m de pé-direito, descontando portas e janelas.
const AREA_BY_SIZE = { P: 25, M: 33, G: 42, V: 90 };

const SIZES = {
  P: { label: 'Pequeno', hint: 'até 9 m²', adj: { m: 'pequeno', f: 'pequena' } },
  M: { label: 'Médio', hint: '10 a 15 m²', adj: { m: 'médio', f: 'média' } },
  G: { label: 'Grande', hint: 'mais de 15 m²', adj: { m: 'grande', f: 'grande' } },
  V: { label: 'Vários cômodos', hint: 'casa ou apê' },
};

const WALLS = {
  lisa: { label: 'Lisa, só trocar a cor', emoji: '👍', short: 'Parede lisa', phrase: 'com parede lisa', ack: 'Ótimo, isso facilita o trabalho!' },
  imperfeicoes: { label: 'Com furos ou imperfeições', emoji: '🔨', short: 'Parede com imperfeições', phrase: 'com furos na parede', ack: 'Anotado! Vou incluir o que precisa pra corrigir antes de pintar.' },
  nova: { label: 'Nova, nunca pintada', emoji: '🧱', short: 'Parede nova', phrase: 'com parede nova', ack: 'Parede nova pede selador antes da tinta, vou incluir.' },
};

const PRIORITIES = {
  lavavel: { label: 'Fácil de limpar', emoji: '🧽', short: 'fácil de limpar', phrase: 'facilidade de limpeza' },
  economia: { label: 'Menor preço', emoji: '💰', short: 'menor preço', phrase: 'o menor custo' },
  brilho: { label: 'Leve brilho', emoji: '✨', short: 'leve brilho', phrase: 'um acabamento com leve brilho' },
};

/* ---------- Interpretação das respostas (texto livre) ---------- */
function sizeFromArea(m2) {
  if (m2 <= 9) return 'P';
  return m2 <= 15 ? 'M' : 'G';
}

export const parse = {
  room(t) {
    if (/\b(quartos?|dormitorios?|suites?)\b/.test(t)) return 'quarto';
    if (/\b(salas?|living)\b/.test(t)) return 'sala';
    if (/\b(escritorios?|home ?office|estudo)\b/.test(t)) return 'escritorio';
    if (/\b(extern[ao]s?|fachadas?|muros?|varandas?|quintal|garagem|lado de fora)\b/.test(t)) return 'externa';
    if (/\b(banheiros?|lavabos?)\b/.test(t)) return 'banheiro';
    if (/\b(cozinhas?|lavanderias?|area de servico)\b/.test(t)) return 'cozinha';
    return null;
  },
  size(t) {
    if (/\b(varios|varias|todos os|todas as|casa (toda|inteira)|apartamento (todo|inteiro)|ape (todo|inteiro))\b/.test(t)) return 'V';
    const dims = t.match(/(\d+(?:[.,]\d+)?)\s*(?:x|por)\s*(\d+(?:[.,]\d+)?)/);
    if (dims) return sizeFromArea(toNumber(dims[1]) * toNumber(dims[2]));
    const m2 = t.match(/(\d+(?:[.,]\d+)?)\s*(?:m2|m|metros?)\b/);
    if (m2) return sizeFromArea(toNumber(m2[1]));
    if (/\b(pequen[oa]s?|pequenininh[oa]|apertad[oa])\b/.test(t)) return 'P';
    if (/\b(medi[oa]s?|normal|padrao)\b/.test(t)) return 'M';
    if (/\b(grandes?|enorme|ampl[oa]|espacos[oa])\b/.test(t)) return 'G';
    return null;
  },
  // strict = true na primeira mensagem, para evitar falsos positivos ("nova cor" não é "parede nova")
  wall(t, strict) {
    if (/\b(furos?|furinhos?|buracos?|imperfeic\w*|rachad\w*|rachaduras?|trincas?|trincad\w*|descasca\w*|irregular\w*|estragad\w*|danificad\w*)\b/.test(t)) return 'imperfeicoes';
    if (/\b(nunca (foi )?pintad[oa]|parede nova|reboco|sem pintura|construcao)\b/.test(t)) return 'nova';
    if (!strict && /\b(nova|novo|nunca)\b/.test(t)) return 'nova';
    if (/\b(lisas?|bom estado|perfeita|so (trocar|mudar) a cor)\b/.test(t)) return 'lisa';
    if (!strict && /\b(boa|tranquila|normal|inteira|ok)\b/.test(t)) return 'lisa';
    return null;
  },
  priority(t) {
    const tt = t.replace(/\bsem brilho\b/g, ' ');
    if (/\b(limp\w*|lavave(l|is)|lavar|manchas?|criancas?|filhos?|pets?|cachorros?|gatos?)\b/.test(tt)) return 'lavavel';
    if (/\b(barat\w*|preco|econom\w*|gastar (menos|pouco)|em conta|custo|orcamento)\b/.test(tt)) return 'economia';
    if (/\b(brilho\w*|brilhante|acetinad\w*)\b/.test(tt)) return 'brilho';
    return null;
  },
};

// Extrai o que já dá pra saber da primeira frase do cliente.
export function extract(t) {
  const found = {
    room: parse.room(t),
    size: parse.size(t),
    wall: parse.wall(t, true),
    priority: parse.priority(t),
  };
  return Object.fromEntries(Object.entries(found).filter(([, v]) => v));
}

/* ---------- Roteiro de perguntas ---------- */
const ORDER = ['room', 'size', 'wall', 'priority'];

export const QUESTIONS = {
  room: {
    prompt: () => 'Qual ambiente você vai pintar?',
    options: () => ['quarto', 'sala', 'escritorio', 'externa'].map((k) => ({ value: k, label: ROOMS[k].label, emoji: ROOMS[k].emoji })),
  },
  size: {
    prompt: (s) => (s.room ? `Qual o tamanho ${ROOMS[s.room].of}?` : 'Qual o tamanho do ambiente?'),
    options: () => Object.keys(SIZES).map((k) => ({ value: k, label: SIZES[k].label, hint: SIZES[k].hint })),
  },
  wall: {
    prompt: () => 'Como está a parede hoje?',
    options: () => Object.keys(WALLS).map((k) => ({ value: k, label: WALLS[k].label, emoji: WALLS[k].emoji })),
  },
  priority: {
    prompt: () => 'Pra fechar: o que é mais importante pra você?',
    options: () => Object.keys(PRIORITIES).map((k) => ({ value: k, label: PRIORITIES[k].label, emoji: PRIORITIES[k].emoji })),
  },
};

export function nextQuestion(slots) {
  return ORDER.find((k) => !slots[k]) || null;
}

export function isSupportedRoom(room) {
  return !!ROOMS[room] && !ROOMS[room].unsupported;
}

export function unsupportedText(room) {
  return `${ROOMS[room].unsupported} Um vendedor pode te indicar a opção certa. Quer chamar um?`;
}

export function ack(key, value) {
  if (key === 'room') return ROOMS[value].ack;
  if (key === 'size') {
    return value === 'V'
      ? `Beleza, vou considerar uns **${AREA_BY_SIZE.V} m² de parede**.`
      : `Certo, isso dá uns **${AREA_BY_SIZE[value]} m² de parede**.`;
  }
  if (key === 'wall') return WALLS[value].ack;
  return '';
}

export function describeDetected(slots) {
  const parts = [];
  if (slots.room) parts.push(ROOMS[slots.room].label.toLowerCase());
  if (slots.size) parts.push(SIZES[slots.size].label.toLowerCase());
  if (slots.wall) parts.push(WALLS[slots.wall].short.toLowerCase());
  if (slots.priority) parts.push(PRIORITIES[slots.priority].short);
  return parts.length ? `Já anotei: ${parts.map((p) => `**${p}**`).join(' · ')}.` : '';
}

/* ---------- Recomendação ---------- */
// Quanto de tinta é preciso e quantas embalagens levar, a partir dos atributos do produto.
function paintPlan(product, area) {
  const a = product.attributes;
  const liters = (area * a.recommended_coats) / a.coverage_m2_per_liter;
  const amount = Math.max(1, Math.ceil(liters / a.volume_liters - 1e-9));
  const coverage = Math.floor((amount * a.volume_liters * a.coverage_m2_per_liter) / a.recommended_coats);
  return { liters, qty: amount, total: Math.round(amount * product.price * 100) / 100, coverage };
}

const KIT_BY_WALL = {
  lisa: [9, 8, 7, 10],
  imperfeicoes: [5, 6, 9, 8, 7, 10],
  nova: [4, 9, 8, 7, 10],
};

function complementQty(product, area) {
  const a = product.attributes;
  if (a.coverage_m2_per_liter) return paintPlan(product, area).qty; // selador
  if (a.grit) return Math.max(2, Math.ceil(area / 10)); // ~1 folha de lixa a cada 10 m²
  if (a.weight_kg || a.length_m) return area > 50 ? 2 : 1; // massa corrida e fita crepe
  return 1;
}

function mainReasons(product, plan, slots, area) {
  const a = product.attributes;
  const reasons = [];
  if (slots.priority === 'economia') {
    reasons.push({ title: 'Menor custo para a sua parede', text: `${brl(plan.total)} para pintar ~${area} m², a opção mais em conta com estoque.` });
  }
  if (a.finish === 'satin') {
    reasons.push({ title: 'Leve brilho', text: 'Acabamento acetinado, resistente a manchas. Ideal para quartos e salas.' });
  }
  if (a.washable) {
    reasons.push({ title: 'Lavável', text: 'Manchas e marcas de mão saem com um pano úmido.' });
  }
  if (a.finish === 'matte') {
    reasons.push({
      title: 'Acabamento fosco',
      text: slots.wall === 'imperfeicoes'
        ? 'Sem brilho, ajuda a disfarçar pequenas imperfeições da parede.'
        : 'Sem brilho, deixa a parede com visual uniforme.',
    });
  }
  const leftover = plan.coverage >= area * 1.8 ? ' (sobra para retoques)' : '';
  reasons.push({
    title: 'Quantidade certa',
    text: `Rende ${a.coverage_m2_per_liter} m²/L em ${a.recommended_coats} demãos. Para ~${area} m² você precisa de ~${num(plan.liters)} L: ${qty(product, plan.qty)}${leftover}.`,
  });
  return reasons;
}

function alternativeNote(product, plan, area) {
  const a = product.attributes;
  const verb = plan.qty > 1 ? 'cobrem' : 'cobre';
  const amount = qty(product, plan.qty);
  if (!a.washable) {
    return `Preço menor, mas não é lavável e pede ${a.recommended_coats} demãos.`;
  }
  if (a.finish === 'satin') {
    return `Lavável, com leve brilho. ${amount} ${verb} seus ~${area} m² por ${brl(plan.total)}.`;
  }
  if (plan.coverage >= area * 1.8) {
    return `Fosca e lavável, rende mais: ${amount} ${verb} até ${plan.coverage} m². Compensa se for pintar mais de um ambiente.`;
  }
  return `Fosca e lavável. ${amount} ${verb} seus ~${area} m² por ${brl(plan.total)}.`;
}

let recommendationSeq = 0;

export function recommend(slots) {
  const area = AREA_BY_SIZE[slots.size];
  const paints = products.filter((p) => p.categoryId === 1);
  const plans = Object.fromEntries(paints.map((p) => [p.id, paintPlan(p, area)]));

  // Regra: nunca recomendar como principal um produto sem estoque.
  const available = paints.filter((p) => p.stock.status !== 'OUT_OF_STOCK');
  let main;
  if (slots.priority === 'economia') {
    main = available.slice().sort((x, y) => plans[x.id].total - plans[y.id].total)[0];
  } else if (slots.priority === 'brilho') {
    main = available.find((p) => p.attributes.finish === 'satin');
  } else {
    main = available.find((p) => p.attributes.washable && p.attributes.finish === 'matte');
  }
  main = main || available.find((p) => p.attributes.washable) || available[0];

  const isOut = (p) => (p.stock.status === 'OUT_OF_STOCK' ? 1 : 0);
  const alternatives = paints
    .filter((p) => p.id !== main.id)
    .sort((x, y) => isOut(x) - isOut(y) || plans[x.id].total - plans[y.id].total)
    .slice(0, 2)
    .map((p) => ({ product: p, plan: plans[p.id], note: alternativeNote(p, plans[p.id], area) }));

  const complements = KIT_BY_WALL[slots.wall].map((id) => {
    const p = getProduct(id);
    const amount = complementQty(p, area);
    return { product: p, qty: amount, total: Math.round(amount * p.price * 100) / 100, reason: complementReason(main.id, id) };
  });

  let notice = '';
  const cheaperMissing = paints.find((p) => p.stock.status === 'OUT_OF_STOCK' && plans[p.id].total < plans[main.id].total);
  if (slots.priority === 'economia' && cheaperMissing) {
    notice = `A ${cheaperMissing.shortName} (${brl(cheaperMissing.price)}) está sem estoque nesta loja, então considerei só as opções disponíveis.`;
  }

  const room = ROOMS[slots.room];
  const who = slots.size === 'V' ? 'vários cômodos' : `${room.your} ${SIZES[slots.size].adj[room.g]}`;
  const job = slots.wall === 'lisa' ? 'fazer a pintura' : 'preparar a parede e pintar';
  const summary = `Para ${who} ${WALLS[slots.wall].phrase}, priorizando ${PRIORITIES[slots.priority].phrase}, a melhor escolha é a **${main.shortName}**. Também separei ${complements.length} itens para ${job}, com a localização de cada um na loja.`;

  const tags = [
    room.label,
    slots.size === 'V' ? `Vários cômodos · ~${area} m²` : `${SIZES[slots.size].label} · ~${area} m² de parede`,
    WALLS[slots.wall].short,
    `Prioridade: ${PRIORITIES[slots.priority].short}`,
  ];

  recommendationSeq += 1;
  return {
    id: recommendationSeq,
    slots: { ...slots },
    area,
    main: { product: main, plan: plans[main.id], reasons: mainReasons(main, plans[main.id], slots, area) },
    alternatives,
    complements,
    notice,
    summary,
    tags,
  };
}
