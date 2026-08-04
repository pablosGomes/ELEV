import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Encolhe o conteúdo proporcionalmente para caber na largura disponível.
 *
 * A prévia do currículo é desenhada em tamanho real (794px = A4 a 96dpi) para
 * que o PDF saia fiel. Na tela, porém, essa largura não cabe em telefone nem
 * na coluna lateral do desktop. Este componente mede o espaço disponível e
 * aplica um `scale` — o que preserva o WYSIWYG sem duplicar estilos.
 */
export default function EscalaAjustavel({ larguraBase, children, className = '' }) {
  const containerRef = useRef(null)
  const conteudoRef = useRef(null)
  const [escala, setEscala] = useState(1)
  const [altura, setAltura] = useState(0)

  const recalcular = useCallback(() => {
    const container = containerRef.current
    const conteudo = conteudoRef.current
    if (!container || !conteudo) return

    const disponivel = container.clientWidth

    // Container oculto (`display: none`) mede 0. Recalcular aqui zeraria a
    // escala e faria a prévia sumir — então mantemos a última escala válida
    // até o container voltar a ser exibido.
    if (disponivel === 0) return

    // Nunca amplia: no máximo 1. Um currículo esticado ficaria borrado.
    const nova = Math.min(1, disponivel / larguraBase)
    setEscala(nova)
    setAltura(conteudo.offsetHeight * nova)
  }, [larguraBase])

  // Sem lista de dependências de propósito: roda depois de cada renderização.
  //
  // No celular, a prévia fica atrás de uma aba e nasce com `display: none`.
  // O ResizeObserver não reporta essa transição de oculto para visível de
  // forma confiável, então a troca de aba passaria despercebida e a prévia
  // ficaria em escala 1, transbordando o container. Como `recalcular` só
  // grava valores novos quando eles mudam, isso converge em uma renderização
  // extra e não entra em laço.
  useLayoutEffect(recalcular)

  // Mudanças de tamanho fora do ciclo de renderização: girar o aparelho,
  // redimensionar a janela ou o conteúdo do currículo crescer.
  useEffect(() => {
    const container = containerRef.current
    const conteudo = conteudoRef.current
    if (!container || !conteudo) return

    const observador = new ResizeObserver(recalcular)
    observador.observe(container)
    observador.observe(conteudo)

    return () => observador.disconnect()
  }, [recalcular])

  return (
    <div ref={containerRef} className={className} style={{ height: altura || undefined }}>
      <div
        ref={conteudoRef}
        style={{
          width: larguraBase,
          transform: `scale(${escala})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}
