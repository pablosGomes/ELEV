import { ArrowRight, Compass, FileText, GraduationCap, Briefcase, Lightbulb } from 'lucide-react'

import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Revelar from '../components/Revelar.jsx'
import { Botao, TituloSecao } from '../components/ui.jsx'
import { EQUIPE } from '../data/equipe.js'

const OBJETIVOS = [
  { icone: GraduationCap, texto: 'Acessar cursos gratuitos' },
  { icone: Compass, texto: 'Realizar testes vocacionais' },
  { icone: FileText, texto: 'Gerar currículos automaticamente' },
  { icone: Briefcase, texto: 'Encontrar vagas de Jovem Aprendiz' },
  { icone: Lightbulb, texto: 'Melhorar o currículo e a preparação profissional' },
]

export default function Sobre() {
  return (
    <>
      <CabecalhoPagina
        icone="Users"
        sobretitulo="Sobre o projeto"
        titulo="Quem faz o ELEV acontecer"
        descricao="O ELEV é um projeto acadêmico, sem fins lucrativos, feito por quatro integrantes com um objetivo em comum: reduzir a distância entre um jovem e o seu primeiro emprego."
      />

      <div className="container-elev py-16 sm:py-20">
        {/* --------------------------------------------------- O projeto */}
        <section className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Revelar direcao="esquerda">
              <TituloSecao sobretitulo="O projeto" titulo="Por que o ELEV existe" />
              <p className="mt-5 text-base leading-relaxed text-areia-600 sm:text-lg">
                O ELEV é uma plataforma voltada para auxiliar jovens em sua entrada no mercado de
                trabalho, oferecendo ferramentas e recursos que facilitem o desenvolvimento
                profissional e a busca pelo primeiro emprego.
              </p>
              <p className="mt-4 leading-relaxed text-areia-600">
                A ideia nasceu como trabalho acadêmico, mas foi construída para ser útil de verdade:
                sem cadastro, sem custo e sem letras miúdas. O currículo e as respostas do teste
                vocacional ficam salvos só no navegador de quem usa — nenhum dado sai do aparelho.
              </p>
            </Revelar>
          </div>

          <div className="lg:col-span-5">
            <Revelar direcao="direita" atraso={0.08}>
              <div className="rounded-2xl border border-areia-200 bg-areia-50/60 p-7">
                <h3 className="text-sm font-bold tracking-wide text-elev-800 uppercase">
                  Objetivo do site
                </h3>
                <p className="mt-2 text-sm text-areia-600">
                  Criar um ambiente simples, intuitivo e acessível onde o usuário possa:
                </p>
                <ul className="mt-5 space-y-3.5">
                  {OBJETIVOS.map(({ icone: Icone, texto }) => (
                    <li key={texto} className="flex items-start gap-3 text-sm text-areia-700">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-elev-700 shadow-sm">
                        <Icone className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="pt-1.5 leading-snug font-medium">{texto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Revelar>
          </div>
        </section>

        {/* ----------------------------------------------------- Equipe */}
        <section className="mt-24">
          <Revelar>
            <TituloSecao
              sobretitulo="Equipe"
              titulo="Quem desenvolveu o ELEV"
              descricao="Quatro integrantes responsáveis por pensar, projetar e construir o projeto do início ao fim."
              centralizado
            />
          </Revelar>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EQUIPE.map((pessoa, i) => (
              <Revelar key={pessoa.id} direcao="escala" atraso={i * 0.07}>
                <div className="cartao-elev group overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden bg-areia-100">
                    <img
                      src={pessoa.foto}
                      alt={pessoa.nome}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm leading-snug font-bold text-areia-900">{pessoa.nome}</p>
                    <p className="mt-1 text-xs text-areia-500">Integrante do projeto</p>
                  </div>
                </div>
              </Revelar>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ Chamada final */}
        <Revelar className="mt-24">
          <div className="rounded-3xl bg-areia-50 px-8 py-14 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Conheça o que construímos
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-areia-600">
              Cursos gratuitos, teste vocacional, currículo em PDF, vagas de Jovem Aprendiz e dicas
              de carreira — tudo em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Botao para="/" tamanho="lg">
                Voltar para a página inicial
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </Botao>
              <Botao para="/curriculo" variante="contorno" tamanho="lg">
                Criar meu currículo
              </Botao>
            </div>
          </div>
        </Revelar>
      </div>
    </>
  )
}
