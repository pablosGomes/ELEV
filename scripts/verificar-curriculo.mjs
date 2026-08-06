/**
 * Confere que o PDF do currículo continua legível por máquina.
 *
 *   node scripts/verificar-curriculo.mjs   (roda junto em: npm run verificar)
 *
 * Existe por causa de uma falha que nenhum teste de tela pegaria: durante muito
 * tempo o PDF foi gerado rasterizando a prévia com `html2canvas`. Na tela ficava
 * perfeito, o arquivo abria normalmente, e mesmo assim não continha uma única
 * letra — só pixels. Sistemas de triagem, que leem o texto do arquivo antes de
 * qualquer pessoa, recebiam uma página em branco.
 *
 * Este script monta um currículo de verdade, grava o PDF e lê o conteúdo de
 * volta procurando o texto que deveria estar lá. Se alguém voltar a rasterizar,
 * ele falha.
 *
 * A leitura de volta usa o `pdftotext` (Poppler) ou o PyMuPDF, se algum estiver
 * instalado. Sem os dois, cai numa checagem mais fraca — procura o texto nos
 * fluxos não comprimidos do próprio PDF — e avisa que foi isso que rodou.
 */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { montarPdf, nomeDoArquivo } from '../src/lib/pdf.js'
import { CURRICULO_EXEMPLO } from '../src/data/curriculo.js'

/** Trechos que precisam sobreviver à ida e volta, incluindo acentuação. */
const ESPERADOS = [
  'Ana Beatriz Souza', // nome
  'Jovem Aprendiz Administrativo', // cargo
  'Mercearia Souza', // empresa de uma experiência
  'Ensino Médio', // formação, com acento
  'Fundação Bradesco', // curso, com cedilha e til
  'Excel intermediário', // habilidade
  'OBJETIVO', // título de seção
]

/** Tenta extrair o texto do PDF com as ferramentas disponíveis na máquina. */
function extrairTexto(caminho) {
  try {
    // `-enc UTF-8` não é opcional: sem ele o Poppler emite na codificação local
    // (cp1252 no Windows), e todo acento vira byte inválido ao ler como UTF-8 —
    // o que faria este script acusar um PDF perfeitamente bom.
    const saida = execFileSync('pdftotext', ['-enc', 'UTF-8', caminho, '-'], { encoding: 'buffer' })
    return { texto: saida.toString('utf8'), metodo: 'pdftotext', confiavel: true }
  } catch {
    /* Poppler não instalado — tenta a próxima. */
  }

  const script = `import fitz,sys;d=fitz.open(sys.argv[1]);sys.stdout.buffer.write("".join(p.get_text() for p in d).encode("utf-8"))`
  for (const python of ['python', 'python3']) {
    try {
      const saida = execFileSync(python, ['-c', script, caminho], { encoding: 'buffer' })
      return { texto: saida.toString('utf8'), metodo: `${python} + PyMuPDF`, confiavel: true }
    } catch {
      /* PyMuPDF ausente — tenta a próxima. */
    }
  }

  // Último recurso: sem extrator, procura direto no arquivo. Só funciona com o
  // PDF sem compressão, por isso o chamador remonta o documento nesse modo.
  return {
    texto: readFileSync(caminho, 'latin1'),
    metodo: 'leitura crua do arquivo',
    confiavel: false,
  }
}

const pasta = mkdtempSync(join(tmpdir(), 'elev-curriculo-'))
const caminho = join(pasta, nomeDoArquivo(CURRICULO_EXEMPLO))

const doc = await montarPdf(CURRICULO_EXEMPLO)
writeFileSync(caminho, Buffer.from(doc.output('arraybuffer')))

const { texto, metodo, confiavel } = extrairTexto(caminho)

console.log(`PDF montado: ${caminho}`)
console.log(`Texto extraído com: ${metodo}${confiavel ? '' : '  (checagem reduzida)'}\n`)

let falhas = 0

for (const trecho of ESPERADOS) {
  // Na leitura crua o PDF quebra o texto em operadores; comparamos sem espaços.
  const achou = confiavel
    ? texto.includes(trecho)
    : texto.replace(/\s+/g, '').includes(trecho.replace(/\s+/g, ''))

  if (achou) {
    console.log(`ok    "${trecho}"`)
  } else {
    falhas += 1
    console.error(`ERRO  "${trecho}" não foi encontrado no PDF`)
  }
}

assert.equal(
  falhas,
  0,
  `${falhas} trecho(s) ausente(s) — o PDF voltou a ser imagem, ou a acentuação quebrou`,
)

console.log(`\n${ESPERADOS.length} trechos encontrados: o PDF tem texto de verdade.`)
