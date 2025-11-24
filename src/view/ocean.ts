import {
  CircleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three'
import { Camera } from '../core/camera'
import { BaseLevel } from '../level/base-level'
import {
  Math_Half_PI,
  alphaMaterialProps,
  materialProps,
  state
} from '../state'

export class Ocean {
  protected static readonly COLS = BaseLevel.COLS
  protected static readonly ROWS = BaseLevel.ROWS
  protected static readonly DEEP_WATER_Z = -0.25
  protected static readonly SHALLOW_WATER = {
    opacity: 0.5,
    waveTime: 0.16,
    waveHeight: 0.16,
    waveSpeed: 2,
    renderOrder: 1
  }

  readonly mesh = new Group()

  protected readonly animations: Array<(time: number) => void> = []
  protected readonly repeat: number
  protected readonly cols: number
  protected readonly rows: number

  protected startTime = Date.now()

  constructor(texture: Texture, repeat = 1.1) {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping

    this.repeat = repeat
    this.cols = Ocean.COLS * repeat
    this.rows = Ocean.ROWS * repeat
    this.mesh.add(this.createDeepWater(texture))
    this.mesh.add(this.createShallowWater(texture))

    this.onResize()
    window.addEventListener('resize', () => this.onResize())

    state.renderer.add(this)
  }

  onResize() {
    const scale = Camera.getFar()
    this.mesh.scale.set(scale, scale, scale)
  }

  update(ms = 0) {
    const { x, y } = state.renderer.camera?.target?.body || { x: 0, y: 0 }

    this.mesh.position.set(x, Ocean.DEEP_WATER_Z, y)
    this.animations.forEach((animation) => animation(ms))
  }

  protected createDeepWater(texture: Texture) {
    const scale = 2
    const radius = Math.hypot(this.cols, this.rows) / 2
    const geometry = new CircleGeometry(radius)
    const map = texture.clone()
    map.repeat.set(this.cols * scale, this.rows * scale)

    const material = new MeshBasicMaterial({
      ...materialProps,
      map
    })

    const mesh = new Mesh(geometry, material)
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math_Half_PI)
    mesh.scale.set(scale, scale, scale)
    mesh.position.set(0, 0, 0)
    mesh.renderOrder = 0

    this.animations.push(() => {
      map.offset.set(
        (this.mesh.position.x * 0.7) % 1,
        1 - ((this.mesh.position.z * 0.7) % 1)
      )
    })

    return mesh
  }

  protected createShallowWater(texture: Texture) {
    const { opacity, renderOrder, waveTime, waveSpeed, waveHeight } =
      Ocean.SHALLOW_WATER
    const radius = Math.hypot(this.cols, this.rows) / 2
    const geometry = new CircleGeometry(radius)
    const map = texture.clone()
    const material = new ShaderMaterial({
      ...alphaMaterialProps,
      uniforms: {
        time: { value: 0 },
        cameraX: { value: 0 },
        cameraY: { value: 0 },
        cameraFar: { value: Camera.FAR },
        waveSpeed: { value: waveSpeed },
        waveHeight: { value: waveHeight },
        waveTime: { value: waveTime },
        map: { value: map },
        opacity: { value: opacity }
      },
      vertexShader: `
        uniform float time;
        uniform float waveSpeed;
        uniform float waveHeight;
        uniform float cameraFar;
        uniform float cameraX;
        uniform float cameraY;
      
        varying vec2 vUv;
        varying float wave;
      
        void main() {
          vec3 pos = position;
          vUv = uv * cameraFar + vec2(cameraX, cameraY); // Powtarzanie tekstury          
          float wave1 = sin(pos.x * 3.0 + time * waveSpeed);
          float wave2 = cos(pos.y * 1.5 + time * waveSpeed * 1.5);
          
          wave = (wave1 + wave2) * 0.5;
          pos.z = wave * waveHeight; // Nowe wysokości fal
      
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float time;
        uniform float waveTime;
        uniform float opacity;
        uniform float cameraY;

        varying vec2 vUv;
        varying float wave;
      
        void main() {
          vec2 repeatedUV = mod(vUv + vec2(0, (wave + time) * waveTime), 1.0);
          vec4 color = texture2D(map, repeatedUV);
      
          gl_FragColor = vec4(color.rgb, opacity);
        }
      `
    })

    const mesh = new Mesh(geometry, material)
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math_Half_PI)
    mesh.position.set(0, Ocean.SHALLOW_WATER.waveHeight, 0)
    mesh.renderOrder = renderOrder

    this.animations.push((ms: number) => {
      material.uniforms.time.value =
        (material.uniforms.time.value + ms * 0.0001) % 1_000
      material.uniforms.cameraX.value = this.mesh.position.x * 0.44
      material.uniforms.cameraY.value = -this.mesh.position.z * 0.44
    })

    return mesh
  }
}
