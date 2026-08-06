import { Link } from 'react-router-dom'
import { AlertCircle, Info, Loader2, SearchX } from 'lucide-react'

/* ==========================================================================
   Botão
   Renderiza <Link> (prop `para`), <a> (prop `href`) ou <button>, mantendo
   exatamente o mesmo visual nos três casos.
   ========================================================================== */

const VARIANTES = {
  primario:
    'bg-elev-700 text-white shadow-elev hover:bg-elev-800 active:bg-elev-900 disabled:bg-areia-300 disabled:shadow-none',
  secundario:
    'bg-elev-50 text-elev-800 border border-elev-200 hover:bg-elev-100 hover:border-elev-300',
  contorno:
    'border border-areia-300 bg-white text-areia-700 hover:border-elev-400 hover:text-elev-700',
  fantasma: 'text-areia-600 hover:bg-areia-100 hover:text-areia-900',
  claro: 'bg-white text-elev-800 shadow-lg hover:bg-elev-50',
}

const TAMANHOS_BOTAO = {
  sm: 'px-3.5 py-2 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2.5',
}

export function Botao({
  children,
  variante = 'primario',
  tamanho = 'md',
  para,
  href,
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
    // O recuo no clique é o retorno tátil que falta num botão de tela: sem ele
    // o usuário só descobre que o clique valeu quando a próxima tela aparece.
    'active:scale-[0.97] disabled:active:scale-100',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTES[variante] ?? VARIANTES.primario,
    TAMANHOS_BOTAO[tamanho] ?? TAMANHOS_BOTAO.md,
    className,
  ].join(' ')

  if (para) {
    return (
      <Link to={para} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

/* ==========================================================================
   Chip / etiqueta
   ========================================================================== */

export function Chip({ children, tom = 'neutro', className = '' }) {
  const tons = {
    neutro: 'bg-areia-100 text-areia-600',
    marca: 'bg-elev-50 text-elev-700 ring-1 ring-elev-100',
    sucesso: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    alerta: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
        tons[tom] ?? tons.neutro
      } ${className}`}
    >
      {children}
    </span>
  )
}

/* ==========================================================================
   Cabeçalho de seção
   ========================================================================== */

export function TituloSecao({
  sobretitulo,
  titulo,
  descricao,
  centralizado = false,
  className = '',
}) {
  return (
    <div className={`${centralizado ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {sobretitulo && (
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-elev-700 uppercase">
          {sobretitulo}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h2>
      {descricao && <p className="mt-3 text-areia-600 sm:text-lg">{descricao}</p>}
    </div>
  )
}

/* ==========================================================================
   Estados: carregando, vazio, aviso
   ========================================================================== */

export function Carregando({ texto = 'Carregando...', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-16 text-areia-500 ${className}`}
    >
      <Loader2 className="h-7 w-7 animate-spin text-elev-600" aria-hidden="true" />
      <p className="text-sm font-medium">{texto}</p>
    </div>
  )
}

export function EstadoVazio({ titulo, descricao, acao, icone: Icone = SearchX }) {
  return (
    <div className="rounded-2xl border border-dashed border-areia-300 bg-areia-50 px-6 py-14 text-center">
      <Icone className="mx-auto h-9 w-9 text-areia-400" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold">{titulo}</h3>
      {descricao && <p className="mx-auto mt-2 max-w-md text-sm text-areia-600">{descricao}</p>}
      {acao && <div className="mt-5 flex justify-center">{acao}</div>}
    </div>
  )
}

export function Aviso({ children, tom = 'info', titulo, className = '' }) {
  const tons = {
    info: { caixa: 'border-sky-200 bg-sky-50 text-sky-900', icone: 'text-sky-600', Icone: Info },
    alerta: {
      caixa: 'border-amber-200 bg-amber-50 text-amber-900',
      icone: 'text-amber-600',
      Icone: AlertCircle,
    },
  }
  const { caixa, icone, Icone } = tons[tom] ?? tons.info

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm ${caixa} ${className}`}>
      <Icone className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${icone}`} aria-hidden="true" />
      <div className="min-w-0">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={titulo ? 'mt-0.5 opacity-90' : ''}>{children}</div>
      </div>
    </div>
  )
}

/* ==========================================================================
   Barra de progresso acessível
   ========================================================================== */

export function Progresso({ valor, rotulo, className = '' }) {
  const seguro = Math.max(0, Math.min(100, valor))

  return (
    <div
      role="progressbar"
      aria-valuenow={seguro}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
      className={`h-2 w-full overflow-hidden rounded-full bg-areia-200 ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-elev-600 to-elev-800 transition-[width] duration-500 ease-out"
        style={{ width: `${seguro}%` }}
      />
    </div>
  )
}
