import { FC, useEffect, useRef } from 'react'
import { CubeLevel } from '../cube-level'
import { loadTextures } from '../utils'
import { textures } from '../state'

export const createLevel = async (canvas: HTMLCanvasElement) => {
  await loadTextures(['sides.webp', 'floor.webp', 'ocean.webp'])
  return new CubeLevel(canvas, {
    sides: textures.side,
    floor: textures.top,
    ocean: textures.ocean
  })
}

export const Game: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current

    if (canvas) {
      createLevel(canvas).then((level) => {
        // createObjects(level);
      })
    }
  }, [ref])

  return <canvas ref={ref} id="game" />
}
