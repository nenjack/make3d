# make3d

## 3d retro boomer game engine

<img alt="https://legacyofpain.app" src="https://pietal.dev/screenshot/legacy-of-pain-app.webp" width="50%" />

**https://legacyofpain.app**

### minimal demo

```ts
import { CubeLevel, Player } from 'make3d'

CubeLevel.create(canvas).then((level) => {
  new Player({ level, textureName: 'player' })
})
```
