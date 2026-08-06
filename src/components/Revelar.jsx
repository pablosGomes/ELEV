import { motion, useReducedMotion } from 'framer-motion'

/**
 * Revela o conteúdo quando ele entra na tela.
 *
 * Respeita `prefers-reduced-motion`: quem configurou o sistema para reduzir
 * animações recebe o conteúdo estático, sem movimento.
 *
 * O `min-w-0` fixo não é decoração: este componente quase sempre é usado como
 * item direto de um grid, e itens de grid nascem com `min-width: auto`. Sem
 * ele, qualquer conteúdo que não quebre linha (um nome de empresa com
 * `truncate`, por exemplo) vira o piso de largura do card e estoura a grade
 * no celular. Um wrapper de animação não deve interferir no layout.
 */

/**
 * De onde o conteúdo entra.
 *
 * As distâncias são curtas de propósito. Movimento longo chama atenção para a
 * animação em vez do conteúdo, e numa página com dezenas de cards vira ruído —
 * o objetivo é a página parecer viva, não coreografada.
 */
const ENTRADAS = {
  baixo: { y: 18 },
  esquerda: { x: -22 },
  direita: { x: 22 },
  escala: { scale: 0.96 },
}

export default function Revelar({
  children,
  atraso = 0,
  direcao = 'baixo',
  className = '',
  as = 'div',
}) {
  const semMovimento = useReducedMotion()
  const classes = `min-w-0 ${className}`.trim()

  if (semMovimento) {
    const Estatico = as
    return <Estatico className={classes}>{children}</Estatico>
  }

  const Componente = motion[as] ?? motion.div
  const entrada = ENTRADAS[direcao] ?? ENTRADAS.baixo

  return (
    <Componente
      className={classes}
      initial={{ opacity: 0, ...entrada }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      // `once`: a animação roda uma vez e o elemento fica. Repetir a cada
      // rolagem faria a página piscar para quem sobe e desce procurando algo.
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Componente>
  )
}
