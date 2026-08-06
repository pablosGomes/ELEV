import { useState } from 'react'
import { ICONES, obterIcone } from '../lib/icones.js'
import { ChevronDown, Clock, ExternalLink, PlayCircle } from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Revelar from '../components/Revelar.jsx'
import { Botao, Chip, TituloSecao } from '../components/ui.jsx'
import { CATEGORIAS_GUIA, GUIAS, VIDEO_AULAS } from '../data/dicas.js'

/* ==========================================================================
   Guia expansível
   ========================================================================== */

function Guia({ guia, aberto, aoAlternar }) {
  const Icone = obterIcone(guia.icone, ICONES.BookOpen)
  const idConteudo = `guia-${guia.id}`

  return (
    <article className="overflow-hidden rounded-2xl border border-areia-200 bg-white shadow-sm">
      <h3>
        <button
          type="button"
          onClick={aoAlternar}
          aria-expanded={aberto}
          aria-controls={idConteudo}
          className="flex w-full items-start gap-4 p-6 text-left transition hover:bg-areia-50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-elev-50 text-elev-700">
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <Chip tom="marca">{guia.categoria}</Chip>
              <span className="inline-flex items-center gap-1 text-[11px] text-areia-400">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {guia.tempoLeitura} min de leitura
              </span>
            </span>

            <span className="mt-2 block text-lg leading-snug font-bold text-areia-900">
              {guia.titulo}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-areia-600">{guia.resumo}</span>
          </span>

          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-areia-400 transition-transform duration-300 ${
              aberto ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      {aberto && (
        <div id={idConteudo} className="animate-fade-up border-t border-areia-100 px-6 pt-6 pb-8">
          <div className="space-y-7">
            {guia.secoes.map((secao) => (
              <section key={secao.titulo}>
                <h4 className="text-sm font-bold tracking-wide text-elev-800 uppercase">
                  {secao.titulo}
                </h4>

                {secao.paragrafos?.map((paragrafo) => (
                  <p key={paragrafo} className="mt-3 text-sm leading-relaxed text-areia-600">
                    {paragrafo}
                  </p>
                ))}

                {secao.lista && (
                  <ul className="mt-3 space-y-2.5">
                    {secao.lista.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-areia-600">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-elev-600"
                          aria-hidden="true"
                        />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

/* ==========================================================================
   Vídeo-aula
   ========================================================================== */

function VideoAula({ video, atraso }) {
  const [tocando, setTocando] = useState(false)
  const linkBusca = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.busca)}`

  // Enquanto não houver um vídeo definido, o card leva para uma busca no
  // YouTube sobre o tema — um link que nunca fica quebrado.
  if (!video.youtubeId) {
    return (
      <Revelar atraso={atraso}>
        <a
          href={linkBusca}
          target="_blank"
          rel="noopener noreferrer"
          className="cartao-elev group flex h-full flex-col overflow-hidden"
        >
          <div className="relative flex aspect-video items-center justify-center bg-elev-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-elev-600/30 blur-2xl"
            />
            <PlayCircle
              className="relative h-12 w-12 text-white/80 transition group-hover:scale-110 group-hover:text-white"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-1 flex-col p-5">
            <Chip tom="marca" className="self-start">
              {video.tema}
            </Chip>
            <h3 className="mt-3 text-base leading-snug font-bold">{video.titulo}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-areia-600">{video.descricao}</p>

            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-elev-700">
              Buscar aulas sobre o tema
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </a>
      </Revelar>
    )
  }

  return (
    <Revelar atraso={atraso}>
      <article className="cartao-elev flex h-full flex-col overflow-hidden">
        <div className="relative aspect-video bg-areia-900">
          {tocando ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
              title={video.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setTocando(true)}
              className="group absolute inset-0 flex items-center justify-center"
              aria-label={`Reproduzir: ${video.titulo}`}
            >
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-areia-900/35 transition group-hover:bg-areia-900/20" />
              <PlayCircle
                className="relative h-14 w-14 text-white drop-shadow-lg transition group-hover:scale-110"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <Chip tom="marca" className="self-start">
            {video.tema}
          </Chip>
          <h3 className="mt-3 text-base leading-snug font-bold">{video.titulo}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-areia-600">{video.descricao}</p>

          {/* O vídeo é de terceiro: o canal aparece para o crédito ficar visível
              e para o usuário saber de quem é a orientação que vai receber. */}
          {video.canal && (
            <p className="mt-4 flex items-center gap-1.5 border-t border-areia-100 pt-3 text-xs text-areia-500">
              <PlayCircle className="h-3.5 w-3.5 shrink-0 text-areia-400" aria-hidden="true" />
              <span className="min-w-0 truncate">{video.canal}</span>
            </p>
          )}
        </div>
      </article>
    </Revelar>
  )
}

/* ==========================================================================
   Página
   ========================================================================== */

export default function Dicas() {
  const [categoria, setCategoria] = useState('todas')
  const [abertos, setAbertos] = useState([GUIAS[0]?.id])

  const alternarGuia = (id) =>
    setAbertos((atual) => (atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id]))

  const guiasFiltrados =
    categoria === 'todas' ? GUIAS : GUIAS.filter((g) => g.categoria === categoria)

  return (
    <>
      <CabecalhoPagina
        icone="Lightbulb"
        sobretitulo="Dicas e vídeo-aulas"
        titulo="O que ninguém te conta antes da primeira entrevista"
        descricao="Guias práticos sobre como montar o currículo, quais erros eliminam candidatos, como se preparar para a entrevista e o caminho até o primeiro emprego."
      />

      <div className="container-elev py-12">
        {/* ------------------------------------------------------- Filtros */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoria('todas')}
            aria-pressed={categoria === 'todas'}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              categoria === 'todas'
                ? 'bg-elev-700 text-white'
                : 'bg-areia-100 text-areia-600 hover:bg-areia-200'
            }`}
          >
            Todos os temas
          </button>

          {CATEGORIAS_GUIA.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoria(cat)}
              aria-pressed={categoria === cat}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                categoria === cat
                  ? 'bg-elev-700 text-white'
                  : 'bg-areia-100 text-areia-600 hover:bg-areia-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --------------------------------------------------------- Guias */}
        <div className="mt-8 space-y-5">
          {guiasFiltrados.map((guia, i) => (
            <Revelar key={guia.id} atraso={Math.min(i, 4) * 0.05}>
              <Guia
                guia={guia}
                aberto={abertos.includes(guia.id)}
                aoAlternar={() => alternarGuia(guia.id)}
              />
            </Revelar>
          ))}
        </div>

        {/* -------------------------------------------------- Vídeo-aulas */}
        <section className="mt-20">
          <Revelar>
            <TituloSecao
              sobretitulo="Vídeo-aulas"
              titulo="Aprenda vendo"
              descricao="Seis aulas gratuitas no YouTube, de canais brasileiros, sobre currículo, entrevista, direitos do aprendiz, Excel, LinkedIn e postura no trabalho. Toque para assistir aqui mesmo."
            />
          </Revelar>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VIDEO_AULAS.map((video, i) => (
              <VideoAula key={video.id} video={video} atraso={Math.min(i, 6) * 0.05} />
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- Chamada final */}
        <Revelar className="mt-20">
          <div className="rounded-3xl bg-areia-50 px-8 py-14 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Já sabe o que fazer. Agora é colocar em prática.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-areia-600">
              Comece pelo currículo — ele é o primeiro contato que a empresa tem com você.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Botao para="/curriculo" tamanho="lg">
                Criar meu currículo
              </Botao>
              <Botao para="/vagas" variante="contorno" tamanho="lg">
                Ver vagas abertas
              </Botao>
            </div>
          </div>
        </Revelar>
      </div>
    </>
  )
}
