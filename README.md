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
npm run format
```

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

## Recomendação personalizada de vagas (opcional)

A aba **Vagas** tem uma seção que cruza o resultado do teste vocacional com o
currículo do usuário e devolve as vagas mais compatíveis, com o motivo de cada
indicação e o que vale preparar antes de se candidatar.

É o único recurso do site que usa inteligência artificial, e o único que
precisa de uma chave. Sem ela, a seção aparece explicando que está desligada —
todo o resto do site funciona normalmente.

### Como ligar

1. Pegue uma chave gratuita (sem cartão) em <https://console.mistral.ai>.
2. Na Vercel: **Settings > Environment Variables**, adicione `MISTRAL_API_KEY`.
3. Faça um novo deploy.

Provedor: **Mistral**, modelo `mistral-small-4-0-26-03`, configurado em
[`api/_mistral.js`](api/_mistral.js). A Mistral publica IDs datados e aposenta
os antigos sem alias `-latest`, então o modelo também é sobrescrevível pela
variável `MISTRAL_MODEL` — se o ID sair do ar, dá para trocar sem commit.

O free tier tem limite de requisições por minuto. A rota trata o HTTP 429 e
devolve uma mensagem dizendo para esperar alguns segundos, em vez de um erro
genérico — o caso típico é uma apresentação com várias pessoas clicando junto.

### O que a IA não faz

Ela **não descobre vagas**. Um modelo de linguagem não tem índice de ofertas em
tempo real; se pedíssemos "liste vagas de Jovem Aprendiz hoje", ele inventaria,
e o resultado seria pior do que não ter dado nenhum, porque pareceria
verdadeiro.

As vagas do site vêm de [`src/data/vagas.js`](src/data/vagas.js): são exemplos
representativos, montados a partir de perfis reais de programas de
aprendizagem, cada um marcado com `exemplo: true`. A interface avisa o usuário
e aponta para os portais oficiais (CIEE, Nube, SENAI, Senac, Aprendiz Legal,
Sine), onde as vagas de verdade são publicadas. Para plugar uma fonte real
depois, basta trocar o que `/api/vagas` devolve — nenhuma tela muda.

A resposta do modelo também não é aceita de olhos fechados: `api/_mistral.js`
valida cada recomendação, descarta as que citam um id de vaga inexistente e
remove repetidas, porque saída de modelo é entrada não confiável como qualquer
outra.

### Privacidade

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
│   ├── _mistral.js           Prompt, schema e validação da recomendação
│   ├── combinar.js           POST /api/combinar — recomendação por perfil
│   ├── cursos.js             GET  /api/cursos   — catálogo, com filtros
│   └── vagas.js              GET  /api/vagas    — catálogo de vagas
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
│   ├── data/                 Cursos, vagas, perguntas do teste, guias
│   ├── hooks/                useRecurso, useArmazenamentoLocal
│   ├── lib/                  texto.js, icones.js, pdf.js, perfil.js
│   ├── pages/                Uma página por aba
│   ├── services/api.js       Única porta de entrada de dados do front
│   ├── App.jsx               Rotas
│   └── index.css             Design tokens do Tailwind + estilos base
├── vercel.json
└── vite.config.js
```

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
