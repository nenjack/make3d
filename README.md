# make3d

## ddd retro boomer game engine

<img alt="https://legacyofpain.app" src="https://pietal.dev/screenshot/legacy-of-pain-app.webp" width="50%" />

**https://legacyofpain.app**

### demo usage

```ts
import { CubeLevel, loadTextures, textures } from 'make3d'

export const createLevel = async (canvas: HTMLCanvasElement) => {
  await loadTextures(['sides.webp', 'floor.webp', 'ocean.webp'])
  return new CubeLevel(canvas, {
    sides: textures.sides,
    floor: textures.floor,
    ocean: textures.ocean
  })
}
```

```tsx
import { FC, useEffect, useRef } from 'react'

export const Game: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current

    if (canvas) {
      createLevel(canvas).then((level) => {
        createObjects(level)
      })
    }
  }, [ref])

  return <canvas ref={ref} id="game" />
}
```
