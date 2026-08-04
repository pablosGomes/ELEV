/**
 * Registro de ícones.
 *
 * Vários lugares do site escolhem o ícone por nome, vindo dos arquivos de
 * dados (`areas.js`, `navegacao.js`, `dicas.js`). A forma ingênua de resolver
 * isso — `import * as Icones from 'lucide-react'` — funciona, mas obriga o
 * bundler a incluir a biblioteca inteira (mais de 1.500 ícones) no pacote
 * final, o que pesa muito em conexão de celular.
 *
 * Aqui importamos só os ícones que realmente aparecem no site e resolvemos o
 * nome por este mapa.
 */

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Briefcase,
  Building,
  Circle,
  Code2,
  Compass,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  Lightbulb,
  MessagesSquare,
  Palette,
  Rocket,
  Sparkles,
  Target,
  User,
  UserRound,
  Wrench,
} from 'lucide-react'

export const ICONES = {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Briefcase,
  Building,
  Circle,
  Code2,
  Compass,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  Lightbulb,
  MessagesSquare,
  Palette,
  Rocket,
  Sparkles,
  Target,
  User,
  UserRound,
  Wrench,
}

/**
 * Devolve o componente de ícone pelo nome, com um padrão caso o nome não
 * exista — assim um dado com ícone errado nunca quebra a tela.
 */
export function obterIcone(nome, padrao = Circle) {
  return ICONES[nome] ?? padrao
}
