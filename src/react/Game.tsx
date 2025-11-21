import { FC, useEffect, useRef } from 'react'
import { CubeLevel } from '../cube-level'

export const Game: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (canvas) {
      CubeLevel.create(canvas)
    }
  }, [ref])

  return <canvas ref={ref} id="game" />
}
