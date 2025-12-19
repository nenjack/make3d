# make3d

## [<img valign="middle" src="https://img.shields.io/npm/dw/make3d.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/make3d) @ [<img valign="middle" src="https://img.shields.io/npm/v/make3d?style=for-the-badge&color=success" alt="npm version" />](https://www.npmjs.com/package/make3d?activeTab=versions)

**make3d** is a lightweight framework for building **3D WebGL games in JavaScript**, built on top of **Three.js**.

It focuses on providing **game-oriented primitives** (levels, players, NPCs, physics helpers, input, rendering utilities), while leaving **scene hierarchy and lifecycle management to Three.js itself**.

### highlights

- efficient, mobile-friendly rendering (Three.js)
- ready-to-use game abstractions (Level, Player, NPC)
- simple physics integration (powered by check2d)
- input, camera, rendering, and debug utilities included
- minimal structure, low abstraction overhead

---

## demo

👉 https://nenjack.github.io/make3d/demo/?fps

---

## demo code

```ts
import { Level, Player, NPC } from 'make3d'

Level.create().then(async (level) => {
  await Player.create(level)

  Array.from({ length: 50 }, () => new NPC({ level, ...Player.DEFAULT_PROPS }))
})
```

---

## design philosophy

make3d relies on Three.js for scene hierarchy and object lifecycle, instead of introducing a separate entity system.

- Scene graph and transforms are managed by **Three.js**
- Game logic is built around **Level**, **Player**, and **NPC**
- Utilities are exposed as composable modules, not enforced patterns

---

## exports

make3d exposes a focused set of modules, grouped by responsibility:

### core

- **BaseLevel** – base class for custom levels
- **Level** – main game level ready to use

### rendering

- **Renderer** – Three.js renderer wrapper
- **Camera** – camera helper
- **BoxMesh** – basic 2.5D mesh
- **Sprite** – sprite helper
- **Skybox** – skybox
- **Ocean** – ocean / water surface

### entities

- **Billboard** – camera-facing objects
- **Player** – player entity
- **NPC** – non-player character

### physics

- **physics** – shared physics instance (powered by check2d)
- **DynamicBody** – movable physics body
- **StaticBody** – static physics body
- **AbstractBody** – base physics body

### input

- **mouse** – shared mouse instance
- **Mouse** – mouse input handler

### state & events

- **state** – shared state container
- **Events** – event bus

### loading & assets

- **Loader** – asset loader
- **TextureUtils** – texture helpers

### environment & debug

- **getQueryParams** – get query params from current url
- **Debug** – debug helpers
- **DeviceDetector** – device detection

---

## documentation

- API & architecture
  https://nenjack.github.io/make3d/hierarchy.html

---

## installation

```bash
yarn add make3d
```

---

## license

MIT
