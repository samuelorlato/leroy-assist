# Leroy Assist · Front-end (totem)

MVP do assistente de compras para **totem de autoatendimento** da loja física, feito em
**React + Vite**. É uma tela única de chat, 100% simulada (sem back-end e sem IA real):

1. o cliente digita (ou "fala" pelo microfone simulado) o que quer fazer;
2. o assistente mostra **"digitando…"** e faz perguntas com **chips de resposta**;
3. no fim, abre um **painel de recomendação** com o produto principal e o motivo,
   2 alternativas, selo de estoque, corredor/prateleira, complementos, roteiro na
   loja, total estimado e o botão **Chamar vendedor**.

Os produtos, estoques, corredores e complementos são **os mesmos do
`sql/create_tables.sql`** do back-end (ver `src/data/catalog.js`), então a parte do vídeo
que mostra as rotas do back bate com o que aparece no totem.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```powershell
cd software
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com recarregamento automático |
| `npm run build` | gera a versão final na pasta `dist/` |
| `npm run preview` | abre a versão gerada pelo build |

> **Dica para gravar o vídeo:** use `?speed=` para acelerar ou desacelerar as respostas.
> Ex.: `http://localhost:5173/?speed=0.6` (mais rápido) ou `?speed=1.5` (mais lento).

Para ver no formato de totem: DevTools do Chrome (F12) → modo dispositivo
(Ctrl+Shift+M) → tamanho **1080 x 1920**.

## Estrutura

```
software/
├── index.html
├── public/favicon.svg
└── src/
    ├── main.jsx                 # ponto de entrada
    ├── App.jsx                  # monta a tela (topo, chat, campo, painel, modal)
    ├── styles.css               # layout responsivo (totem 1080x1920, celular e notebook)
    ├── data/catalog.js          # catálogo/estoque/complementos (espelho do SQL)
    ├── lib/
    │   ├── assistant.js         # "cérebro": palavras-chave, perguntas e regras de recomendação
    │   ├── format.js            # moeda, quantidades e localização
    │   └── config.js            # velocidade das respostas (?speed=)
    ├── hooks/useAssistant.js    # roteiro da conversa (estado + respostas com atraso)
    └── components/
        ├── TopBar.jsx  ChatView.jsx  ChatMessage.jsx  Welcome.jsx
        ├── Chips.jsx  Composer.jsx (campo + microfone simulado)
        ├── SellerModal.jsx  Toast.jsx
        ├── Icon.jsx  ProductArt.jsx (ilustrações SVG)  StockBadge.jsx  RichText.jsx
        └── dashboard/
            ├── Dashboard.jsx  SummaryCard.jsx  MainProduct.jsx
            └── Alternatives.jsx  KitList.jsx  StoreRoute.jsx
```

A regra de negócio (`lib/assistant.js`) não depende do React. Os componentes só
desenham o que o hook `useAssistant` devolve.

## Roteiro da conversa

**Palavras que iniciam o fluxo:** tinta, pintar/pintura, parede, quarto, sala,
escritório, cômodo, demão, lavável, fosca, acetinada, selador, massa corrida.

Qualquer outra coisa cai no fallback: *"Hmm, ainda estou aprendendo sobre isso…
Quer chamar um vendedor?"*.

| Pergunta | Opções (chips) | Também entende texto livre como |
|---|---|---|
| Ambiente | Quarto · Sala · Escritório · Área externa | "dormitório", "fachada", "banheiro", "cozinha"… |
| Tamanho | Pequeno · Médio · Grande · Vários cômodos | "3x4", "3 por 3,5", "12 m²", "casa toda"… |
| Parede | Lisa · Com furos/imperfeições · Nova | "tem uns furinhos", "nunca foi pintada"… |
| Prioridade | Fácil de limpar · Menor preço · Leve brilho | "tenho criança", "o mais barato", "acetinado"… |

- Se a primeira frase já tiver as respostas, o assistente pula essas perguntas
  (ex.: *"quero pintar minha sala pequena, parede lisa, o mais barato"*).
- Área externa, banheiro e cozinha estão **fora do escopo** do catálogo (as tintas são
  só para ambiente interno), então ele sugere chamar um vendedor.
- "vendedor"/"atendente" em qualquer momento chama o vendedor; "recomeçar" reinicia.

### Regras da recomendação (simulando a LLM)

As mesmas restrições do `AssistantContextService.java`:

- **Fácil de limpar** → tinta lavável fosca; **Leve brilho** → acetinada;
  **Menor preço** → menor custo total para a área (a Econômica está sem estoque, então
  ela nunca vira a principal e aparece um aviso).
- A quantidade é calculada a partir dos atributos (`coverage_m2_per_liter`,
  `recommended_coats`, `volume_liters`) e da área de parede estimada.
- O kit de complementos depende da parede: lisa (fita, pincel, rolo, bandeja),
  com imperfeições (+ massa corrida e lixa) ou nova (+ selador). Os motivos vêm da
  `tb_complement`.

### Caminho sugerido para o vídeo

1. Tocar no microfone → ele "ouve" e envia *"Quero pintar a parede do meu quarto"*.
2. **Médio** → **Com furos ou imperfeições** → **Fácil de limpar**.
3. O painel mostra os 3 tipos de selo: *Em estoque*, *Últimas 3 unidades* (pincel) e
   *Sem estoque* (tinta econômica).
4. Desmarcar um complemento (o total e o roteiro se atualizam) e tocar em
   **Chamar vendedor**.
5. Opcional: digitar *"vocês vendem furadeira?"* para mostrar o fallback.

## Deploy na Vercel

1. Suba o código para um repositório no GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório.
3. Configure:
   - **Framework Preset:** `Vite` (a Vercel detecta sozinha)
   - **Root Directory:** `software` (se o repositório tiver o back-end junto) ou a raiz
     (se a pasta `software` for o próprio repositório)
   - Build Command `npm run build` e Output Directory `dist` já vêm preenchidos.
4. **Deploy** → copie o link para o PDF da entrega.

Pela linha de comando, de dentro da pasta `software`: `npx vercel --prod`.

> Para o .ZIP da entrega, **não inclua** as pastas `node_modules/` e `dist/`
> (elas são recriadas com `npm install` e `npm run build`).

## Como seria a integração real

Hoje o front não chama o back. Na versão final, o fluxo seria:

1. O totem envia a frase do cliente para o serviço do assistente.
2. O serviço chama `GET /assistant/context?need=...` e recebe os candidatos
   (produto + estoque + complementos) e as regras.
3. A LLM devolve a recomendação em JSON (principal, alternativas, complementos e motivos),
   no mesmo formato que `lib/assistant.js` monta hoje em `recommend()`.
4. O `useAssistant` troca a chamada `recommend()` por um `fetch` e os componentes do
   painel continuam iguais.
