import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Janela modal acessível.
 *
 * Cuida do que costuma ser esquecido em modais feitos à mão: fecha no Esc,
 * fecha ao clicar no fundo, trava o scroll da página, devolve o foco para o
 * elemento que abriu e prende a navegação por Tab dentro da janela.
 */
export default function Modal({ aberto, aoFechar, titulo, children, rodape }) {
  const painelRef = useRef(null)
  const focoAnteriorRef = useRef(null)

  useEffect(() => {
    if (!aberto) return

    focoAnteriorRef.current = document.activeElement
    const scrollAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move o foco para dentro da janela assim que ela abre.
    const primeiro = painelRef.current?.querySelector('button, a[href], input, select, textarea')
    primeiro?.focus()

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') {
        aoFechar()
        return
      }

      if (evento.key !== 'Tab') return

      const focaveis = painelRef.current?.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focaveis?.length) return

      const primeiroItem = focaveis[0]
      const ultimoItem = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiroItem) {
        evento.preventDefault()
        ultimoItem.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimoItem) {
        evento.preventDefault()
        primeiroItem.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = scrollAnterior
      focoAnteriorRef.current?.focus?.()
    }
  }, [aberto, aoFechar])

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-areia-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={aoFechar}
          />

          <motion.div
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={aoFechar}
              className="absolute top-4 right-4 z-10 rounded-lg bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

            {rodape && (
              <div className="shrink-0 border-t border-areia-200 bg-areia-50 px-6 py-4">
                {rodape}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
