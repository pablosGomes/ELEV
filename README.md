# ELEV

Plataforma gratuita que ajuda jovens a entrar no mercado de trabalho, reunindo
cursos gratuitos, orientação vocacional, criação de currículo, vagas de Jovem
Aprendiz e conteúdo de preparação profissional em um único lugar.

Construído com **React + Vite + Tailwind CSS**, publicado na **Vercel**.

---

## Funcionalidades

Cada funcionalidade tem a sua própria aba, como previsto na documentação do projeto.

| Aba                     | Rota                | O que faz                                                                                                       |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Página Inicial**      | `/`                 | Apresenta o projeto, os objetivos e dá acesso rápido a todas as funcionalidades.                                |
| **Cursos Gratuitos**    | `/cursos`           | 26 cursos de instituições reais (SENAI, Sebrae, Fundação Bradesco, FGV, Google, UNA-SUS…), com busca e filtros. |
| **Teste Vocacional**    | `/teste-vocacional` | 18 afirmações em escala Likert; devolve as áreas com maior afinidade, carreiras sugeridas e cursos da área.     |
| **Criar Currículo**     | `/curriculo`        | Formulário com prévia em tempo real e download do currículo pronto em PDF.                                      |
| **Vagas**               | `/vagas`            | Vagas de Jovem Aprendiz com requisitos, benefícios, forma de candidatura e portais oficiais.                    |
| **Dicas e Vídeo-Aulas** | `/dicas`            | Guias sobre currículo, erros comuns, entrevista e primeiro emprego, mais vídeo-aulas e checklist de preparação. |

Detalhes que valem destacar:

- **Nada exige cadastro.** Currículo, teste vocacional e checklist ficam salvos
  no `localStorage` do próprio navegador do usuário — nenhum dado sai do
  aparelho.
- **As áreas profissionais são um vocabulário compartilhado.** Terminar o teste
  vocacional leva direto aos cursos e às vagas daquela área
  (`/cursos?area=tecnologia`).
- **Layout adaptado** para celular, tablet e computador, com atalho de teclado,
  foco visível, rótulos ARIA e respeito a `prefers-reduced-motion`.

---

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
```

```bash
npm run dev
```

O site sobe em `http://localhost:5173`.

> As rotas `/api/*` são Serverless Functions da Vercel e **não** são executadas
> pelo `npm run dev`. Isso não quebra nada: a camada de dados detecta a ausência
> e cai automaticamente para os dados locais. Para testar as funções de verdade,
> use `npx vercel dev`.

Outros comandos:

```bash
npm run build
```

```bash
npm run vagas
```

```bash
npm run format
```

`npm run vagas` regenera `src/data/vagas-geradas.js` (é o mesmo passo que o
`build` roda sozinho, via `prebuild`).

---

## Publicando na Vercel

1. Suba o repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe
   o repositório `ELEV`.
3. A Vercel detecta o Vite sozinho. As configurações já estão fixadas em
   `vercel.json` (build `npm run build`, saída `dist`, e o rewrite de SPA que
   faz `/cursos`, `/vagas` etc. funcionarem ao recarregar a página).
4. Clique em **Deploy**.

Não há nenhuma variável de ambiente obrigatória — o site publica e funciona
inteiro sem configurar nada.

---

## Vagas reais e inteligência artificial (opcional)

O site nasce com vagas de exemplo, avisando o usuário e apontando para os
portais oficiais. Duas chaves opcionais melhoram isso, e cada uma funciona sem
a outra.

### `JOOBLE_API_KEY` — vagas reais

Chave gratuita em <https://br.jooble.org/api/about>. Com ela, o build passa a
buscar vagas reais de Jovem Aprendiz em vez dos exemplos.

### `ANTHROPIC_API_KEY` — organização e recomendação

Chave em <https://console.anthropic.com/settings/keys>. Habilita duas coisas:

**1. Organizar os anúncios (roda no build).** A API de vagas devolve o anúncio
como um parágrafo de texto corrido — sem requisitos separados, sem benefícios,
sem faixa etária. O Claude lê esse texto e preenche esses campos, classifica a
área pelo conteúdo do trabalho (e não por palavra-chave no título) e descarta o
que voltou na busca mas não é aprendizagem — estágio, trainee, CLT júnior.

**2. Recomendar por perfil (roda sob demanda).** A seção _"Quais dessas vagas
combinam com você?"_ cruza o resultado do teste vocacional com o currículo do
usuário e devolve as vagas mais compatíveis, com o motivo de cada uma e o que
vale preparar antes de se candidatar.

Modelo usado: **Claude Sonnet 5**, configurado em [`api/_ia.js`](api/_ia.js).

### Por que o enriquecimento roda no build

```
npm run build  →  prebuild  →  scripts/gerar-vagas.mjs  →  vite build
                                       │
                                       ├── busca no Jooble
                                       ├── organiza com o Claude
                                       └── grava src/data/vagas-geradas.js
```

O custo fica por deploy, não por visitante; a página abre instantânea, sem
esperar o modelo; e a chave da Anthropic nunca chega perto do navegador. Para
atualizar as vagas, basta um novo deploy — na Vercel dá para agendar um
redeploy diário em **Settings > Git > Deploy Hooks**.

Só a recomendação personalizada roda em tempo real, porque depende do perfil de
cada usuário.

### O que a IA não faz

Um modelo de linguagem **não descobre vagas** — ele não tem índice de ofertas em
tempo real. Se pedíssemos "liste vagas de Jovem Aprendiz hoje", ele inventaria,
e o resultado seria pior do que não ter dado nenhum, porque pareceria
verdadeiro. Por isso a origem continua sendo uma API real de vagas; o Claude só
organiza e recomenda o que já existe. Os dois prompts em `api/_ia.js` são
explícitos: extrair, nunca inventar — campo que não está no anúncio fica vazio.

### Degradação por etapas

| Chaves configuradas    | O que acontece                                                            |
| ---------------------- | ------------------------------------------------------------------------- |
| Nenhuma                | Vagas de exemplo, com aviso. Recomendação desligada, com explicação.      |
| Só `JOOBLE_API_KEY`    | Vagas reais, com área classificada por palavra-chave e requisitos vazios. |
| Só `ANTHROPIC_API_KEY` | Vagas de exemplo, mas a recomendação personalizada funciona sobre elas.   |
| As duas                | Vagas reais e organizadas + recomendação personalizada.                   |

O script de build **nunca derruba o deploy**: se uma chave faltar, a API cair ou
a resposta vier inesperada, ele grava um arquivo vazio e o site volta para os
exemplos.

### Privacidade da recomendação

O currículo é dado pessoal, então:

- ele só sai do navegador quando o usuário clica no botão;
- nome, e-mail, telefone e LinkedIn **não** são enviados — não ajudam a
  recomendar uma vaga (o corte é aplicado no cliente **e** de novo no servidor,
  como allowlist, em [`api/combinar.js`](api/combinar.js));
- nada é armazenado nem registrado em log: os dados são usados na chamada ao
  modelo e descartados;
- a interface explica tudo isso **antes** do clique, não depois.

---

## Estrutura

```
elev/
├── api/                      Serverless Functions da Vercel
│   ├── _fonte-vagas.js       Busca no Jooble e normalização (sem IA)
│   ├── _ia.js                Prompts, schemas e chamadas ao Claude
│   ├── combinar.js           POST /api/combinar — recomendação por perfil
│   ├── cursos.js             GET  /api/cursos   — catálogo, com filtros
│   └── vagas.js              GET  /api/vagas    — serve o que o build gerou
├── scripts/
│   └── gerar-vagas.mjs       Roda no prebuild: busca + organiza as vagas
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── curriculo/        Formulário, campos e prévia A4 do currículo
│   │   ├── CabecalhoPagina   Cabeçalho vinho padrão das abas internas
│   │   ├── EscalaAjustavel   Encaixa a prévia A4 na largura disponível
│   │   ├── Layout            Navbar + Outlet + Footer
│   │   ├── Logo              Marca em SVG (símbolo + wordmark)
│   │   ├── Modal             Janela modal acessível
│   │   ├── RecomendacoesIa   Seção "vagas que combinam com você"
│   │   ├── Revelar           Animação de entrada ao rolar a página
│   │   └── ui.jsx            Botão, Chip, Aviso, Progresso, estados de lista
│   ├── data/
│   │   ├── vagas-geradas.js  GERADO no build — não edite à mão
│   │   └── ...               Cursos, vagas de exemplo, perguntas, guias
│   ├── hooks/                useRecurso, useArmazenamentoLocal
│   ├── lib/                  texto.js, icones.js, pdf.js, perfil.js
│   ├── pages/                Uma página por aba
│   ├── services/api.js       Única porta de entrada de dados do front
│   ├── App.jsx               Rotas
│   └── index.css             Design tokens do Tailwind + estilos base
├── vercel.json
└── vite.config.js
```

> `src/data/vagas-geradas.js` é regravado a cada build. Ele fica versionado de
> propósito, para que um `npm run dev` recém-clonado funcione sem precisar rodar
> o gerador antes.

---

## Identidade visual

Segue as cores da logo do projeto, definidas como design tokens em
`src/index.css`:

| Uso                                    | Token                     | Cor       |
| -------------------------------------- | ------------------------- | --------- |
| Cor principal (botões, links, títulos) | `elev-700`                | `#9b1b30` |
| Vinho escuro (cabeçalhos, rodapé, PDF) | `elev-900`                | `#58101c` |
| Destaques e estados de hover           | `elev-600` / `elev-50`    | `#c62839` |
| Cores secundárias                      | branco e escala `areia-*` | cinzas    |

Tipografia: **Poppins** nos títulos e **Inter** no texto corrido — ambas de
`fonts.googleapis.com`.

Para trocar pela logo oficial, substitua o `<svg>` dentro de
`src/components/Logo.jsx` e o arquivo `public/favicon.svg`.

---

## Notas técnicas

**Como o PDF é gerado.** A prévia é rasterizada com `html2canvas-pro` e
encaixada em páginas A4 pelo `jsPDF`, de forma que o PDF sai idêntico ao que
aparece na tela. A prévia usada na captura fica montada fora da área visível em
tamanho real (794px = A4 a 96dpi), o que faz o download funcionar também no
celular, onde a prévia pode estar atrás de uma aba. Usamos `html2canvas-pro`
porque o Tailwind v4 gera cores no espaço `oklch`, que o `html2canvas` original
não interpreta.

**Peso da página.** As rotas são carregadas sob demanda e o `jsPDF` +
`html2canvas-pro` (cerca de 350 kB juntos) só são baixados por quem clica em
"Baixar em PDF". Os ícones passam por um registro em `src/lib/icones.js` em vez
de um `import * as`, que traria a biblioteca inteira para dentro do pacote.

**Vagas de exemplo.** Os dados de fallback em `src/data/vagas.js` são perfis
representativos de programas de aprendizagem, não anúncios ativos. Eles são
marcados com `exemplo: true` e a interface avisa o usuário, sempre apontando
para os portais oficiais de candidatura.

**Vídeo-aulas.** Cada item em `src/data/dicas.js` aceita um `youtubeId`.
Enquanto ele for `null`, o card abre uma busca no YouTube pelo tema — um link
que nunca quebra. Preenchendo o `youtubeId`, o vídeo passa a ser exibido
embutido na página.

---

## Licença

MIT. Projeto acadêmico, sem fins lucrativos.
