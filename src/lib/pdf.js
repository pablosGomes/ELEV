import { slug } from './texto.js'

/**
 * Geração do currículo em PDF.
 *
 * Estratégia: rasterizar o elemento da prévia e encaixá-lo em páginas A4.
 * Assim o PDF sai exatamente igual ao que o usuário vê na tela — o que evita
 * a frustração clássica de "na tela estava certo, no PDF quebrou".
 *
 * Usamos `html2canvas-pro` (e não o `html2canvas` original) porque o Tailwind
 * v4 gera cores no espaço `oklch`, que a versão antiga não sabe interpretar.
 */

const A4_LARGURA_MM = 210
const A4_ALTURA_MM = 297

/**
 * Converte o elemento informado em um PDF A4 e dispara o download.
 *
 * @param {HTMLElement} elemento nó da prévia do currículo
 * @param {string} nome nome da pessoa, usado no arquivo final
 * @returns {Promise<string>} nome do arquivo gerado
 */
export async function gerarPdfCurriculo(elemento, nome) {
  if (!elemento) {
    throw new Error('A prévia do currículo ainda não está pronta.')
  }

  // Carregamento sob demanda: juntas, estas duas bibliotecas passam de 350 kB.
  // Só quem clica em "Baixar em PDF" paga esse download — o resto do site
  // continua leve, o que importa para quem acessa pelo celular.
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(elemento, {
    // 2x deixa o texto nítido sem gerar um arquivo grande demais.
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Largura fixa em A4; a altura é proporcional ao conteúdo capturado.
  const alturaTotalMM = (canvas.height * A4_LARGURA_MM) / canvas.width
  const imagem = canvas.toDataURL('image/jpeg', 0.95)

  pdf.addImage(imagem, 'JPEG', 0, 0, A4_LARGURA_MM, alturaTotalMM, undefined, 'FAST')

  // Se o currículo passar de uma página, deslocamos a mesma imagem para cima
  // a cada página nova, revelando a parte seguinte do conteúdo.
  let alturaRestante = alturaTotalMM - A4_ALTURA_MM
  let deslocamento = -A4_ALTURA_MM

  while (alturaRestante > 1) {
    pdf.addPage()
    pdf.addImage(imagem, 'JPEG', 0, deslocamento, A4_LARGURA_MM, alturaTotalMM, undefined, 'FAST')
    alturaRestante -= A4_ALTURA_MM
    deslocamento -= A4_ALTURA_MM
  }

  const arquivo = `curriculo-${slug(nome) || 'elev'}.pdf`
  pdf.save(arquivo)

  return arquivo
}
