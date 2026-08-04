/**
 * Logo do ELEV.
 *
 * Marca provisoria criada em SVG seguindo a identidade visual descrita na
 * documentacao (vermelho/vinho). As tres barras ascendentes + a seta
 * representam a ideia de "elevar" a carreira.
 *
 * Para trocar pela logo oficial, basta substituir o <svg> do bloco `Simbolo`
 * (e o arquivo `public/favicon.svg`, que usa o mesmo desenho).
 */

function Simbolo({ className = '', idPrefixo = 'elev' }) {
  const gradienteId = `${idPrefixo}-gradiente`

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradienteId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-elev-600)" />
          <stop offset="1" stopColor="var(--color-elev-900)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradienteId})`} />
      <g fill="#ffffff">
        <rect x="14" y="36" width="8" height="14" rx="4" />
        <rect x="28" y="27" width="8" height="23" rx="4" />
        <rect x="42" y="18" width="8" height="32" rx="4" />
      </g>
      <path
        d="M17 27 L32 17 L47 27"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  )
}

const TAMANHOS = {
  sm: { simbolo: 'h-8 w-8', texto: 'text-lg', slogan: 'text-[9px]' },
  md: { simbolo: 'h-10 w-10', texto: 'text-xl', slogan: 'text-[10px]' },
  lg: { simbolo: 'h-14 w-14', texto: 'text-3xl', slogan: 'text-xs' },
}

export default function Logo({
  tamanho = 'md',
  variante = 'padrao',
  comSlogan = false,
  idPrefixo = 'elev',
  className = '',
}) {
  const t = TAMANHOS[tamanho] ?? TAMANHOS.md
  const claro = variante === 'claro'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Simbolo className={`${t.simbolo} shrink-0`} idPrefixo={idPrefixo} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-tight ${t.texto} ${
            claro ? 'text-white' : 'text-areia-900'
          }`}
        >
          ELEV
        </span>
        {comSlogan && (
          <span
            className={`mt-1 font-semibold tracking-[0.18em] uppercase ${t.slogan} ${
              claro ? 'text-white/60' : 'text-elev-700'
            }`}
          >
            Sua carreira começa aqui
          </span>
        )}
      </span>
    </span>
  )
}

export { Simbolo }
