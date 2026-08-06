# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O projeto

ELEV é uma plataforma gratuita (trabalho acadêmico, sem fins lucrativos) que ajuda jovens brasileiros a entrar no mercado de trabalho: cursos gratuitos, teste vocacional, gerador de currículo em PDF, vagas de Jovem Aprendiz e dicas de carreira. Não tem cadastro — currículo e respostas do teste ficam só no `localStorage` do navegador (chaves `elev:curriculo`, `elev:vocacional`).

Stack: React 19 + Vite + Tailwind CSS 4, roteado por `react-router-dom`, publicado na Vercel. As respostas em texto do repositório (comentários, mensagens de commit, UI) são em português do Brasil — siga essa convenção.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento em http://localhost:5173
npm run build    # roda o prebuild (scripts/gerar-vagas.mjs) e depois vite build
npm run vagas    # roda só o gerador de vagas, sem buildar
npm run verificar # confere a classificação de área por palavra-chave
npm run preview  # serve o build de produção localmente
npm run format   # prettier --write .
npm run lint     # prettier --check .
```

Não há suíte de testes — só `npm run verificar`, um script com `assert` do Node que cobre a classificação de área por palavra-chave (a lógica que já publicou dados errados em produção). Sem framework de propósito.

**As rotas em `api/*.js` são Serverless Functions da Vercel e não rodam com `npm run dev`** — o Vite serve o `index.html` para qualquer caminho que não reconheça, então `fetch('/api/...')` falha silenciosamente em dev (a camada de dados trata isso, veja abaixo). Para testar as functions de verdade, use `npx vercel dev`.

## Arquitetura

### Fonte única de dados no front-end

Nenhuma tela chama `fetch` diretamente. Tudo passa por `src/services/api.js`, que tenta a Serverless Function correspondente e cai para os dados estáticos em `src/data/` se a rota não existir, demorar ou falhar. O objeto de retorno sempre inclui `fonte`, e a UI usa isso para avisar o usuário com honestidade em vez de fingir que os dados são outra coisa. Esse padrão é o que permite o site funcionar por completo em `npm run dev` sem nenhuma function rodando.

`useRecurso(carregador, dependencias)` (`src/hooks/useRecurso.js`) envolve essas chamadas com estados de `carregando`/`erro`/`dados`, com proteção contra atualização de estado após desmontar. `useArmazenamentoLocal(chave, valorInicial)` espelha `useState` no `localStorage`.

### Vocabulário de áreas compartilhado

`src/data/areas.js` define 6 áreas (`tecnologia`, `saude`, `negocios`, `comunicacao`, `educacao`, `industria`) com `id`, ícone, descrição e carreiras. Cursos, vagas e as perguntas do teste vocacional (`src/data/vocacional.js`) usam sempre esses mesmos `id`s. Isso é o que permite linkar de "seu resultado é Tecnologia" direto para `/cursos?area=tecnologia`. Ao adicionar uma área nova, ela precisa existir aqui e ser referenciada nos três lugares para o vocabulário continuar consistente — inclusive no `enum` do JSON Schema em `api/_mistral.js` (`IDS_DE_AREA`), que é derivado desse mesmo array.

### Pipeline de vagas: build-time vs. request-time

Este é o ponto que mais exige ler vários arquivos para entender, porque tem duas peças acopladas de formas diferentes:

**1. Catálogo de vagas exibido (`/api/vagas`) — gerado no build.**
`scripts/gerar-vagas.mjs` roda via `prebuild` antes de todo `vite build`. Ele busca anúncios reais no Jooble (`api/_fonte-vagas.js::buscarNoJooble`, precisa de `JOOBLE_API_KEY`) e, se `MISTRAL_API_KEY` também estiver configurada, organiza cada anúncio em lotes de 5 via `api/_mistral.js::organizarLote` — separando requisitos/atividades/benefícios/escolaridade/faixa etária do texto corrido, classificando a área pelo conteúdo (não só pelo título) e descartando o que não é aprendizagem de verdade (estágio, trainee, CLT júnior). O resultado é gravado em `src/data/vagas-geradas.js` (**arquivo gerado, versionado no git de propósito** para que um clone novo funcione sem rodar o script antes). `api/vagas.js` só lê esse arquivo e serve; se ele vier vazio, cai para `VAGAS_EXEMPLO` de `src/data/vagas.js`.

Motivo de rodar no build e não por requisição: o consumo de cota da API cai por deploy em vez de por visitante, a página abre sem esperar o modelo, e as chaves nunca chegam perto do navegador. O script nunca derruba o build — qualquer falha (chave ausente, Jooble fora do ar, JSON inesperado, limite de uso da Mistral) grava o arquivo vazio e sai com sucesso.

**2. Recomendação personalizada (`POST /api/combinar`) — em tempo real.**
Cruza o perfil do usuário (teste vocacional + currículo, montado no cliente por `src/lib/perfil.js::montarPerfil`) com uma lista de vagas candidatas via `api/_mistral.js::recomendarVagas`.

As candidatas saem de `api/_catalogo.js::catalogoDeVagas()` — a **mesma** função que `/api/vagas` usa para listar. Isso não é preferência de estilo: quando cada rota decidia sozinha qual catálogo ler, elas divergiram em produção (a listagem servia vagas reais do Jooble e a recomendação avaliava só `VAGAS_EXEMPLO`, indicando vagas que nem estavam na página). Ao mexer na origem das vagas, mexa nessa função, não nas rotas.

O `fonte` devolvido por `catalogoDeVagas()` viaja até a UI nas duas rotas, e a seção de recomendação usa isso para dizer se a análise leu anúncios reais ou vagas de exemplo.

Ambas as tarefas de IA passam pela mesma função interna `conversar()` em `api/_mistral.js`: tenta `responseFormat: json_schema` (`strict: true`) e, se o modelo específico não aceitar, cai para `json_object` (formato garantido só pelo prompt + validação em código). Toda resposta do modelo é tratada como entrada não confiável — ids inventados, duplicatas e campos fora do schema são descartados em silêncio, nunca propagados para a UI (ver `validar()` em `_mistral.js` e o filtro por id em `organizarLote()`). HTTP 429 (limite do free tier da Mistral) é detectado por `ehLimiteDeUso()` e nunca gera novo retry automático — nem no script de build (para não gastar cota já usada) nem na rota de recomendação (que devolve 429 com mensagem acionável para o usuário tentar de novo).

Arquivos com `_` no início (`api/_mistral.js`, `api/_fonte-vagas.js`, `api/_catalogo.js`) são código compartilhado e não viram rota na Vercel.

**Modo de falha que já mordeu:** um `MISTRAL_MODEL` inválido não quebra nada de forma visível. A API recusa toda chamada, os dois formatos de resposta erram igual, e o build cai na classificação por palavra-chave — publicando vagas reais sem requisitos, sem benefícios e com área não confiável. Quando isso acontece, `gerar-vagas.mjs` grava `motivo` no arquivo gerado e `fonte` fica `jooble` (em vez de `jooble+ia`); essa é a assinatura para procurar. Confira IDs na [lista oficial da Mistral](https://docs.mistral.ai/getting-started/models/models_overview/).

`classificarArea()` em `_fonte-vagas.js` casa palavras-chave por início de palavra, e siglas de até 2 letras (`ti`, `rh`) só como palavra inteira. A versão antiga usava `includes()`, e `'ti'` casava dentro de "a**ti**vidades" e "marke**ti**ng" — 24 de 30 vagas publicadas viraram "Tecnologia". `npm run verificar` protege esse comportamento.

### Privacidade na recomendação

`api/combinar.js::extrairPerfil` é uma allowlist explícita: nome, e-mail, telefone e LinkedIn nunca são enviados ao modelo, mesmo que o cliente os inclua no corpo da requisição — o corte acontece nos dois lados (cliente em `src/lib/perfil.js`, servidor em `api/combinar.js`) e nada é persistido em banco ou log.

### Currículo em PDF

A prévia (`src/components/curriculo/PreviaCurriculo.jsx`) é renderizada duas vezes: uma visível (redimensionada por `EscalaAjustavel` para caber na tela) e uma fora da área visível em tamanho real A4 (794px = 96dpi), que é o que vira PDF de fato — assim o download funciona mesmo no celular, onde a prévia visível pode estar atrás de uma aba. `src/lib/pdf.js` rasteriza com `html2canvas-pro` (não `html2canvas` puro — o Tailwind v4 gera cores em `oklch`, que a versão original não interpreta) e monta as páginas com `jsPDF`. Essas duas libs (~350kB juntas) são importadas sob demanda dentro de `gerarPdfCurriculo`, só baixadas por quem realmente clica em "Baixar em PDF".

### Ícones

`src/lib/icones.js` mantém um registro (`ICONES`) com só os ícones do `lucide-react` que o site usa, resolvidos por nome via `obterIcone(nome, padrao)`. Isso existe para evitar `import * as Icones from 'lucide-react'`, que traria a biblioteca inteira (1500+ ícones) para o bundle. Ícones novos referenciados por `id`/string em `src/data/*.js` precisam ser adicionados a esse registro.

### Rotas e code-splitting

`src/App.jsx` define as rotas; todas as páginas exceto `Inicio` são `lazy()`-carregadas para manter o primeiro acesso leve em conexão de celular. `vercel.json` tem um rewrite de SPA (`/((?!api/).*)` → `/index.html`) para que rotas como `/vagas` funcionem ao recarregar a página direto.

## Variáveis de ambiente

Nenhuma é obrigatória — o site publica e funciona por completo sem configurar nada (vagas de exemplo, recomendação desligada com aviso explicativo).

| Variável          | Efeito quando ausente                                                                                           | Efeito quando presente                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `JOOBLE_API_KEY`  | `/api/vagas` serve `VAGAS_EXEMPLO`                                                                              | busca anúncios reais no build                                             |
| `MISTRAL_API_KEY` | organização de vagas cai para classificação por palavra-chave (`normalizarSemIa`); `/api/combinar` responde 503 | habilita `organizarLote` e `recomendarVagas`                              |
| `MISTRAL_MODEL`   | usa `mistral-small-2603`                                                                                        | sobrescreve o modelo (a Mistral aposenta IDs datados sem alias `-latest`) |

## Convenções específicas do projeto

- **Nomes em português** em toda a base: variáveis, funções, comentários, chaves de dados (`titulo`, `cidade`, `requisitos`). Mantenha a consistência ao editar.
- **`exemplo: true`** marca vagas que não são anúncios reais (`src/data/vagas.js`) — nunca remova essa flag ao editar dados de exemplo, ela é o que aciona o aviso na UI.
- Vídeo-aulas em `src/data/dicas.js` usam `youtubeId: null` como placeholder — enquanto for `null`, o card linka para uma busca no YouTube em vez de embutir um vídeo quebrado.
