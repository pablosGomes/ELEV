/**
 * Integrantes do projeto ELEV, exibidos na página "Sobre".
 *
 * As fotos ficam em `src/assets/equipe/` e são importadas aqui para o Vite
 * processar (hash de cache, otimização) — o mesmo motivo pelo qual não se usa
 * `<img src="/caminho/solto">` para elas.
 */

import fotoBruna from '../assets/equipe/bruna.jpeg'
import fotoMariaFernanda from '../assets/equipe/maria-fernanda.jpeg'
import fotoRebeca from '../assets/equipe/rebeca.jpeg'
import fotoLorranie from '../assets/equipe/lorranie.jpeg'

export const EQUIPE = [
  {
    id: 'bruna',
    nome: 'Bruna Cristina dos Santos Mota',
    foto: fotoBruna,
  },
  {
    id: 'maria-fernanda',
    nome: 'Maria Fernanda Silva Rodriguez',
    foto: fotoMariaFernanda,
  },
  {
    id: 'rebeca',
    nome: 'Rebeca Ruas Vieira Barbosa',
    foto: fotoRebeca,
  },
  {
    id: 'lorranie',
    nome: 'Lorranie Braite Zanluchi Amarante',
    foto: fotoLorranie,
  },
]
