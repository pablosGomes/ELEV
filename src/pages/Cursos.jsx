import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ICONES, obterIcone } from '../lib/icones.js'
import { Award, Clock, ExternalLink, Search, X } from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Revelar from '../components/Revelar.jsx'
import { Botao, Carregando, Chip, EstadoVazio } from '../components/ui.jsx'
import useRecurso from '../hooks/useRecurso.js'
import { buscarCursos } from '../services/api.js'
import { AREAS, nomeDaArea, obterArea } from '../data/areas.js'
import { contemTermo } from '../lib/texto.js'

function CartaoCurso({ curso, atraso }) {
  const area = obterArea(curso.area)
  const Icone = obterIcone(area?.icone, ICONES.BookOpen)

  return (
    <Revelar atraso={atraso}>
      <article className="cartao-elev flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-elev-50 text-elev-700">
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>
          <Chip tom="marca">{nomeDaArea(curso.area)}</Chip>
        </div>

        <h3 className="mt-4 text-base leading-snug font-bold">{curso.titulo}</h3>
        <p className="mt-1 text-xs font-semibold text-elev-700">{curso.provedor}</p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-areia-600">{curso.descricao}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {curso.tags.slice(0, 3).map((tag) => (
            <li key={tag}>
              <Chip>{tag}</Chip>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-4 border-t border-areia-100 pt-4 text-xs text-areia-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {curso.cargaHoraria}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ICONES.BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            {curso.nivel}
          </span>
          {curso.certificado && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              Certificado
            </span>
          )}
        </div>

        <Botao href={curso.url} variante="secundario" tamanho="sm" className="mt-5 w-full">
          Acessar curso
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Botao>
      </article>
    </Revelar>
  )
}

export default function Cursos() {
  const [parametros, setParametros] = useSearchParams()
  const { dados, carregando } = useRecurso(buscarCursos, [])

  const [busca, setBusca] = useState('')
  const [somenteCertificado, setSomenteCertificado] = useState(false)

  // A área fica na URL para que o teste vocacional possa linkar direto
  // para "os cursos da sua área" (ex.: /cursos?area=tecnologia).
  const areaSelecionada = parametros.get('area') ?? 'todas'

  const definirArea = (id) => {
    const novos = new URLSearchParams(parametros)
    if (id === 'todas') novos.delete('area')
    else novos.set('area', id)
    setParametros(novos, { replace: true })
  }

  const cursos = dados?.cursos ?? []

  const filtrados = useMemo(
    () =>
      cursos.filter((curso) => {
        if (areaSelecionada !== 'todas' && curso.area !== areaSelecionada) return false
        if (somenteCertificado && !curso.certificado) return false

        return contemTermo(
          busca,
          curso.titulo,
          curso.descricao,
          curso.provedor,
          curso.tags.join(' '),
        )
      }),
    [cursos, areaSelecionada, somenteCertificado, busca],
  )

  const temFiltro = areaSelecionada !== 'todas' || somenteCertificado || busca.trim() !== ''

  const limparFiltros = () => {
    setBusca('')
    setSomenteCertificado(false)
    definirArea('todas')
  }

  return (
    <>
      <CabecalhoPagina
        icone="BookOpen"
        sobretitulo="Cursos gratuitos"
        titulo="Estude de graça, com certificado"
        descricao="Cursos de instituições reconhecidas — SENAI, Sebrae, Fundação Bradesco, FGV, Google e outras — organizados por área profissional. Todos gratuitos de verdade, sem pegadinha."
      />

      <div className="container-elev py-12">
        {/* ------------------------------------------------------- Filtros */}
        <div className="rounded-2xl border border-areia-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-areia-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por curso, tema ou instituição..."
                aria-label="Buscar cursos"
                className="campo-elev pl-10"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-areia-700 select-none">
              <input
                type="checkbox"
                checked={somenteCertificado}
                onChange={(e) => setSomenteCertificado(e.target.checked)}
                className="h-4 w-4 rounded border-areia-300 text-elev-700 focus:ring-elev-600"
              />
              Somente com certificado
            </label>
          </div>

          {/* Áreas */}
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

        {/* -------------------------------------------------------- Lista */}
        {carregando ? (
          <Carregando texto="Carregando cursos..." />
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-areia-500" aria-live="polite">
                <strong className="font-semibold text-areia-800">{filtrados.length}</strong>{' '}
                {filtrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
                {areaSelecionada !== 'todas' && ` em ${nomeDaArea(areaSelecionada)}`}
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

            {filtrados.length === 0 ? (
              <div className="mt-6">
                <EstadoVazio
                  titulo="Nenhum curso encontrado"
                  descricao="Tente outro termo de busca ou remova alguns filtros para ver mais opções."
                  acao={
                    <Botao onClick={limparFiltros} variante="secundario">
                      Limpar filtros
                    </Botao>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtrados.map((curso, i) => (
                  <CartaoCurso key={curso.id} curso={curso} atraso={Math.min(i, 6) * 0.05} />
                ))}
              </div>
            )}
          </>
        )}

        {/* --------------------------------------------------- Observação */}
        <p className="mt-10 text-xs leading-relaxed text-areia-400">
          Os links levam para a página oficial de cada instituição. O ELEV não cobra nada e não
          intermedia matrículas — a inscrição é feita diretamente no site do provedor do curso.
        </p>
      </div>
    </>
  )
}
