import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

/** Rola para o topo a cada troca de aba — comportamento esperado em um site. */
function RolarParaTopo() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

/**
 * Transição entre abas.
 *
 * A `key` no pathname remonta o conteúdo a cada rota, e a animação de entrada
 * roda sozinha — sem `AnimatePresence`. A alternativa com saída animada
 * obrigaria a nova página a esperar a anterior desaparecer, o que atrasa o
 * conteúdo para ganhar um efeito que quase ninguém percebe.
 *
 * Só opacidade e um deslocamento mínimo: as páginas já revelam as próprias
 * seções ao rolar (`Revelar`), e mover a página inteira por cima disso deixaria
 * a entrada pesada.
 */
function Pagina({ children }) {
  const { pathname } = useLocation()
  const semMovimento = useReducedMotion()

  if (semMovimento) return children

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <RolarParaTopo />
      <Navbar />
      <main id="conteudo" className="flex-1">
        <Pagina>
          <Outlet />
        </Pagina>
      </main>
      <Footer />
    </div>
  )
}
