import { useCallback, useEffect, useState } from 'react'

/**
 * Executa uma função assíncrona e expõe os três estados de uma requisição:
 * carregando, erro e dados.
 *
 * @param {() => Promise<any>} carregador função que busca os dados
 * @param {Array} dependencias quando mudarem, os dados são buscados de novo
 */
export default function useRecurso(carregador, dependencias = []) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [gatilho, setGatilho] = useState(0)

  const recarregar = useCallback(() => setGatilho((n) => n + 1), [])

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)

    carregador()
      .then((resultado) => {
        if (ativo) setDados(resultado)
      })
      .catch((e) => {
        if (ativo) setErro(e)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    // Evita atualizar o estado depois que o componente sai da tela.
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, gatilho])

  return { dados, carregando, erro, recarregar }
}
