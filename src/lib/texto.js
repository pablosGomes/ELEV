/** Utilitários de texto usados nos filtros, buscas e formatações do site. */

const MARCAS_DE_ACENTO = /[\u0300-\u036f]/g

/**
 * Normaliza um texto para comparação: minúsculas, sem acento e sem espaços
 * sobrando. É o que permite buscar "logistica" e encontrar "Logística".
 */
export function normalizar(texto = '') {
  return String(texto).toLowerCase().normalize('NFD').replace(MARCAS_DE_ACENTO, '').trim()
}

/** Verifica se `termo` aparece em qualquer um dos campos informados. */
export function contemTermo(termo, ...campos) {
  if (!termo) return true
  const alvo = normalizar(campos.filter(Boolean).join(' '))
  return normalizar(termo)
    .split(/\s+/)
    .every((palavra) => alvo.includes(palavra))
}

/** Formata uma data ISO (`2026-07-28`) como `28 de jul.` */
export function formatarData(iso) {
  if (!iso) return ''
  const data = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(data.getTime())) return ''

  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Formata carga horária: `40` -> `40h`. */
export function formatarCargaHoraria(horas) {
  return horas ? `${horas}h` : ''
}

/** Iniciais de um nome, para o avatar do currículo. */
export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

/** Transforma um texto em `slug-para-url`. */
export function slug(texto = '') {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
