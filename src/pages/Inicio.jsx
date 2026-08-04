import { Link } from 'react-router-dom'
import { obterIcone } from '../lib/icones.js'
import { ArrowRight, BadgeCheck, Sparkles } from 'lucide-react'

import Revelar from '../components/Revelar.jsx'
import { Botao, Chip, TituloSecao } from '../components/ui.jsx'
import { ABAS } from '../data/navegacao.js'
import { AREAS } from '../data/areas.js'
import { CURSOS } from '../data/cursos.js'

const OBJETIVOS = [
  {
    icone: 'GraduationCap',
    titulo: 'Acessar cursos gratuitos',
    texto:
      'Um catálogo organizado por área, só com instituições reconhecidas e cursos que realmente não cobram nada.',
  },
  {
    icone: 'Compass',
    titulo: 'Realizar testes vocacionais',
    texto:
      'Um questionário rápido que aponta quais áreas mais combinam com o seu jeito de pensar e trabalhar.',
  },
  {
    icone: 'FileText',
    titulo: 'Gerar currículos automaticamente',
    texto: 'Você preenche os campos, a gente monta o layout e entrega um PDF pronto para enviar.',
  },
  {
    icone: 'Briefcase',
    titulo: 'Encontrar vagas de Jovem Aprendiz',
    texto:
      'Vagas com requisitos claros, forma de candidatura e os portais oficiais onde elas são publicadas.',
  },
  {
    icone: 'Lightbulb',
    titulo: 'Melhorar seu currículo e seu preparo',
    texto: 'Guias e vídeo-aulas sobre currículo, entrevista e os primeiros passos na carreira.',
  },
]

const PASSOS = [
  {
    numero: '01',
    titulo: 'Descubra sua área',
    texto: 'Faça o teste vocacional e veja quais caminhos combinam com o seu perfil.',
    para: '/teste-vocacional',
  },
  {
    numero: '02',
    titulo: 'Estude de graça',
    texto: 'Escolha um curso gratuito com certificado da área que você quer seguir.',
    para: '/cursos',
  },
  {
    numero: '03',
    titulo: 'Monte seu currículo',
    texto: 'Adicione o certificado ao currículo e baixe tudo em PDF em poucos minutos.',
    para: '/curriculo',
  },
  {
    numero: '04',
    titulo: 'Candidate-se',
    texto: 'Busque vagas de Jovem Aprendiz e prepare-se para a entrevista com as dicas.',
    para: '/vagas',
  },
]

function CartaoAba({ aba, atraso }) {
  const Icone = obterIcone(aba.icone, Sparkles)

  return (
    <Revelar atraso={atraso}>
      <Link to={aba.para} className="cartao-elev group flex h-full flex-col p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-elev-50 text-elev-700 transition group-hover:bg-elev-700 group-hover:text-white">
          <Icone className="h-5.5 w-5.5" aria-hidden="true" />
        </span>

        <h3 className="mt-5 text-lg font-bold">{aba.rotulo}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-areia-600">{aba.descricao}</p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-elev-700">
          {aba.chamada}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </Link>
    </Revelar>
  )
}

export default function Inicio() {
  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-elev-50 to-white">
        <div aria-hidden="true" className="malha-elev absolute inset-0 opacity-60" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-elev-200/40 blur-3xl"
        />

        <div className="container-elev relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <Chip tom="marca">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Gratuito, sempre
            </Chip>

            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Sua carreira <span className="text-elev-700">começa aqui</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-areia-600">
              O ELEV é uma plataforma feita para ajudar jovens a entrar no mercado de trabalho.
              Cursos gratuitos, teste vocacional, currículo em PDF, vagas de Jovem Aprendiz e dicas
              de carreira — tudo reunido em um só lugar.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Botao para="/curriculo" tamanho="lg">
                Criar meu currículo
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </Botao>
              <Botao para="/teste-vocacional" variante="contorno" tamanho="lg">
                Fazer o teste vocacional
              </Botao>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-areia-200 pt-8">
              {[
                { valor: `${CURSOS.length}+`, rotulo: 'Cursos gratuitos' },
                { valor: `${AREAS.length}`, rotulo: 'Áreas mapeadas' },
                { valor: 'R$ 0', rotulo: 'Do início ao fim' },
              ].map((item) => (
                // `flex-col-reverse` deixa o número acima do rótulo na tela sem
                // inverter a ordem <dt>/<dd> exigida por um <dl>.
                <div key={item.rotulo} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs text-areia-500">{item.rotulo}</dt>
                  <dd className="font-display text-2xl font-extrabold text-elev-800 sm:text-3xl">
                    {item.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Cartão ilustrativo do fluxo */}
          <div className="lg:col-span-5">
            <Revelar className="relative">
              <div className="rounded-3xl border border-areia-200 bg-white p-6 shadow-elev-lg">
                <div className="flex items-center gap-3 border-b border-areia-100 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-elev-700 text-sm font-bold text-white">
                    JS
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">João da Silva</p>
                    <p className="truncate text-xs text-areia-500">Jovem Aprendiz Administrativo</p>
                  </div>
                  <Chip tom="sucesso" className="ml-auto">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    Pronto
                  </Chip>
                </div>

                <div className="space-y-4 pt-5">
                  {[
                    { rotulo: 'Teste vocacional', valor: 'Negócios e Administração', pct: 100 },
                    { rotulo: 'Cursos concluídos', valor: '3 certificados', pct: 100 },
                    { rotulo: 'Currículo em PDF', valor: 'Baixado', pct: 100 },
                    { rotulo: 'Candidaturas', valor: '5 vagas enviadas', pct: 70 },
                  ].map((linha) => (
                    <div key={linha.rotulo}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-semibold text-areia-500">{linha.rotulo}</span>
                        <span className="truncate text-xs font-bold text-areia-800">
                          {linha.valor}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-areia-100">
                        <div
                          className="h-full rounded-full bg-elev-600"
                          style={{ width: `${linha.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-areia-400">
                Exemplo de percurso de um usuário no ELEV
              </p>
            </Revelar>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Sobre o projeto */}
      <section className="container-elev py-20">
        <Revelar>
          <TituloSecao
            sobretitulo="Sobre o projeto"
            titulo="Um ambiente simples, intuitivo e acessível"
            descricao="A entrada no mercado de trabalho costuma travar por falta de informação, não por falta de vontade. O ELEV reúne, de forma gratuita, tudo o que um jovem precisa para dar o primeiro passo com segurança."
            centralizado
          />
        </Revelar>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OBJETIVOS.map((objetivo, i) => {
            const Icone = obterIcone(objetivo.icone, Sparkles)

            return (
              <Revelar key={objetivo.titulo} atraso={i * 0.06}>
                <div className="h-full rounded-2xl border border-areia-200 bg-areia-50/60 p-6">
                  <Icone className="h-6 w-6 text-elev-700" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold">{objetivo.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-areia-600">{objetivo.texto}</p>
                </div>
              </Revelar>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------- Acesso às abas */}
      <section className="bg-areia-50 py-20">
        <div className="container-elev">
          <Revelar>
            <TituloSecao
              sobretitulo="Serviços"
              titulo="Escolha por onde começar"
              descricao="Cada funcionalidade tem a sua própria aba. Você pode seguir a ordem sugerida ou ir direto ao que precisa agora."
            />
          </Revelar>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ABAS.map((aba, i) => (
              <CartaoAba key={aba.para} aba={aba} atraso={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Como funciona */}
      <section className="container-elev py-20">
        <Revelar>
          <TituloSecao
            sobretitulo="Como funciona"
            titulo="Do zero ao primeiro currículo enviado"
            descricao="Quatro passos, todos gratuitos, na ordem que costuma dar mais resultado."
            centralizado
          />
        </Revelar>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((passo, i) => (
            <Revelar key={passo.numero} atraso={i * 0.08}>
              <li className="relative h-full list-none rounded-2xl border border-areia-200 bg-white p-6">
                <span className="font-display text-4xl font-extrabold text-elev-100">
                  {passo.numero}
                </span>
                <h3 className="mt-3 text-base font-bold">{passo.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-areia-600">{passo.texto}</p>
                <Link
                  to={passo.para}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-elev-700 hover:underline"
                >
                  Começar
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            </Revelar>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ Chamada final */}
      <section className="container-elev pb-4">
        <Revelar>
          <div className="relative overflow-hidden rounded-3xl bg-elev-900 px-8 py-16 text-center text-white sm:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-elev-600/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-elev-500/20 blur-3xl"
            />

            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Seu primeiro emprego começa com um currículo
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75">
                Leva menos de 10 minutos, não precisa de cadastro e o PDF é seu para sempre.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Botao para="/curriculo" variante="claro" tamanho="lg">
                  Criar meu currículo agora
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                </Botao>
                <Botao
                  para="/cursos"
                  tamanho="lg"
                  className="border border-white/25 bg-white/5 text-white hover:bg-white/10"
                  variante="fantasma"
                >
                  Ver cursos gratuitos
                </Botao>
              </div>
            </div>
          </div>
        </Revelar>
      </section>
    </>
  )
}
