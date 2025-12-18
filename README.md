# make3d

# [<img src="https://img.shields.io/npm/dw/make3d.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/make3d) @ [<img src="https://img.shields.io/npm/v/make3d?style=for-the-badge&color=success" alt="npm version" />](https://www.npmjs.com/package/make3d?activeTab=versions)

Game FrameWork for JavaScript 3D WebGL Games.

- efficient and mobile friendly drawing ✔️ (threejs)
- efficient collision detection ✔️ (make2d)

## demo

https://nenjack.github.io/make3d/demo/

## demo code

```ts
import { Level, Player } from 'make3d'

Level.create().then(async (level) => {
  await Player.create(level)
  Array.from({ length: 50 }, () => new NPC({ level, ...Player.DEFAULT_PROPS }))
})
```

## docs

https://nenjack.github.io/make3d/hierarchy.html

## license

MIT
