import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { obterIcone } from '../lib/icones.js'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Compass,
  RotateCcw,
  Timer,
} from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Revelar from '../components/Revelar.jsx'
import { Aviso, Botao, Progresso, TituloSecao } from '../components/ui.jsx'
import useArmazenamentoLocal from '../hooks/useArmazenamentoLocal.js'
import { obterArea } from '../data/areas.js'
import { ESCALA, PERGUNTAS, calcularResultado, interpretarResultado } from '../data/vocacional.js'

/* ==========================================================================
   Tela 1 — apresentação
   ========================================================================== */

function Apresentacao({ aoComecar, temResultadoSalvo, aoVerResultado }) {
  return (
    <Revelar className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-areia-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-elev-50 text-elev-700">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>

        <h2 className="mt-6 text-2xl font-bold">Vamos descobrir o seu perfil</h2>
        <p className="mt-3 leading-relaxed text-areia-600">
          São {PERGUNTAS.length} afirmações. Para cada uma, diga o quanto ela combina com você. Não
          existe resposta certa ou errada — responda pensando em como você realmente é, não em como
          gostaria de ser.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-areia-500">
          <span className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-elev-600" aria-hidden="true" />
            Cerca de 3 minutos
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-elev-600" aria-hidden="true" />
            Sem cadastro
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-elev-600" aria-hidden="true" />
            Resultado na hora
          </span>
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Botao onClick={aoComecar} tamanho="lg">
            Começar o teste
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Botao>

          {temResultadoSalvo && (
            <Botao onClick={aoVerResultado} variante="contorno" tamanho="lg">
              Ver meu último resultado
            </Botao>
          )}
        </div>
      </div>
    </Revelar>
  )
}

/* ==========================================================================
   Tela 2 — perguntas
   ========================================================================== */

function Questionario({ indice, respostas, aoResponder, aoVoltar, aoAvancar, aoSair }) {
  const semMovimento = useReducedMotion()
  const pergunta = PERGUNTAS[indice]
  const respondida = respostas[pergunta.id]
  const progresso = (indice / PERGUNTAS.length) * 100

  // Animação apenas de entrada, sem `exit`.
  //
  // Com animação de saída, a pergunta antiga permanece montada durante a
  // transição enquanto o contador acima já mostra a próxima — o usuário vê
  // "Pergunta 2 de 18" com o texto da pergunta 1. Pior: um clique nesse
  // intervalo gravaria a resposta na pergunta errada. Trocando na hora, o
  // contador e o enunciado nunca ficam fora de sincronia.
  const animacao = semMovimento
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.25 },
      }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progresso */}
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-areia-700">
            Pergunta {indice + 1} de {PERGUNTAS.length}
          </span>
          <span className="text-areia-500">{Math.round(progresso)}% concluído</span>
        </div>
        <Progresso valor={progresso} rotulo="Progresso do teste vocacional" />
      </div>

      <div className="rounded-2xl border border-areia-200 bg-white p-7 shadow-sm sm:p-9">
        <motion.div key={pergunta.id} {...animacao}>
          <fieldset>
            <legend className="text-lg leading-snug font-semibold text-areia-900 sm:text-xl">
              {pergunta.texto}
            </legend>

            <div className="mt-7 space-y-2.5">
              {ESCALA.map((opcao) => {
                const ativo = respondida === opcao.valor

                return (
                  <label
                    key={opcao.valor}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3.5 transition ${
                      ativo
                        ? 'border-elev-600 bg-elev-50 ring-2 ring-elev-600/15'
                        : 'border-areia-200 hover:border-elev-300 hover:bg-areia-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pergunta-${pergunta.id}`}
                      value={opcao.valor}
                      checked={ativo}
                      onChange={() => aoResponder(pergunta.id, opcao.valor)}
                      className="sr-only"
                    />

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        ativo ? 'border-elev-700 bg-elev-700' : 'border-areia-300'
                      }`}
                      aria-hidden="true"
                    >
                      {ativo && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>

                    <span
                      className={`text-sm font-medium ${ativo ? 'text-elev-900' : 'text-areia-700'}`}
                    >
                      {opcao.rotulo}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </motion.div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Botao onClick={indice === 0 ? aoSair : aoVoltar} variante="fantasma">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {indice === 0 ? 'Sair' : 'Anterior'}
        </Botao>

        <Botao onClick={aoAvancar} disabled={!respondida}>
          {indice === PERGUNTAS.length - 1 ? 'Ver resultado' : 'Próxima'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Botao>
      </div>

      {!respondida && (
        <p className="mt-3 text-center text-xs text-areia-400">Escolha uma opção para continuar.</p>
      )}
    </div>
  )
}

/* ==========================================================================
   Tela 3 — resultado
   ========================================================================== */

function AreaPrincipal({ item }) {
  const area = obterArea(item.area)
  if (!area) return null

  const Icone = obterIcone(area.icone, Compass)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-elev-900 p-8 text-white sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-elev-600/30 blur-3xl"
      />

      <div className="relative">
        <p className="text-xs font-bold tracking-[0.16em] text-elev-200 uppercase">
          Sua maior afinidade
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Icone className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-2xl font-extrabold text-white sm:text-3xl">{area.nome}</h3>
            <p className="text-sm text-elev-200">{item.percentual}% de afinidade</p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-white/80">{area.descricao}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-bold text-white">Carreiras para explorar</h4>
            <ul className="mt-3 space-y-2">
              {area.carreiras.map((carreira) => (
                <li key={carreira} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-elev-300" aria-hidden="true" />
                  {carreira}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">O que costuma marcar esse perfil</h4>
            <ul className="mt-3 space-y-2">
              {area.caracteristicas.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-elev-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Botao para={`/cursos?area=${area.id}`} variante="claro">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Cursos de {area.nomeCurto}
          </Botao>
          <Botao
            para={`/vagas?area=${area.id}`}
            variante="fantasma"
            className="border border-white/25 bg-white/5 text-white hover:bg-white/10"
          >
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Vagas dessa área
          </Botao>
        </div>
      </div>
    </div>
  )
}

function Resultado({ ranking, aoRefazer }) {
  const leitura = interpretarResultado(ranking)
  const demais = ranking.slice(1)

  return (
    <div className="mx-auto max-w-3xl">
      <Revelar>
        <AreaPrincipal item={ranking[0]} />
      </Revelar>

      {leitura && (
        <Revelar atraso={0.1} className="mt-6">
          <Aviso tom="info" titulo="Como ler o seu resultado">
            {leitura}
          </Aviso>
        </Revelar>
      )}

      <Revelar atraso={0.15} className="mt-10">
        <h3 className="text-lg font-bold">Afinidade com as demais áreas</h3>
        <p className="mt-1 text-sm text-areia-500">
          Nenhuma área fica de fora — todas dizem algo sobre o seu perfil.
        </p>

        <ul className="mt-6 space-y-5">
          {demais.map((item) => {
            const area = obterArea(item.area)
            if (!area) return null
            const Icone = obterIcone(area.icone, Compass)

            return (
              <li key={item.area}>
                <div className="mb-2 flex items-center gap-3">
                  <Icone className="h-4.5 w-4.5 shrink-0 text-elev-700" aria-hidden="true" />
                  <span className="flex-1 text-sm font-semibold text-areia-800">{area.nome}</span>
                  <span className="text-sm font-bold text-areia-500 tabular-nums">
                    {item.percentual}%
                  </span>
                </div>
                <Progresso valor={item.percentual} rotulo={`Afinidade com ${area.nome}`} />
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <Link
                    to={`/cursos?area=${area.id}`}
                    className="font-semibold text-elev-700 hover:underline"
                  >
                    Ver cursos
                  </Link>
                  <Link
                    to={`/vagas?area=${area.id}`}
                    className="font-semibold text-elev-700 hover:underline"
                  >
                    Ver vagas
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </Revelar>

      <Revelar atraso={0.2} className="mt-12">
        <div className="rounded-2xl border border-areia-200 bg-areia-50 p-7 text-center">
          <h3 className="text-lg font-bold">E agora, o que fazer com isso?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-areia-600">
            Este teste é orientativo: ele abre caminhos, não fecha portas. O melhor próximo passo é
            testar na prática — faça um curso gratuito curto da sua área principal e veja se você
            gosta do assunto no dia a dia.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Botao para="/curriculo" variante="primario">
              Montar meu currículo
            </Botao>
            <Botao onClick={aoRefazer} variante="contorno">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Refazer o teste
            </Botao>
          </div>
        </div>
      </Revelar>
    </div>
  )
}

/* ==========================================================================
   Página
   ========================================================================== */

export default function TesteVocacional() {
  const [respostas, setRespostas, limparRespostas] = useArmazenamentoLocal('elev:vocacional', {})
  const [etapa, setEtapa] = useState('intro')
  const [indice, setIndice] = useState(0)

  const completo = Object.keys(respostas).length === PERGUNTAS.length
  const ranking = useMemo(() => calcularResultado(respostas), [respostas])

  const responder = (idPergunta, valor) => {
    setRespostas((atual) => ({ ...atual, [idPergunta]: valor }))
  }

  const avancar = () => {
    if (indice < PERGUNTAS.length - 1) {
      setIndice((i) => i + 1)
    } else {
      setEtapa('resultado')
    }
  }

  const comecar = () => {
    // Retoma na primeira pergunta ainda não respondida.
    const pendente = PERGUNTAS.findIndex((p) => !respostas[p.id])
    setIndice(pendente === -1 ? 0 : pendente)
    setEtapa('perguntas')
  }

  const refazer = () => {
    limparRespostas()
    setIndice(0)
    setEtapa('perguntas')
  }

  return (
    <>
      <CabecalhoPagina
        icone="Compass"
        sobretitulo="Teste vocacional"
        titulo="Descubra as áreas que combinam com você"
        descricao="Um questionário curto sobre seus interesses e sua forma de trabalhar. No final, você recebe as áreas com maior afinidade, sugestões de carreira e os cursos gratuitos para começar."
      />

      <div className="container-elev py-12 sm:py-16">
        {etapa === 'intro' && (
          <Apresentacao
            aoComecar={comecar}
            temResultadoSalvo={completo}
            aoVerResultado={() => setEtapa('resultado')}
          />
        )}

        {etapa === 'perguntas' && (
          <Questionario
            indice={indice}
            respostas={respostas}
            aoResponder={responder}
            aoVoltar={() => setIndice((i) => Math.max(0, i - 1))}
            aoAvancar={avancar}
            aoSair={() => setEtapa('intro')}
          />
        )}

        {etapa === 'resultado' &&
          (ranking.length > 0 ? (
            <Resultado ranking={ranking} aoRefazer={refazer} />
          ) : (
            <div className="mx-auto max-w-xl text-center">
              <TituloSecao
                titulo="Ainda não há respostas"
                descricao="Responda ao questionário para ver o seu resultado."
                centralizado
              />
              <div className="mt-6 flex justify-center">
                <Botao onClick={comecar}>Fazer o teste</Botao>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
