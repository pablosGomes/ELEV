import { motion, useReducedMotion } from 'framer-motion'

/**
 * Revela o conteúdo com um fade + subida quando ele entra na tela.
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
export default function Revelar({ children, atraso = 0, className = '', as = 'div' }) {
  const semMovimento = useReducedMotion()
  const classes = `min-w-0 ${className}`.trim()

  if (semMovimento) {
    const Estatico = as
    return <Estatico className={classes}>{children}</Estatico>
  }

  const Componente = motion[as] ?? motion.div

  return (
    <Componente
      className={classes}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Componente>
  )
}
