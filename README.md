# make3d

## 3d retro boomer game engine

<img alt="https://legacyofpain.app" src="https://pietal.dev/screenshot/legacy-of-pain-app.webp" width="50%" />

**https://legacyofpain.app**

## demo

```ts
import { CubeLevel, Player, state } from './make3d/index.js'
CubeLevel.create(canvas).then(async (level) => {
  state.player = await Player.create(level)
})
```
