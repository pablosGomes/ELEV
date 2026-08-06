import { useState } from 'react'
import { AlertCircle, ArrowRight, Check, Loader2, Lock, Sparkles, Target } from 'lucide-react'

import Revelar from './Revelar.jsx'
import { Aviso, Botao, Chip, TituloSecao } from './ui.jsx'
import { combinarVagas } from '../services/api.js'
import { montarPerfil, temCurriculo, temResultadoVocacional } from '../lib/perfil.js'
import { nomeDaArea } from '../data/areas.js'

const TONS_DE_COMBINACAO = {
  alta: { rotulo: 'Combina muito', tom: 'sucesso' },
  media: { rotulo: 'Combina', tom: 'marca' },
  baixa: { rotulo: 'Vale olhar', tom: 'neutro' },
}

/* ==========================================================================
   Card de uma recomendação
   ========================================================================== */

function CartaoRecomendacao({ item, aoAbrirVaga, atraso }) {
  const { vaga, motivo, pontuacao, pontosFortes, oQuePreparar } = item
  const combinacao = TONS_DE_COMBINACAO[pontuacao] ?? TONS_DE_COMBINACAO.media
  const local = [vaga.cidade, vaga.estado].filter(Boolean).join(' - ')

  return (
    <Revelar atraso={atraso}>
      <article className="h-full rounded-2xl border border-elev-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Chip tom={combinacao.tom}>{combinacao.rotulo}</Chip>
          <Chip>{nomeDaArea(vaga.area)}</Chip>
        </div>

        <h3 className="mt-4 text-base leading-snug font-bold">{vaga.titulo}</h3>
        <p className="mt-1 text-xs text-areia-500">
          {vaga.empresa}
          {local && ` · ${local}`}
        </p>

        <p className="mt-4 border-l-2 border-elev-300 pl-3 text-sm leading-relaxed text-areia-700">
          {motivo}
        </p>

        {pontosFortes?.length > 0 && (
          <div className="mt-5">
            <h4 className="text-[11px] font-bold tracking-wide text-areia-400 uppercase">
              A seu favor
            </h4>
            <ul className="mt-2 space-y-1.5">
              {pontosFortes.map((ponto) => (
                <li key={ponto} className="flex items-start gap-2 text-xs text-areia-600">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        )}

        {oQuePreparar?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-[11px] font-bold tracking-wide text-areia-400 uppercase">
              Para se preparar
            </h4>
            <ul className="mt-2 space-y-1.5">
              {oQuePreparar.map((ponto) => (
                <li key={ponto} className="flex items-start gap-2 text-xs text-areia-600">
                  <ArrowRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-elev-600"
                    aria-hidden="true"
                  />
                  {ponto}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Botao
          onClick={() => aoAbrirVaga(vaga)}
          variante="secundario"
          tamanho="sm"
          className="mt-6 w-full"
        >
          Ver a vaga completa
        </Botao>
      </article>
    </Revelar>
  )
}

/* ==========================================================================
   Seção
   ========================================================================== */

export default function RecomendacoesIa({ aoAbrirVaga }) {
  // Lidas uma vez na montagem: são dados do localStorage, não mudam sozinhos.
  const [prontoParaUsar] = useState(() => temResultadoVocacional())
  const [curriculoPreenchido] = useState(() => temCurriculo())

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [resultado, setResultado] = useState(null)

  const pedirRecomendacoes = async () => {
    const perfil = montarPerfil()
    if (!perfil) {
      setErro('Não encontramos seu resultado do teste vocacional neste navegador.')
      return
    }

    setCarregando(true)
    setErro(null)

    try {
      setResultado(await combinarVagas(perfil))
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="mt-20">
      <Revelar>
        <TituloSecao
          sobretitulo="Recomendação personalizada"
          titulo="Quais dessas vagas combinam com você?"
          descricao="Cruzamos o resultado do seu teste vocacional e o que você preencheu no currículo com as vagas desta página, e explicamos o porquê de cada indicação."
        />
      </Revelar>

      <div className="mt-8">
        {/* ------------------------------------- Ainda não fez o teste */}
        {!prontoParaUsar && (
          <Revelar>
            <div className="rounded-2xl border border-dashed border-areia-300 bg-areia-50 px-6 py-12 text-center">
              <Target className="mx-auto h-9 w-9 text-areia-400" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">Primeiro, o teste vocacional</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-areia-600">
                São 18 perguntas e leva uns 3 minutos. Sem ele não há perfil para comparar com as
                vagas.
              </p>
              <div className="mt-6 flex justify-center">
                <Botao para="/teste-vocacional">
                  Fazer o teste
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Botao>
              </div>
            </div>
          </Revelar>
        )}

        {/* ------------------------------------------ Pronto para pedir */}
        {prontoParaUsar && !resultado && (
          <Revelar>
            <div className="rounded-2xl border border-areia-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="inline-flex items-center gap-2 text-lg font-bold">
                    <Sparkles className="h-4.5 w-4.5 text-elev-700" aria-hidden="true" />
                    Seu perfil está pronto
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-areia-600">
                    {curriculoPreenchido
                      ? 'Vamos usar seu resultado vocacional e seu currículo para escolher as vagas mais compatíveis.'
                      : 'Vamos usar seu resultado vocacional. Se você preencher o currículo, as recomendações ficam bem mais precisas.'}
                  </p>
                </div>

                <Botao onClick={pedirRecomendacoes} disabled={carregando} tamanho="lg">
                  {carregando ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                  {carregando ? 'Analisando...' : 'Ver minhas recomendações'}
                </Botao>
              </div>

              {/*
                O currículo é dado pessoal. O usuário precisa saber o que sai do
                aparelho dele ANTES de clicar, não depois.
              */}
              <p className="mt-6 flex items-start gap-2.5 border-t border-areia-100 pt-5 text-xs leading-relaxed text-areia-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Ao clicar, enviamos seu resultado vocacional e os dados profissionais do currículo
                  (objetivo, cursos, formação, experiências e habilidades) para gerar a análise.{' '}
                  <strong className="font-semibold text-areia-700">
                    Nome, e-mail, telefone e LinkedIn não são enviados
                  </strong>
                  , e nada disso é armazenado — usamos e descartamos.
                </span>
              </p>

              {carregando && (
                <p className="mt-4 text-xs text-areia-400" aria-live="polite">
                  Isso costuma levar de 10 a 20 segundos.
                </p>
              )}

              {erro && (
                <Aviso tom="alerta" titulo="Não deu para gerar agora" className="mt-5">
                  {erro}
                </Aviso>
              )}
            </div>
          </Revelar>
        )}

        {/* ------------------------------------------------- Resultado */}
        {resultado && (
          <>
            {resultado.resumo && (
              <Revelar>
                <div className="rounded-2xl bg-elev-900 p-7 text-white sm:p-9">
                  <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-elev-200 uppercase">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Lendo o seu perfil
                  </p>
                  <p className="mt-4 max-w-3xl leading-relaxed text-white/85">{resultado.resumo}</p>
                </div>
              </Revelar>
            )}

            {resultado.recomendacoes.length === 0 ? (
              <Revelar className="mt-6">
                <Aviso tom="info" titulo="Nenhuma vaga combinou desta vez">
                  As vagas disponíveis agora estão distantes do seu perfil. Isso muda conforme novas
                  vagas entram — vale voltar aqui em alguns dias, e enquanto isso fazer um curso
                  gratuito da sua área.
                </Aviso>
              </Revelar>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resultado.recomendacoes.map((item, i) => (
                  <CartaoRecomendacao
                    key={item.vagaId}
                    item={item}
                    aoAbrirVaga={aoAbrirVaga}
                    atraso={Math.min(i, 4) * 0.06}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="inline-flex max-w-2xl items-start gap-2 text-xs leading-relaxed text-areia-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {resultado.fonte === 'exemplos'
                    ? 'A análise leu as vagas de exemplo desta página, não anúncios abertos. Serve para você entender o que pesa numa candidatura — para vagas reais, use os portais oficiais abaixo.'
                    : 'A análise leu os anúncios reais listados nesta página.'}{' '}
                  É uma sugestão gerada por inteligência artificial, não uma triagem — confira
                  sempre o anúncio original antes de se candidatar.
                </span>
              </p>

              <Botao
                onClick={pedirRecomendacoes}
                variante="contorno"
                tamanho="sm"
                disabled={carregando}
              >
                {carregando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                Gerar de novo
              </Botao>
            </div>

            {erro && (
              <Aviso tom="alerta" className="mt-4">
                {erro}
              </Aviso>
            )}
          </>
        )}
      </div>
    </section>
  )
}
