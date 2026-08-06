import { iniciais, slug } from './texto.js'

/**
 * Geração do currículo em PDF.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Por que o PDF é desenhado, e não fotografado
 * ────────────────────────────────────────────────────────────────────────────
 * A versão anterior rasterizava a prévia com `html2canvas` e colava a imagem
 * no PDF. Saía visualmente idêntico à tela — e completamente ilegível para
 * máquina: o arquivo não tinha uma única letra de texto, só pixels.
 *
 * Isso é grave justamente aqui. Boa parte das empresas passa currículo por um
 * sistema de triagem que lê o texto do arquivo antes de qualquer humano abrir.
 * Um PDF-imagem chega nesse sistema como uma página em branco: o candidato é
 * descartado sem nunca saber por quê. Um site que promete ajudar no primeiro
 * emprego não pode entregar o formato que elimina o candidato em silêncio.
 *
 * Agora o currículo é desenhado com a API de texto do jsPDF. O resultado é
 * selecionável, pesquisável e extraível — e, de quebra, dispensa o
 * `html2canvas` (≈250 kB a menos) e sai em poucos kB em vez de centenas.
 *
 * O preço é que este arquivo e `PreviaCurriculo.jsx` desenham o mesmo currículo
 * duas vezes, cada um do seu jeito. Ao mexer no layout de um, olhe o outro.
 */

/* ==========================================================================
   Medidas e cores
   ========================================================================== */

const PAGINA = { largura: 210, altura: 297 }
const MARGEM = { esquerda: 16, direita: 16, inferior: 18 }
const LARGURA_UTIL = PAGINA.largura - MARGEM.esquerda - MARGEM.direita
const ALTURA_CABECALHO = 42

// Mesmos tokens de `src/index.css`, em RGB porque é o que o jsPDF aceita.
const COR = {
  vinhoEscuro: [88, 16, 28], // elev-900
  vinho: [155, 27, 48], // elev-700
  vinhoMedio: [122, 22, 38], // elev-800
  rosaClaro: [247, 166, 180], // elev-300
  rosaFundo: [253, 227, 231], // elev-100
  tintaForte: [24, 24, 27], // areia-900
  tinta: [63, 63, 70], // areia-700
  tintaFraca: [82, 82, 91], // areia-600
  cinza: [113, 113, 122], // areia-500
  branco: [255, 255, 255],
}

/* ==========================================================================
   Desenho
   ========================================================================== */

/**
 * Estado do desenho: a posição vertical atual e a quebra de página.
 *
 * O jsPDF não tem noção de fluxo — cada `text()` é uma coordenada absoluta.
 * Este objeto é o mínimo necessário para simular um: onde estamos e o que
 * fazer quando o conteúdo não cabe mais.
 */
function criarCursor(doc) {
  let y = ALTURA_CABECALHO + 12

  return {
    get y() {
      return y
    },
    avancar(mm) {
      y += mm
    },
    /**
     * Garante espaço para o próximo bloco, abrindo página nova se preciso.
     * Recebe a altura do bloco INTEIRO (não da primeira linha), para não
     * deixar um título de seção sozinho no pé da página.
     */
    reservar(altura) {
      if (y + altura <= PAGINA.altura - MARGEM.inferior) return
      doc.addPage()
      y = MARGEM.inferior
    },
  }
}

function definirTexto(doc, { tamanho, estilo = 'normal', cor = COR.tinta }) {
  doc.setFont('helvetica', estilo)
  doc.setFontSize(tamanho)
  doc.setTextColor(...cor)
}

/** Escreve um parágrafo com quebra automática e devolve a altura ocupada. */
function paragrafo(doc, cursor, texto, { tamanho, estilo, cor, largura = LARGURA_UTIL, x }) {
  definirTexto(doc, { tamanho, estilo, cor })

  const linhas = doc.splitTextToSize(String(texto), largura)
  const alturaLinha = tamanho * 0.42 + 0.6

  cursor.reservar(linhas.length * alturaLinha)
  doc.text(linhas, x ?? MARGEM.esquerda, cursor.y)
  cursor.avancar(linhas.length * alturaLinha)

  return linhas.length * alturaLinha
}

/** Cabeçalho vinho com nome, cargo e contatos. */
function desenharCabecalho(doc, { dados }) {
  doc.setFillColor(...COR.vinhoEscuro)
  doc.rect(0, 0, PAGINA.largura, ALTURA_CABECALHO, 'F')

  const centroX = MARGEM.esquerda + 9
  const centroY = 17
  const textoX = centroX + 14

  // O nome vem ANTES do monograma no fluxo do documento, embora apareça depois
  // dele na página. Quem extrai o texto lê na ordem em que foi desenhado: com o
  // monograma primeiro, a primeira linha do currículo seria "AS", que um leitor
  // automático pode confundir com o nome do candidato. A posição visual não
  // muda — só a ordem de escrita.
  definirTexto(doc, { tamanho: 20, estilo: 'bold', cor: COR.branco })
  doc.text(dados.nome.trim() || 'Seu nome completo', textoX, 15)

  definirTexto(doc, { tamanho: 10.5, estilo: 'normal', cor: COR.rosaClaro })
  doc.text(dados.cargo.trim() || 'Cargo desejado', textoX, 22)

  // Círculo com as iniciais.
  doc.setFillColor(...COR.vinhoMedio)
  doc.circle(centroX, centroY, 9, 'F')

  definirTexto(doc, { tamanho: 15, estilo: 'bold', cor: COR.branco })
  doc.text(iniciais(dados.nome) || 'SN', centroX, centroY + 1.8, { align: 'center' })

  // Contatos numa linha só, separados por ponto médio.
  const local = [dados.cidade, dados.estado].filter(Boolean).join(' - ')
  const contatos = [dados.telefone, dados.email, local, dados.linkedin].filter(Boolean)

  if (contatos.length > 0) {
    definirTexto(doc, { tamanho: 8.5, estilo: 'normal', cor: [235, 215, 220] })
    const linhas = doc.splitTextToSize(contatos.join('   ·   '), LARGURA_UTIL)
    doc.text(linhas.slice(0, 2), MARGEM.esquerda, 32)
  }
}

/** Título de seção: caixa alta, espaçado, com filete vinho embaixo. */
function desenharTituloSecao(doc, cursor, titulo) {
  // Título + filete + primeira linha de conteúdo: ~16mm. Reservar tudo junto
  // evita o título órfão no fim da página.
  cursor.reservar(16)

  definirTexto(doc, { tamanho: 9.5, estilo: 'bold', cor: COR.vinhoEscuro })
  doc.setCharSpace(0.5)
  doc.text(titulo.toUpperCase(), MARGEM.esquerda, cursor.y)
  doc.setCharSpace(0)

  cursor.avancar(1.8)
  doc.setDrawColor(...COR.vinho)
  doc.setLineWidth(0.5)
  doc.line(MARGEM.esquerda, cursor.y, PAGINA.largura - MARGEM.direita, cursor.y)

  cursor.avancar(5.5)
}

/** Linha com um texto à esquerda e o período alinhado à direita. */
function linhaComPeriodo(doc, cursor, { titulo, periodo }) {
  cursor.reservar(5)

  if (periodo) {
    definirTexto(doc, { tamanho: 8.5, estilo: 'normal', cor: COR.cinza })
    doc.text(periodo, PAGINA.largura - MARGEM.direita, cursor.y, { align: 'right' })
  }

  // O título recua para não colidir com o período.
  const larguraPeriodo = periodo ? doc.getTextWidth(periodo) + 4 : 0
  definirTexto(doc, { tamanho: 10, estilo: 'bold', cor: COR.tintaForte })
  const linhas = doc.splitTextToSize(titulo, LARGURA_UTIL - larguraPeriodo)
  doc.text(linhas[0], MARGEM.esquerda, cursor.y)

  cursor.avancar(4.6)
}

/** Etiquetas de habilidade, quebrando para a linha seguinte quando acabam. */
function desenharEtiquetas(doc, cursor, itens) {
  const alturaEtiqueta = 5.6
  const espacamento = 2
  let x = MARGEM.esquerda

  cursor.reservar(alturaEtiqueta)

  for (const item of itens) {
    definirTexto(doc, { tamanho: 8.5, estilo: 'normal', cor: COR.vinhoMedio })
    const largura = doc.getTextWidth(item) + 5

    if (x + largura > PAGINA.largura - MARGEM.direita) {
      x = MARGEM.esquerda
      cursor.avancar(alturaEtiqueta + espacamento)
      cursor.reservar(alturaEtiqueta)
    }

    doc.setFillColor(...COR.rosaFundo)
    doc.roundedRect(x, cursor.y - 3.9, largura, alturaEtiqueta, 1.2, 1.2, 'F')
    definirTexto(doc, { tamanho: 8.5, estilo: 'normal', cor: COR.vinhoMedio })
    doc.text(item, x + 2.5, cursor.y)

    x += largura + espacamento
  }

  cursor.avancar(alturaEtiqueta + 1)
}

/* ==========================================================================
   Seções
   ========================================================================== */

function secaoObjetivo(doc, cursor, curriculo) {
  if (!curriculo.objetivo?.trim()) return

  desenharTituloSecao(doc, cursor, 'Objetivo')
  paragrafo(doc, cursor, curriculo.objetivo.trim(), { tamanho: 9.5, cor: COR.tinta })
  cursor.avancar(4)
}

function secaoExperiencia(doc, cursor, curriculo) {
  if (!curriculo.experiencias?.length) return

  desenharTituloSecao(doc, cursor, 'Experiência')

  for (const item of curriculo.experiencias) {
    const periodo = [item.inicio, item.atual ? 'Atual' : item.fim].filter(Boolean).join(' — ')
    linhaComPeriodo(doc, cursor, { titulo: item.cargo || 'Cargo', periodo })

    if (item.empresa) {
      paragrafo(doc, cursor, item.empresa, { tamanho: 9, estilo: 'bold', cor: COR.vinho })
    }
    if (item.descricao) {
      paragrafo(doc, cursor, item.descricao, { tamanho: 9, cor: COR.tintaFraca })
    }

    cursor.avancar(3.5)
  }

  cursor.avancar(1)
}

function secaoFormacao(doc, cursor, curriculo) {
  if (!curriculo.formacoes?.length) return

  desenharTituloSecao(doc, cursor, 'Formação')

  for (const item of curriculo.formacoes) {
    const titulo = [item.curso || 'Curso', item.situacao && `(${item.situacao})`]
      .filter(Boolean)
      .join(' ')
    const periodo = [item.inicio, item.fim].filter(Boolean).join(' — ')

    linhaComPeriodo(doc, cursor, { titulo, periodo })

    if (item.instituicao) {
      paragrafo(doc, cursor, item.instituicao, { tamanho: 9, cor: COR.tintaFraca })
    }

    cursor.avancar(3)
  }

  cursor.avancar(1)
}

function secaoCursos(doc, cursor, curriculo) {
  if (!curriculo.cursos?.length) return

  desenharTituloSecao(doc, cursor, 'Cursos complementares')

  for (const item of curriculo.cursos) {
    const complemento = [item.cargaHoraria && `${item.cargaHoraria}h`, item.ano]
      .filter(Boolean)
      .join(' · ')
    const titulo = [item.nome || 'Curso', item.instituicao].filter(Boolean).join(' — ')

    linhaComPeriodo(doc, cursor, { titulo, periodo: complemento })
    cursor.avancar(0.8)
  }

  cursor.avancar(3)
}

function secaoHabilidades(doc, cursor, curriculo) {
  if (!curriculo.habilidades?.length) return

  desenharTituloSecao(doc, cursor, 'Habilidades')
  desenharEtiquetas(doc, cursor, curriculo.habilidades)
  cursor.avancar(4)
}

function secaoIdiomas(doc, cursor, curriculo) {
  if (!curriculo.idiomas?.length) return

  desenharTituloSecao(doc, cursor, 'Idiomas')

  const texto = curriculo.idiomas
    .filter((item) => item.idioma)
    .map((item) => [item.idioma, item.nivel].filter(Boolean).join(' — '))
    .join('        ')

  if (texto) paragrafo(doc, cursor, texto, { tamanho: 9.5, cor: COR.tinta })
}

/* ==========================================================================
   Entrada
   ========================================================================== */

/**
 * Monta o documento, sem baixar nada.
 *
 * Separado de `gerarPdfCurriculo` para que dê para conferir o resultado fora do
 * navegador: `scripts/verificar-curriculo.mjs` monta um currículo por aqui,
 * grava o arquivo e extrai o texto de volta. É o que garante que o PDF
 * continua legível por máquina — a regressão que motivou esta reescrita não
 * quebrava nada visualmente, então nenhum teste de tela a pegaria.
 *
 * @param {object} curriculo objeto já normalizado (ver `CURRICULO_VAZIO`)
 * @returns {Promise<object>} documento jsPDF pronto
 */
export async function montarPdf(curriculo) {
  if (!curriculo?.dados) {
    throw new Error('O currículo ainda não está pronto.')
  }

  // Sob demanda: o jsPDF pesa ~130 kB comprimido e só interessa a quem clica
  // em "Baixar em PDF".
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

  // Metadados: é o que um sistema de triagem lê antes do conteúdo.
  const nome = curriculo.dados.nome.trim()
  doc.setProperties({
    title: nome ? `Currículo — ${nome}` : 'Currículo',
    subject: curriculo.dados.cargo.trim() || 'Currículo',
    author: nome || undefined,
    creator: 'ELEV',
  })

  desenharCabecalho(doc, curriculo)

  const cursor = criarCursor(doc)
  secaoObjetivo(doc, cursor, curriculo)
  secaoExperiencia(doc, cursor, curriculo)
  secaoFormacao(doc, cursor, curriculo)
  secaoCursos(doc, cursor, curriculo)
  secaoHabilidades(doc, cursor, curriculo)
  secaoIdiomas(doc, cursor, curriculo)

  return doc
}

/** Nome do arquivo baixado, a partir do nome da pessoa. */
export function nomeDoArquivo(curriculo) {
  return `curriculo-${slug(curriculo?.dados?.nome ?? '') || 'elev'}.pdf`
}

/**
 * Monta o currículo em PDF e dispara o download.
 *
 * @param {object} curriculo objeto já normalizado (ver `CURRICULO_VAZIO`)
 * @returns {Promise<string>} nome do arquivo gerado
 */
export async function gerarPdfCurriculo(curriculo) {
  const doc = await montarPdf(curriculo)
  const arquivo = nomeDoArquivo(curriculo)

  doc.save(arquivo)

  return arquivo
}
