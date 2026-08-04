import { forwardRef } from 'react'
import { Globe, Mail, MapPin, Phone } from 'lucide-react'

import { iniciais } from '../../lib/texto.js'

/**
 * Prévia do currículo — é exatamente este nó que vira o PDF.
 *
 * Regras que este componente segue de propósito:
 *   - largura fixa de 794px (A4 a 96dpi), para o PDF sair fiel;
 *   - uma única coluna, que é o formato mais legível para leitores automáticos
 *     de currículo usados pelas empresas;
 *   - nada de sombra, gradiente ou transparência, que costumam sair estranhos
 *     na rasterização;
 *   - seções vazias simplesmente não aparecem.
 */

const LARGURA_A4 = 794

function Secao({ titulo, children }) {
  return (
    <section className="mt-7 break-inside-avoid">
      <h2 className="border-b-2 border-[#9b1b30] pb-1.5 text-[13px] font-bold tracking-[0.14em] text-[#58101c] uppercase">
        {titulo}
      </h2>
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

function Periodo({ inicio, fim, atual }) {
  const texto = [inicio, atual ? 'Atual' : fim].filter(Boolean).join(' — ')
  if (!texto) return null

  return <span className="shrink-0 text-[11.5px] font-medium text-[#71717a]">{texto}</span>
}

const PreviaCurriculo = forwardRef(function PreviaCurriculo({ curriculo }, ref) {
  const { dados, objetivo, formacoes, experiencias, cursos, habilidades, idiomas } = curriculo

  const local = [dados.cidade, dados.estado].filter(Boolean).join(' - ')
  const nome = dados.nome.trim() || 'Seu nome completo'
  const cargo = dados.cargo.trim() || 'Cargo desejado'

  return (
    <div
      ref={ref}
      style={{ width: LARGURA_A4, minHeight: 1123 }}
      className="bg-white font-sans text-[#27272a]"
    >
      {/* ------------------------------------------------------- Cabeçalho */}
      <header className="bg-[#58101c] px-12 py-9 text-white">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-[20px] font-bold text-white">
            {iniciais(dados.nome) || 'SN'}
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-[28px] leading-tight font-extrabold text-white">
              {nome}
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#f7a6b4]">{cargo}</p>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-white/85">
          {dados.telefone && (
            <li className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {dados.telefone}
            </li>
          )}
          {dados.email && (
            <li className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {dados.email}
            </li>
          )}
          {local && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {local}
            </li>
          )}
          {dados.linkedin && (
            <li className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {dados.linkedin}
            </li>
          )}
        </ul>
      </header>

      {/* ---------------------------------------------------------- Corpo */}
      <div className="px-12 pt-8 pb-12">
        {objetivo.trim() && (
          <Secao titulo="Objetivo">
            <p className="text-[12.5px] leading-relaxed text-[#3f3f46]">{objetivo}</p>
          </Secao>
        )}

        {experiencias.length > 0 && (
          <Secao titulo="Experiência">
            <ul className="space-y-4">
              {experiencias.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[13px] font-bold text-[#18181b]">
                      {item.cargo || 'Cargo'}
                    </h3>
                    <Periodo inicio={item.inicio} fim={item.fim} atual={item.atual} />
                  </div>
                  {item.empresa && (
                    <p className="text-[12px] font-semibold text-[#9b1b30]">{item.empresa}</p>
                  )}
                  {item.descricao && (
                    <p className="mt-1 text-[12px] leading-relaxed text-[#52525b]">
                      {item.descricao}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Secao>
        )}

        {formacoes.length > 0 && (
          <Secao titulo="Formação">
            <ul className="space-y-3">
              {formacoes.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[13px] font-bold text-[#18181b]">
                      {item.curso || 'Curso'}
                      {item.situacao && (
                        <span className="ml-2 text-[11px] font-medium text-[#71717a]">
                          ({item.situacao})
                        </span>
                      )}
                    </h3>
                    <Periodo inicio={item.inicio} fim={item.fim} />
                  </div>
                  {item.instituicao && (
                    <p className="text-[12px] text-[#52525b]">{item.instituicao}</p>
                  )}
                </li>
              ))}
            </ul>
          </Secao>
        )}

        {cursos.length > 0 && (
          <Secao titulo="Cursos complementares">
            <ul className="space-y-2">
              {cursos.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4">
                  <span className="text-[12.5px] text-[#3f3f46]">
                    <strong className="font-semibold text-[#18181b]">{item.nome || 'Curso'}</strong>
                    {item.instituicao && ` — ${item.instituicao}`}
                  </span>
                  <span className="shrink-0 text-[11.5px] font-medium text-[#71717a]">
                    {[item.cargaHoraria && `${item.cargaHoraria}h`, item.ano]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </Secao>
        )}

        {habilidades.length > 0 && (
          <Secao titulo="Habilidades">
            <ul className="flex flex-wrap gap-2">
              {habilidades.map((habilidade) => (
                <li
                  key={habilidade}
                  className="rounded-md bg-[#fde3e7] px-2.5 py-1 text-[11.5px] font-medium text-[#7a1626]"
                >
                  {habilidade}
                </li>
              ))}
            </ul>
          </Secao>
        )}

        {idiomas.length > 0 && (
          <Secao titulo="Idiomas">
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {idiomas.map((item) => (
                <li key={item.id} className="text-[12.5px] text-[#3f3f46]">
                  <strong className="font-semibold text-[#18181b]">{item.idioma}</strong>
                  {item.nivel && ` — ${item.nivel}`}
                </li>
              ))}
            </ul>
          </Secao>
        )}
      </div>
    </div>
  )
})

export { LARGURA_A4 }
export default PreviaCurriculo
