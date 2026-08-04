import { useId } from 'react'
import { Plus, Trash2 } from 'lucide-react'

/** Campos de formulário reutilizados pelo gerador de currículo. */

export function Campo({ rotulo, dica, className = '', ...props }) {
  const id = useId()

  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo-elev">
        {rotulo}
      </label>
      <input id={id} className="campo-elev" {...props} />
      {dica && <p className="mt-1.5 text-xs text-areia-400">{dica}</p>}
    </div>
  )
}

export function AreaTexto({ rotulo, dica, contador, valor, className = '', ...props }) {
  const id = useId()

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="rotulo-elev">
          {rotulo}
        </label>
        {contador && (
          <span className="mb-1.5 text-xs text-areia-400 tabular-nums">
            {valor?.length ?? 0} caracteres
          </span>
        )}
      </div>
      <textarea id={id} value={valor} className="campo-elev resize-y" {...props} />
      {dica && <p className="mt-1.5 text-xs text-areia-400">{dica}</p>}
    </div>
  )
}

export function Selecao({ rotulo, opcoes, className = '', ...props }) {
  const id = useId()

  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo-elev">
        {rotulo}
      </label>
      <select id={id} className="campo-elev" {...props}>
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Bloco de seção do formulário, com título, descrição e botão de adicionar. */
export function SecaoFormulario({
  titulo,
  descricao,
  icone: Icone,
  aoAdicionar,
  rotuloAdicionar,
  children,
}) {
  return (
    <section className="rounded-2xl border border-areia-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icone && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-elev-50 text-elev-700">
              <Icone className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-base font-bold">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-xs text-areia-500">{descricao}</p>}
          </div>
        </div>

        {aoAdicionar && (
          <button
            type="button"
            onClick={aoAdicionar}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-elev-200 bg-elev-50 px-3 py-1.5 text-xs font-semibold text-elev-800 transition hover:bg-elev-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {rotuloAdicionar ?? 'Adicionar'}
          </button>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Card de um item de lista (uma experiência, uma formação...), com remover. */
export function ItemLista({ titulo, aoRemover, children }) {
  return (
    <div className="relative rounded-xl border border-areia-200 bg-areia-50/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold tracking-wide text-areia-500 uppercase">{titulo}</span>
        <button
          type="button"
          onClick={aoRemover}
          className="rounded-md p-1.5 text-areia-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Remover ${titulo}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  )
}

/** Mensagem exibida quando uma seção de lista ainda está vazia. */
export function ListaVazia({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-areia-300 px-4 py-6 text-center text-sm text-areia-400">
      {children}
    </p>
  )
}
