import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from './components/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import { Carregando } from './components/ui.jsx'

/**
 * Rotas do ELEV.
 *
 * Cada funcionalidade descrita na documentação tem a sua própria aba, como
 * pedido: cursos gratuitos, teste vocacional, criação de currículo, vagas de
 * Jovem Aprendiz e dicas com vídeo-aulas.
 *
 * A página inicial é importada normalmente (é a primeira coisa que o visitante
 * vê); as demais são carregadas sob demanda, para o primeiro acesso ser rápido
 * mesmo em conexão de celular.
 */

const Cursos = lazy(() => import('./pages/Cursos.jsx'))
const TesteVocacional = lazy(() => import('./pages/TesteVocacional.jsx'))
const Curriculo = lazy(() => import('./pages/Curriculo.jsx'))
const Vagas = lazy(() => import('./pages/Vagas.jsx'))
const Dicas = lazy(() => import('./pages/Dicas.jsx'))
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />

        <Route
          path="cursos"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <Cursos />
            </Suspense>
          }
        />
        <Route
          path="teste-vocacional"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <TesteVocacional />
            </Suspense>
          }
        />
        <Route
          path="curriculo"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <Curriculo />
            </Suspense>
          }
        />
        <Route
          path="vagas"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <Vagas />
            </Suspense>
          }
        />
        <Route
          path="dicas"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <Dicas />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<Carregando className="min-h-[60dvh]" />}>
              <NaoEncontrada />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
