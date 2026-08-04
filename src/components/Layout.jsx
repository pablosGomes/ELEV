import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

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

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <RolarParaTopo />
      <Navbar />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
