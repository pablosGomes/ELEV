import { useCallback, useEffect, useState } from 'react'

/**
 * Igual ao `useState`, mas o valor sobrevive ao recarregar a página.
 *
 * Usado no gerador de currículo (para o usuário não perder o que digitou),
 * no teste vocacional e no checklist de preparação.
 *
 * @param {string} chave nome da entrada no localStorage
 * @param {any} valorInicial valor usado quando ainda não há nada salvo
 */
export default function useArmazenamentoLocal(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    if (typeof window === 'undefined') return valorInicial

    try {
      const salvo = window.localStorage.getItem(chave)
      return salvo !== null ? JSON.parse(salvo) : valorInicial
    } catch {
      // JSON inválido ou storage bloqueado (aba anônima, cookies desativados).
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      // Sem espaço ou storage indisponível: o site continua funcionando,
      // apenas sem persistir entre sessões.
    }
  }, [chave, valor])

  const limpar = useCallback(() => {
    try {
      window.localStorage.removeItem(chave)
    } catch {
      /* ignora */
    }
    setValor(valorInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  return [valor, setValor, limpar]
}
