import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ICONES, obterIcone } from '../lib/icones.js'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Search,
  Wallet,
  X,
} from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Modal from '../components/Modal.jsx'
import RecomendacoesIa from '../components/RecomendacoesIa.jsx'
import Revelar from '../components/Revelar.jsx'
import { Aviso, Botao, Carregando, Chip, EstadoVazio, TituloSecao } from '../components/ui.jsx'
import useRecurso from '../hooks/useRecurso.js'
import { buscarVagas } from '../services/api.js'
import { AREAS, nomeDaArea, obterArea } from '../data/areas.js'
import { MODALIDADES, PORTAIS_VAGAS } from '../data/vagas.js'
import { contemTermo, formatarData } from '../lib/texto.js'

/* ==========================================================================
   Card de vaga
   ========================================================================== */

function CartaoVaga({ vaga, aoAbrir, atraso }) {
  const area = obterArea(vaga.area)
  const Icone = obterIcone(area?.icone, ICONES.Briefcase)
  const local = [vaga.cidade, vaga.estado].filter(Boolean).join(' - ')

  return (
    <Revelar atraso={atraso}>
      {/*
        `min-w-0`: sem isso, o nome comprido da empresa (que usa `truncate`)
        define a largura mínima do card e estoura a grade no celular.
      */}
      <article className="cartao-elev flex h-full min-w-0 flex-col p-6 text-left">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elev-50 text-elev-700">
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            <Chip tom="marca">{nomeDaArea(vaga.area)}</Chip>
            {vaga.modalidade && <Chip>{vaga.modalidade}</Chip>}
          </div>
        </div>

        <h3 className="mt-4 text-base leading-snug font-bold">{vaga.titulo}</h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-areia-500">
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{vaga.empresa}</span>
        </p>

        <ul className="mt-4 flex-1 space-y-2 text-xs text-areia-600">
          {local && (
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-areia-400" aria-hidden="true" />
              {local}
            </li>
          )}
          {vaga.salario && (
            <li className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 shrink-0 text-areia-400" aria-hidden="true" />
              {vaga.salario}
            </li>
          )}
          {vaga.jornada && (
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-areia-400" aria-hidden="true" />
              {vaga.jornada}
            </li>
          )}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-areia-100 pt-4">
          {vaga.publicadaEm ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-areia-400">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {formatarData(vaga.publicadaEm)}
            </span>
          ) : (
            <span />
          )}

          <Botao onClick={() => aoAbrir(vaga)} variante="secundario" tamanho="sm">
            Ver detalhes
          </Botao>
        </div>
      </article>
    </Revelar>
  )
}

/* ==========================================================================
   Detalhe da vaga (modal)
   ========================================================================== */

function DetalheVaga({ vaga, aberto, aoFechar }) {
  if (!vaga) return null

  const local = [vaga.cidade, vaga.estado].filter(Boolean).join(' - ')

  const informacoes = [
    { Icone: MapPin, rotulo: 'Local', valor: local },
    { Icone: Wallet, rotulo: 'Remuneração', valor: vaga.salario },
    { Icone: Clock, rotulo: 'Jornada', valor: vaga.jornada },
    { Icone: GraduationCap, rotulo: 'Escolaridade', valor: vaga.escolaridade },
    { Icone: ICONES.UserRound, rotulo: 'Faixa etária', valor: vaga.idade },
    { Icone: ICONES.Building, rotulo: 'Modalidade', valor: vaga.modalidade },
  ].filter((item) => item.valor)

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={vaga.titulo}
      rodape={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-areia-500">
            A candidatura é feita no site do anunciante, sempre gratuita.
          </p>
          <Botao href={vaga.url} tamanho="sm">
            Candidatar-se
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Botao>
        </div>
      }
    >
      <header className="bg-elev-900 px-6 py-7 pr-16 text-white">
        <div className="flex flex-wrap gap-1.5">
          <Chip className="bg-white/15 text-white">{nomeDaArea(vaga.area)}</Chip>
          {vaga.exemplo && <Chip tom="alerta">Vaga de exemplo</Chip>}
        </div>

        <h2 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">{vaga.titulo}</h2>
        <p className="mt-1.5 text-sm text-white/70">{vaga.empresa}</p>
      </header>

      <div className="px-6 py-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {informacoes.map(({ Icone, rotulo, valor }) => (
            <div key={rotulo} className="flex items-start gap-3">
              <Icone className="mt-0.5 h-4 w-4 shrink-0 text-elev-700" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold tracking-wide text-areia-400 uppercase">
                  {rotulo}
                </dt>
                <dd className="text-sm font-medium text-areia-800">{valor}</dd>
              </div>
            </div>
          ))}
        </dl>

        {vaga.descricao && (
          <section className="mt-7">
            <h3 className="text-sm font-bold">Sobre a vaga</h3>
            <p className="mt-2 text-sm leading-relaxed text-areia-600">{vaga.descricao}</p>
          </section>
        )}

        {vaga.atividades?.length > 0 && (
          <section className="mt-7">
            <h3 className="text-sm font-bold">O que você vai fazer</h3>
            <ul className="mt-3 space-y-2">
              {vaga.atividades.map((atividade) => (
                <li key={atividade} className="flex items-start gap-2.5 text-sm text-areia-600">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-elev-600"
                    aria-hidden="true"
                  />
                  {atividade}
                </li>
              ))}
            </ul>
          </section>
        )}

        {vaga.requisitos?.length > 0 && (
          <section className="mt-7">
            <h3 className="text-sm font-bold">Requisitos</h3>
            <ul className="mt-3 space-y-2">
              {vaga.requisitos.map((requisito) => (
                <li key={requisito} className="flex items-start gap-2.5 text-sm text-areia-600">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-elev-600"
                    aria-hidden="true"
                  />
                  {requisito}
                </li>
              ))}
            </ul>
          </section>
        )}

        {vaga.beneficios?.length > 0 && (
          <section className="mt-7">
            <h3 className="text-sm font-bold">Benefícios</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {vaga.beneficios.map((beneficio) => (
                <li key={beneficio}>
                  <Chip tom="sucesso">{beneficio}</Chip>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8 rounded-xl bg-areia-50 p-5">
          <h3 className="text-sm font-bold">Como se candidatar</h3>
          <ol className="mt-3 space-y-2 text-sm text-areia-600">
            {[
              'Monte seu currículo em PDF na aba “Criar Currículo”.',
              'Cadastre-se gratuitamente no portal do anunciante.',
              'Envie a candidatura anexando o currículo atualizado.',
              'Acompanhe o e-mail e o WhatsApp — o retorno costuma vir por lá.',
            ].map((passo, i) => (
              <li key={passo} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-elev-700 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Modal>
  )
}

/* ==========================================================================
   Página
   ========================================================================== */

export default function Vagas() {
  const [parametros, setParametros] = useSearchParams()
  const { dados, carregando } = useRecurso(buscarVagas, [])

  const [busca, setBusca] = useState('')
  const [estado, setEstado] = useState('todos')
  const [modalidade, setModalidade] = useState('todas')
  const [selecionada, setSelecionada] = useState(null)

  const areaSelecionada = parametros.get('area') ?? 'todas'

  const definirArea = (id) => {
    const novos = new URLSearchParams(parametros)
    if (id === 'todas') novos.delete('area')
    else novos.set('area', id)
    setParametros(novos, { replace: true })
  }

  const vagas = dados?.vagas ?? []
  const usandoExemplos = dados?.fonte === 'exemplos'

  const estadosDisponiveis = useMemo(
    () => [...new Set(vagas.map((v) => v.estado).filter(Boolean))].sort(),
    [vagas],
  )

  const filtradas = useMemo(
    () =>
      vagas.filter((vaga) => {
        if (areaSelecionada !== 'todas' && vaga.area !== areaSelecionada) return false
        if (estado !== 'todos' && vaga.estado !== estado) return false
        if (modalidade !== 'todas' && vaga.modalidade !== modalidade) return false

        return contemTermo(busca, vaga.titulo, vaga.empresa, vaga.cidade, vaga.descricao)
      }),
    [vagas, areaSelecionada, estado, modalidade, busca],
  )

  const temFiltro =
    areaSelecionada !== 'todas' ||
    estado !== 'todos' ||
    modalidade !== 'todas' ||
    busca.trim() !== ''

  const limparFiltros = () => {
    setBusca('')
    setEstado('todos')
    setModalidade('todas')
    definirArea('todas')
  }

  return (
    <>
      <CabecalhoPagina
        icone="Briefcase"
        sobretitulo="Vagas"
        titulo="Vagas de Jovem Aprendiz"
        descricao="Encontre oportunidades de primeiro emprego com requisitos claros e o passo a passo da candidatura. O programa de aprendizagem é garantido por lei e feito exatamente para quem ainda não tem experiência."
      />

      <div className="container-elev py-12">
        {/* -------------------------------------------------------- Filtros */}
        <div className="rounded-2xl border border-areia-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-areia-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cargo, empresa ou cidade..."
                aria-label="Buscar vagas"
                className="campo-elev pl-10"
              />
            </div>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              aria-label="Filtrar por estado"
              className="campo-elev lg:w-40"
            >
              <option value="todos">Todos os estados</option>
              {estadosDisponiveis.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>

            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              aria-label="Filtrar por modalidade"
              className="campo-elev lg:w-44"
            >
              <option value="todas">Todas as modalidades</option>
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => definirArea('todas')}
              aria-pressed={areaSelecionada === 'todas'}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                areaSelecionada === 'todas'
                  ? 'bg-elev-700 text-white'
                  : 'bg-areia-100 text-areia-600 hover:bg-areia-200'
              }`}
            >
              Todas as áreas
            </button>

            {AREAS.map((area) => {
              const ativo = areaSelecionada === area.id
              const Icone = obterIcone(area.icone)

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => definirArea(area.id)}
                  aria-pressed={ativo}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    ativo
                      ? 'bg-elev-700 text-white'
                      : 'bg-areia-100 text-areia-600 hover:bg-areia-200'
                  }`}
                >
                  <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                  {area.nomeCurto}
                </button>
              )
            })}
          </div>
        </div>

        {/* ---------------------------------------- Aviso sobre a fonte */}
        {!carregando && usandoExemplos && (
          <Aviso tom="alerta" titulo="Estas são vagas de exemplo" className="mt-6">
            A busca ao vivo por vagas ainda não está ligada, então mostramos oportunidades
            representativas para você conhecer o formato e os requisitos. Para se candidatar de
            verdade, use os portais oficiais listados no fim desta página — todos gratuitos.
          </Aviso>
        )}

        {/* ---------------------------------------------------------- Lista */}
        {carregando ? (
          <Carregando texto="Buscando vagas..." />
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-areia-500" aria-live="polite">
                <strong className="font-semibold text-areia-800">{filtradas.length}</strong>{' '}
                {filtradas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
              </p>

              {temFiltro && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-elev-700 hover:underline"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpar filtros
                </button>
              )}
            </div>

            {filtradas.length === 0 ? (
              <div className="mt-6">
                <EstadoVazio
                  titulo="Nenhuma vaga com esses filtros"
                  descricao="Tente ampliar a busca — remover o filtro de estado costuma trazer bem mais resultados."
                  acao={
                    <Botao onClick={limparFiltros} variante="secundario">
                      Limpar filtros
                    </Botao>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtradas.map((vaga, i) => (
                  <CartaoVaga
                    key={vaga.id}
                    vaga={vaga}
                    aoAbrir={setSelecionada}
                    atraso={Math.min(i, 6) * 0.05}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ------------------------------------------ Recomendação por IA */}
        {!carregando && <RecomendacoesIa aoAbrirVaga={setSelecionada} />}

        {/* -------------------------------------------------------- Portais */}
        <section className="mt-20">
          <Revelar>
            <TituloSecao
              sobretitulo="Onde se candidatar"
              titulo="Portais oficiais de vagas"
              descricao="Estes são os canais onde as vagas de aprendiz são realmente publicadas. O cadastro é gratuito em todos — desconfie de qualquer site que cobre para se candidatar."
            />
          </Revelar>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAIS_VAGAS.map((portal, i) => (
              <Revelar key={portal.nome} atraso={i * 0.05}>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cartao-elev group flex h-full flex-col p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold">{portal.nome}</h3>
                    <ExternalLink
                      className="h-4 w-4 shrink-0 text-areia-400 transition group-hover:text-elev-700"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-areia-600">{portal.descricao}</p>
                </a>
              </Revelar>
            ))}
          </div>
        </section>
      </div>

      <DetalheVaga
        vaga={selecionada}
        aberto={Boolean(selecionada)}
        aoFechar={() => setSelecionada(null)}
      />
    </>
  )
}
