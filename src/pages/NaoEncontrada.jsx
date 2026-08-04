import { Link } from 'react-router-dom'
import { obterIcone } from '../lib/icones.js'
import { Home } from 'lucide-react'

import { Botao } from '../components/ui.jsx'
import { ABAS } from '../data/navegacao.js'

export default function NaoEncontrada() {
  return (
    <div className="container-elev flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-elev-100 sm:text-8xl">404</p>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Esta página não existe</h1>
      <p className="mt-3 max-w-md text-areia-600">
        O endereço pode ter mudado ou sido digitado errado. Mas você não precisa voltar do zero —
        escolha por onde continuar.
      </p>

      <div className="mt-8">
        <Botao para="/" tamanho="lg">
          <Home className="h-4.5 w-4.5" aria-hidden="true" />
          Voltar para o início
        </Botao>
      </div>

      <ul className="mt-14 grid w-full max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ABAS.map((aba) => {
          const Icone = obterIcone(aba.icone)

          return (
            <li key={aba.para}>
              <Link
                to={aba.para}
                className="flex items-center gap-3 rounded-xl border border-areia-200 bg-white px-4 py-3.5 text-left text-sm font-semibold transition hover:border-elev-300 hover:text-elev-700"
              >
                <Icone className="h-4.5 w-4.5 shrink-0 text-elev-700" aria-hidden="true" />
                {aba.rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
