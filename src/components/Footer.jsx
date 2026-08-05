import { Link } from 'react-router-dom'
import { ExternalLink, Heart } from 'lucide-react'

import Logo from './Logo.jsx'
import { ABAS } from '../data/navegacao.js'
import { PORTAIS_VAGAS } from '../data/vagas.js'

export default function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-areia-200 bg-areia-50">
      <div className="container-elev grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo tamanho="md" comSlogan idPrefixo="rodape" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-areia-600">
            O ELEV reúne cursos gratuitos, orientação vocacional, criação de currículo e vagas de
            Jovem Aprendiz em um só lugar — para que a falta de informação nunca seja o motivo de
            alguém não conseguir o primeiro emprego.
          </p>
          <p className="mt-4 text-xs text-areia-500">
            Projeto acadêmico, sem fins lucrativos. Nenhum serviço do ELEV é cobrado.
          </p>
        </div>

        <nav aria-label="Seções do site">
          <h2 className="text-sm font-bold text-areia-900">Navegação</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/" className="text-sm text-areia-600 transition hover:text-elev-700">
                Página inicial
              </Link>
            </li>
            {ABAS.map((aba) => (
              <li key={aba.para}>
                <Link
                  to={aba.para}
                  className="text-sm text-areia-600 transition hover:text-elev-700"
                >
                  {aba.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Portais de vagas">
          <h2 className="text-sm font-bold text-areia-900">Onde se candidatar</h2>
          <ul className="mt-4 space-y-2.5">
            {PORTAIS_VAGAS.slice(0, 5).map((portal) => (
              <li key={portal.nome}>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-areia-600 transition hover:text-elev-700"
                >
                  {portal.nome}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-areia-200">
        <div className="container-elev flex flex-col items-center justify-between gap-3 py-6 text-xs text-areia-500 sm:flex-row">
          <p>© {ano} ELEV. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1.5">
            Feito com{' '}
            <Heart className="h-3.5 w-3.5 fill-elev-600 text-elev-600" aria-hidden="true" />
            para quem está começando
          </p>
        </div>
      </div>
    </footer>
  )
}
