import { ICONES, obterIcone } from '../lib/icones.js'

/**
 * Cabeçalho padrão das abas internas: fundo vinho, ícone, título e subtítulo.
 * Mantém a identidade visual consistente em todas as seções do site.
 */
export default function CabecalhoPagina({ icone, sobretitulo, titulo, descricao, children }) {
  const Icone = obterIcone(icone, ICONES.Sparkles)

  return (
    <section className="relative overflow-hidden bg-elev-900 text-white">
      {/* Brilhos decorativos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-elev-600/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-elev-500/20 blur-3xl"
      />

      <div className="container-elev relative py-14 sm:py-16">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Icone className="h-5.5 w-5.5" aria-hidden="true" />
          </span>
          {sobretitulo && (
            <p className="text-xs font-bold tracking-[0.16em] text-elev-200 uppercase">
              {sobretitulo}
            </p>
          )}
        </div>

        <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {titulo}
        </h1>

        {descricao && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {descricao}
          </p>
        )}

        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  )
}
