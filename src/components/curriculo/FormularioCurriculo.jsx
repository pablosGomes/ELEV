import { useState } from 'react'
import {
  Briefcase,
  GraduationCap,
  Languages,
  Plus,
  Sparkles,
  Target,
  User,
  Wrench,
  X,
} from 'lucide-react'

import { AreaTexto, Campo, ItemLista, ListaVazia, SecaoFormulario, Selecao } from './campos.jsx'
import {
  HABILIDADES_SUGERIDAS,
  NIVEIS_IDIOMA,
  SITUACOES_FORMACAO,
  novoId,
} from '../../data/curriculo.js'

/**
 * Formulário do currículo.
 *
 * Trabalha sobre um único objeto de estado (`curriculo`), controlado pela
 * página. Todas as alterações passam por `aoAlterar`, que recebe o currículo
 * já atualizado — o que mantém a prévia sempre em sincronia com o formulário.
 */
export default function FormularioCurriculo({ curriculo, aoAlterar }) {
  const [novaHabilidade, setNovaHabilidade] = useState('')

  /* ------------------------------------------------------------ helpers */

  const alterarDado = (campo, valor) =>
    aoAlterar({ ...curriculo, dados: { ...curriculo.dados, [campo]: valor } })

  const alterarItem = (lista, id, campo, valor) =>
    aoAlterar({
      ...curriculo,
      [lista]: curriculo[lista].map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item,
      ),
    })

  const adicionarItem = (lista, modelo) =>
    aoAlterar({ ...curriculo, [lista]: [...curriculo[lista], { id: novoId(), ...modelo }] })

  const removerItem = (lista, id) =>
    aoAlterar({ ...curriculo, [lista]: curriculo[lista].filter((item) => item.id !== id) })

  const adicionarHabilidade = (texto) => {
    const limpa = texto.trim()
    if (!limpa || curriculo.habilidades.includes(limpa)) return

    aoAlterar({ ...curriculo, habilidades: [...curriculo.habilidades, limpa] })
    setNovaHabilidade('')
  }

  const removerHabilidade = (habilidade) =>
    aoAlterar({
      ...curriculo,
      habilidades: curriculo.habilidades.filter((h) => h !== habilidade),
    })

  const sugestoesDisponiveis = HABILIDADES_SUGERIDAS.filter(
    (s) => !curriculo.habilidades.includes(s),
  )

  /* -------------------------------------------------------------- render */

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* ------------------------------------------------ Dados pessoais */}
      <SecaoFormulario
        titulo="Dados pessoais"
        descricao="Como as empresas vão entrar em contato com você."
        icone={User}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            rotulo="Nome completo"
            value={curriculo.dados.nome}
            onChange={(e) => alterarDado('nome', e.target.value)}
            placeholder="Ana Beatriz Souza"
            autoComplete="name"
            className="sm:col-span-2"
          />
          <Campo
            rotulo="Cargo desejado"
            value={curriculo.dados.cargo}
            onChange={(e) => alterarDado('cargo', e.target.value)}
            placeholder="Jovem Aprendiz Administrativo"
            dica="Escreva o nome da vaga, não algo genérico como “qualquer área”."
            className="sm:col-span-2"
          />
          <Campo
            rotulo="E-mail"
            type="email"
            value={curriculo.dados.email}
            onChange={(e) => alterarDado('email', e.target.value)}
            placeholder="seunome@email.com"
            autoComplete="email"
            dica="Use nome e sobrenome. Evite apelidos."
          />
          <Campo
            rotulo="Telefone / WhatsApp"
            type="tel"
            value={curriculo.dados.telefone}
            onChange={(e) => alterarDado('telefone', e.target.value)}
            placeholder="(11) 98888-7777"
            autoComplete="tel"
          />
          <Campo
            rotulo="Cidade"
            value={curriculo.dados.cidade}
            onChange={(e) => alterarDado('cidade', e.target.value)}
            placeholder="São Paulo"
            autoComplete="address-level2"
          />
          <Campo
            rotulo="Estado"
            value={curriculo.dados.estado}
            onChange={(e) => alterarDado('estado', e.target.value.toUpperCase().slice(0, 2))}
            placeholder="SP"
            maxLength={2}
          />
          <Campo
            rotulo="LinkedIn ou portfólio (opcional)"
            value={curriculo.dados.linkedin}
            onChange={(e) => alterarDado('linkedin', e.target.value)}
            placeholder="linkedin.com/in/seunome"
            className="sm:col-span-2"
          />
        </div>
      </SecaoFormulario>

      {/* ------------------------------------------------------- Objetivo */}
      <SecaoFormulario
        titulo="Objetivo profissional"
        descricao="Duas ou três linhas dizendo o que você busca e o que oferece."
        icone={Target}
      >
        <AreaTexto
          rotulo="Objetivo"
          rows={4}
          valor={curriculo.objetivo}
          contador
          onChange={(e) => aoAlterar({ ...curriculo, objetivo: e.target.value })}
          placeholder="Estudante do 3º ano do Ensino Médio buscando a primeira oportunidade como Jovem Aprendiz na área administrativa..."
          dica="Cite o cargo, o que você já sabe fazer e o que quer aprender."
        />
      </SecaoFormulario>

      {/* ---------------------------------------------------- Experiência */}
      <SecaoFormulario
        titulo="Experiência"
        descricao="Vale voluntariado, negócio da família, monitoria e projetos escolares."
        icone={Briefcase}
        rotuloAdicionar="Adicionar experiência"
        aoAdicionar={() =>
          adicionarItem('experiencias', {
            cargo: '',
            empresa: '',
            inicio: '',
            fim: '',
            atual: false,
            descricao: '',
          })
        }
      >
        {curriculo.experiencias.length === 0 ? (
          <ListaVazia>
            Sem experiência formal? Sem problema. Adicione trabalho voluntário, ajuda no comércio da
            família ou um projeto da escola.
          </ListaVazia>
        ) : (
          <div className="space-y-4">
            {curriculo.experiencias.map((item, i) => (
              <ItemLista
                key={item.id}
                titulo={`Experiência ${i + 1}`}
                aoRemover={() => removerItem('experiencias', item.id)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Cargo ou função"
                    value={item.cargo}
                    onChange={(e) => alterarItem('experiencias', item.id, 'cargo', e.target.value)}
                    placeholder="Auxiliar administrativo"
                  />
                  <Campo
                    rotulo="Empresa ou projeto"
                    value={item.empresa}
                    onChange={(e) =>
                      alterarItem('experiencias', item.id, 'empresa', e.target.value)
                    }
                    placeholder="Mercearia Souza"
                  />
                  <Campo
                    rotulo="Início"
                    value={item.inicio}
                    onChange={(e) => alterarItem('experiencias', item.id, 'inicio', e.target.value)}
                    placeholder="jan/2025"
                  />
                  <Campo
                    rotulo="Término"
                    value={item.atual ? '' : item.fim}
                    disabled={item.atual}
                    onChange={(e) => alterarItem('experiencias', item.id, 'fim', e.target.value)}
                    placeholder="dez/2025"
                  />

                  <label className="flex items-center gap-2.5 text-sm text-areia-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={item.atual}
                      onChange={(e) =>
                        alterarItem('experiencias', item.id, 'atual', e.target.checked)
                      }
                      className="h-4 w-4 rounded border-areia-300 text-elev-700 focus:ring-elev-600"
                    />
                    Trabalho aqui atualmente
                  </label>

                  <AreaTexto
                    rotulo="O que você fazia"
                    rows={3}
                    valor={item.descricao}
                    onChange={(e) =>
                      alterarItem('experiencias', item.id, 'descricao', e.target.value)
                    }
                    placeholder="Atendi cerca de 30 clientes por dia e organizei o controle de estoque em planilha."
                    dica="Comece com um verbo de ação e, se puder, use números."
                    className="sm:col-span-2"
                  />
                </div>
              </ItemLista>
            ))}
          </div>
        )}
      </SecaoFormulario>

      {/* ------------------------------------------------------- Formação */}
      <SecaoFormulario
        titulo="Formação escolar"
        descricao="Ensino Fundamental, Médio, técnico ou superior."
        icone={GraduationCap}
        rotuloAdicionar="Adicionar formação"
        aoAdicionar={() =>
          adicionarItem('formacoes', {
            curso: '',
            instituicao: '',
            inicio: '',
            fim: '',
            situacao: 'Cursando',
          })
        }
      >
        {curriculo.formacoes.length === 0 ? (
          <ListaVazia>Adicione ao menos a sua formação escolar atual.</ListaVazia>
        ) : (
          <div className="space-y-4">
            {curriculo.formacoes.map((item, i) => (
              <ItemLista
                key={item.id}
                titulo={`Formação ${i + 1}`}
                aoRemover={() => removerItem('formacoes', item.id)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Curso"
                    value={item.curso}
                    onChange={(e) => alterarItem('formacoes', item.id, 'curso', e.target.value)}
                    placeholder="Ensino Médio"
                    className="sm:col-span-2"
                  />
                  <Campo
                    rotulo="Instituição"
                    value={item.instituicao}
                    onChange={(e) =>
                      alterarItem('formacoes', item.id, 'instituicao', e.target.value)
                    }
                    placeholder="E.E. Prof. Carlos Alberto Ferreira"
                    className="sm:col-span-2"
                  />
                  <Campo
                    rotulo="Início"
                    value={item.inicio}
                    onChange={(e) => alterarItem('formacoes', item.id, 'inicio', e.target.value)}
                    placeholder="2024"
                  />
                  <Campo
                    rotulo="Conclusão (ou previsão)"
                    value={item.fim}
                    onChange={(e) => alterarItem('formacoes', item.id, 'fim', e.target.value)}
                    placeholder="2026"
                  />
                  <Selecao
                    rotulo="Situação"
                    value={item.situacao}
                    onChange={(e) => alterarItem('formacoes', item.id, 'situacao', e.target.value)}
                    opcoes={SITUACOES_FORMACAO}
                    className="sm:col-span-2"
                  />
                </div>
              </ItemLista>
            ))}
          </div>
        )}
      </SecaoFormulario>

      {/* --------------------------------------------------------- Cursos */}
      <SecaoFormulario
        titulo="Cursos complementares"
        descricao="Aqui entram os cursos gratuitos que você concluiu na aba Cursos."
        icone={Sparkles}
        rotuloAdicionar="Adicionar curso"
        aoAdicionar={() =>
          adicionarItem('cursos', { nome: '', instituicao: '', cargaHoraria: '', ano: '' })
        }
      >
        {curriculo.cursos.length === 0 ? (
          <ListaVazia>
            Cada certificado conta. Faça um curso gratuito e adicione aqui — é o que mais diferencia
            um currículo sem experiência.
          </ListaVazia>
        ) : (
          <div className="space-y-4">
            {curriculo.cursos.map((item, i) => (
              <ItemLista
                key={item.id}
                titulo={`Curso ${i + 1}`}
                aoRemover={() => removerItem('cursos', item.id)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Nome do curso"
                    value={item.nome}
                    onChange={(e) => alterarItem('cursos', item.id, 'nome', e.target.value)}
                    placeholder="Informática Básica e Pacote Office"
                    className="sm:col-span-2"
                  />
                  <Campo
                    rotulo="Instituição"
                    value={item.instituicao}
                    onChange={(e) => alterarItem('cursos', item.id, 'instituicao', e.target.value)}
                    placeholder="Fundação Bradesco"
                    className="sm:col-span-2"
                  />
                  <Campo
                    rotulo="Carga horária"
                    value={item.cargaHoraria}
                    onChange={(e) => alterarItem('cursos', item.id, 'cargaHoraria', e.target.value)}
                    placeholder="20"
                    inputMode="numeric"
                  />
                  <Campo
                    rotulo="Ano de conclusão"
                    value={item.ano}
                    onChange={(e) => alterarItem('cursos', item.id, 'ano', e.target.value)}
                    placeholder="2026"
                    inputMode="numeric"
                  />
                </div>
              </ItemLista>
            ))}
          </div>
        )}
      </SecaoFormulario>

      {/* ---------------------------------------------------- Habilidades */}
      <SecaoFormulario
        titulo="Habilidades"
        descricao="Técnicas e comportamentais. Só coloque o que você realmente sabe fazer."
        icone={Wrench}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={novaHabilidade}
            onChange={(e) => setNovaHabilidade(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                adicionarHabilidade(novaHabilidade)
              }
            }}
            placeholder="Digite uma habilidade e pressione Enter"
            aria-label="Nova habilidade"
            className="campo-elev"
          />
          <button
            type="button"
            onClick={() => adicionarHabilidade(novaHabilidade)}
            disabled={!novaHabilidade.trim()}
            className="shrink-0 rounded-xl bg-elev-700 px-4 text-sm font-semibold text-white transition hover:bg-elev-800 disabled:bg-areia-300"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Adicionar habilidade</span>
          </button>
        </div>

        {curriculo.habilidades.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {curriculo.habilidades.map((habilidade) => (
              <li key={habilidade}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-elev-50 py-1.5 pr-1.5 pl-3 text-xs font-semibold text-elev-800 ring-1 ring-elev-100">
                  {habilidade}
                  <button
                    type="button"
                    onClick={() => removerHabilidade(habilidade)}
                    className="rounded-full p-0.5 transition hover:bg-elev-200"
                    aria-label={`Remover ${habilidade}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        {sugestoesDisponiveis.length > 0 && (
          <div className="mt-5 border-t border-areia-100 pt-4">
            <p className="text-xs font-semibold text-areia-500">
              Sugestões — clique para adicionar
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {sugestoesDisponiveis.slice(0, 8).map((sugestao) => (
                <li key={sugestao}>
                  <button
                    type="button"
                    onClick={() => adicionarHabilidade(sugestao)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-areia-300 px-3 py-1.5 text-xs text-areia-500 transition hover:border-elev-400 hover:text-elev-700"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    {sugestao}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SecaoFormulario>

      {/* -------------------------------------------------------- Idiomas */}
      <SecaoFormulario
        titulo="Idiomas"
        descricao="Seja honesto com o nível — isso costuma ser testado na entrevista."
        icone={Languages}
        rotuloAdicionar="Adicionar idioma"
        aoAdicionar={() => adicionarItem('idiomas', { idioma: '', nivel: 'Básico' })}
      >
        {curriculo.idiomas.length === 0 ? (
          <ListaVazia>Opcional. Inclua apenas se agregar à vaga que você busca.</ListaVazia>
        ) : (
          <div className="space-y-4">
            {curriculo.idiomas.map((item, i) => (
              <ItemLista
                key={item.id}
                titulo={`Idioma ${i + 1}`}
                aoRemover={() => removerItem('idiomas', item.id)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Idioma"
                    value={item.idioma}
                    onChange={(e) => alterarItem('idiomas', item.id, 'idioma', e.target.value)}
                    placeholder="Inglês"
                  />
                  <Selecao
                    rotulo="Nível"
                    value={item.nivel}
                    onChange={(e) => alterarItem('idiomas', item.id, 'nivel', e.target.value)}
                    opcoes={NIVEIS_IDIOMA}
                  />
                </div>
              </ItemLista>
            ))}
          </div>
        )}
      </SecaoFormulario>
    </form>
  )
}
