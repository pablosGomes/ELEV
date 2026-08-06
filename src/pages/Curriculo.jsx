import { useMemo, useState } from 'react'
import { Download, Eye, FileText, Loader2, PencilLine, RotateCcw, Wand2 } from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import EscalaAjustavel from '../components/EscalaAjustavel.jsx'
import FormularioCurriculo from '../components/curriculo/FormularioCurriculo.jsx'
import PreviaCurriculo, { LARGURA_A4 } from '../components/curriculo/PreviaCurriculo.jsx'
import { Aviso, Botao, Progresso } from '../components/ui.jsx'
import useArmazenamentoLocal from '../hooks/useArmazenamentoLocal.js'
import { gerarPdfCurriculo } from '../lib/pdf.js'
import { CURRICULO_EXEMPLO, CURRICULO_VAZIO, calcularCompletude } from '../data/curriculo.js'

/**
 * Garante que o objeto salvo no navegador tenha todos os campos esperados.
 * Sem isso, um currículo salvo antes de uma mudança no modelo quebraria a tela.
 */
function normalizar(salvo) {
  return {
    ...CURRICULO_VAZIO,
    ...salvo,
    dados: { ...CURRICULO_VAZIO.dados, ...(salvo?.dados ?? {}) },
    formacoes: salvo?.formacoes ?? [],
    experiencias: salvo?.experiencias ?? [],
    cursos: salvo?.cursos ?? [],
    habilidades: salvo?.habilidades ?? [],
    idiomas: salvo?.idiomas ?? [],
  }
}

export default function Curriculo() {
  const [salvo, setSalvo, limparSalvo] = useArmazenamentoLocal('elev:curriculo', CURRICULO_VAZIO)
  const [aba, setAba] = useState('editar')
  const [gerando, setGerando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  const curriculo = useMemo(() => normalizar(salvo), [salvo])
  const completude = calcularCompletude(curriculo)

  const baixarPdf = async () => {
    setGerando(true)
    setMensagem(null)

    try {
      const arquivo = await gerarPdfCurriculo(curriculo)
      setMensagem({ tom: 'info', texto: `Pronto! O arquivo ${arquivo} foi baixado.` })
    } catch (erro) {
      setMensagem({
        tom: 'alerta',
        texto: `Não foi possível gerar o PDF: ${erro.message}. Tente novamente ou use outro navegador.`,
      })
    } finally {
      setGerando(false)
    }
  }

  const limpar = () => {
    if (window.confirm('Isso vai apagar tudo o que você preencheu. Deseja continuar?')) {
      limparSalvo()
      setMensagem(null)
    }
  }

  return (
    <>
      <CabecalhoPagina
        icone="FileText"
        sobretitulo="Criar currículo"
        titulo="Monte seu currículo e baixe em PDF"
        descricao="Preencha os campos e veja o currículo sendo montado ao lado, em tempo real. Não precisa de cadastro, e o que você digita fica salvo apenas no seu navegador."
      />

      <div className="container-elev py-10">
        {/* ------------------------------------------------------ Barra de ações */}
        <div className="rounded-2xl border border-areia-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="min-w-[220px] flex-1">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-areia-700">
                  Currículo {completude}% completo
                </span>
                <span className="text-xs text-areia-400">
                  {completude === 100 ? 'Tudo pronto!' : 'Preencha as seções em branco'}
                </span>
              </div>
              <Progresso valor={completude} rotulo="Preenchimento do currículo" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Botao onClick={() => setSalvo(CURRICULO_EXEMPLO)} variante="contorno" tamanho="sm">
                <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                Preencher com exemplo
              </Botao>

              <Botao onClick={limpar} variante="fantasma" tamanho="sm">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Limpar
              </Botao>

              <Botao onClick={baixarPdf} disabled={gerando} tamanho="sm">
                {gerando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {gerando ? 'Gerando PDF...' : 'Baixar em PDF'}
              </Botao>
            </div>
          </div>

          {mensagem && (
            <Aviso tom={mensagem.tom} className="mt-4">
              {mensagem.texto}
            </Aviso>
          )}
        </div>

        {/* ------------------------------------------------- Abas (celular) */}
        <div className="mt-6 flex gap-1 rounded-xl bg-areia-100 p-1 lg:hidden">
          {[
            { id: 'editar', rotulo: 'Editar', Icone: PencilLine },
            { id: 'previa', rotulo: 'Prévia', Icone: Eye },
          ].map(({ id, rotulo, Icone }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              aria-pressed={aba === id}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                aba === id ? 'bg-white text-elev-800 shadow-sm' : 'text-areia-500'
              }`}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </div>

        {/* --------------------------------------------- Formulário + prévia */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/*
            `min-w-0` nas duas colunas: a prévia tem largura fixa de 794px (A4),
            e sem isso ela vira o piso de largura do item da grade e estoura o
            layout no celular.
          */}
          <div className={`min-w-0 lg:col-span-7 ${aba === 'editar' ? '' : 'hidden lg:block'}`}>
            <FormularioCurriculo curriculo={curriculo} aoAlterar={setSalvo} />
          </div>

          <div className={`min-w-0 lg:col-span-5 ${aba === 'previa' ? '' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-areia-600">
                <FileText className="h-4 w-4 text-elev-700" aria-hidden="true" />
                Prévia do seu currículo
              </div>

              <EscalaAjustavel
                larguraBase={LARGURA_A4}
                className="overflow-hidden rounded-xl border border-areia-200 shadow-elev"
              >
                <PreviaCurriculo curriculo={curriculo} />
              </EscalaAjustavel>

              <p className="mt-3 text-xs leading-relaxed text-areia-500">
                Coluna única e texto de verdade no arquivo — os sistemas de triagem das empresas
                conseguem ler e pesquisar o conteúdo, em vez de receber uma imagem. O PDF segue para
                a página seguinte se o conteúdo passar de uma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
