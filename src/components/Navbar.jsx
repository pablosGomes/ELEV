import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Users, X } from 'lucide-react'
import { obterIcone } from '../lib/icones.js'

import Logo from './Logo.jsx'
import { ABAS } from '../data/navegacao.js'

export default function Navbar() {
  const [aberto, setAberto] = useState(false)
  const [rolou, setRolou] = useState(false)
  const local = useLocation()

  // Fecha o menu ao navegar para outra aba.
  useEffect(() => setAberto(false), [local.pathname])

  // Sombra no cabeçalho só depois que a página rola.
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  // Trava o scroll do corpo enquanto o menu mobile está aberto.
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  const classeAba = ({ isActive }) =>
    [
      'relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
      isActive ? 'text-elev-700' : 'text-areia-600 hover:text-areia-900',
    ].join(' ')

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        rolou ? 'border-areia-200 bg-white/90 backdrop-blur-md' : 'border-transparent bg-white'
      }`}
    >
      {/* Atalho para leitores de tela e navegação por teclado */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-elev-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <nav
        className="container-elev flex h-16 items-center justify-between gap-4"
        aria-label="Principal"
      >
        <Link to="/" className="shrink-0" aria-label="ELEV — página inicial">
          <Logo tamanho="sm" idPrefixo="nav" />
        </Link>

        {/* Abas — desktop */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {ABAS.map((aba) => (
            <li key={aba.para}>
              <NavLink to={aba.para} className={classeAba}>
                {({ isActive }) => (
                  <>
                    {aba.rotulo}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-elev-700" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/sobre" className={classeAba}>
              {({ isActive }) => (
                <>
                  Sobre
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-elev-700" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/curriculo"
            className="hidden rounded-xl bg-elev-700 px-4 py-2.5 text-sm font-semibold text-white shadow-elev transition hover:bg-elev-800 sm:inline-flex"
          >
            Criar currículo
          </Link>

          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="rounded-lg p-2 text-areia-700 transition hover:bg-areia-100 lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {aberto ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Abas — mobile */}
      {aberto && (
        <div
          id="menu-mobile"
          className="animate-fade-up border-t border-areia-200 bg-white lg:hidden"
        >
          <ul className="container-elev space-y-1 py-4">
            {ABAS.map((aba) => {
              const Icone = obterIcone(aba.icone)

              return (
                <li key={aba.para}>
                  <NavLink
                    to={aba.para}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                        isActive ? 'bg-elev-50 text-elev-800' : 'text-areia-700 hover:bg-areia-100'
                      }`
                    }
                  >
                    <Icone className="h-4.5 w-4.5 shrink-0 text-elev-700" aria-hidden="true" />
                    <span className="min-w-0">
                      {aba.rotulo}
                      <span className="block text-xs font-normal text-areia-500">
                        {aba.descricao}
                      </span>
                    </span>
                  </NavLink>
                </li>
              )
            })}
            <li>
              <NavLink
                to="/sobre"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-elev-50 text-elev-800' : 'text-areia-700 hover:bg-areia-100'
                  }`
                }
              >
                <Users className="h-4.5 w-4.5 shrink-0 text-elev-700" aria-hidden="true" />
                <span className="min-w-0">
                  Sobre
                  <span className="block text-xs font-normal text-areia-500">
                    Conheça o projeto e a equipe
                  </span>
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
