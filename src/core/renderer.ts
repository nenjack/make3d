import { Stats } from 'pixi-stats'
import {
  Color,
  Fog,
  LinearSRGBColorSpace,
  Object3D,
  Scene,
  Texture,
  WebGLRenderer
} from 'three'
import { SetProps } from '../model'
import { state } from '../state'
import { queryParams } from '../utils/query-params'
import { Ocean } from '../view/ocean'
import { Skybox, SkyboxProps } from '../view/skybox'
import { Camera } from './camera'

export interface RendererProps {
  canvas?: HTMLCanvasElement
  ocean?: Texture
  skybox?: SkyboxProps
}

export interface RendererChild {
  readonly mesh: Object3D
  readonly update: (ms: number) => void
}

export class Renderer extends WebGLRenderer {
  protected static backgroundColor = 0x44ccf0

  scene = new Scene()
  camera = new Camera()
  stats?: Stats
  ocean?: Ocean
  skybox?: Skybox

  protected readonly children: RendererChild[] = []
  protected now = Date.now()

  static create({ canvas, ocean, skybox }: RendererProps): Renderer {
    if (!state.renderer) {
      state.renderer = new Renderer(canvas)
    }

    if (!state.renderer.ocean && ocean) {
      state.renderer.ocean = new Ocean(ocean)
    }

    if (!state.renderer.skybox) {
      state.renderer.skybox = new Skybox(skybox)
    }

    return state.renderer
  }

  constructor(canvas?: HTMLCanvasElement) {
    super({
      canvas,
      powerPreference: 'high-performance',
      antialias: true
    })

    this.onCreate()
  }

  add(child: RendererChild) {
    this.children.push(child)
  }

  setTarget(target: SetProps['target']) {
    this.camera.setTarget(target)
    this.children.forEach((child) => {
      this.scene.add(child.mesh)
    })
  }

  setLevel(level: SetProps['level']) {
    this.scene.add(level.mesh)
  }

  protected onCreate() {
    this.outputColorSpace = LinearSRGBColorSpace
    this.scene.background = new Color(Renderer.backgroundColor)

    this.onResize()
    this.createFog()
    this.setAnimationLoop(this.animation.bind(this))

    this.domElement.classList.add('make3d')
    this.domElement.addEventListener('contextlost', console.warn)

    window.addEventListener('resize', this.onResize.bind(this))

    if (!this.domElement.parentElement) {
      document.body.appendChild(this.domElement)
    }

    if ('fps' in queryParams) {
      this.stats = new Stats(this)
    }
  }

  protected onResize() {
    requestAnimationFrame(() => {
      this.setSize(innerWidth, innerHeight)
      this.camera.onResize(innerWidth, innerHeight)
      this.render(this.scene, this.camera)
    })
  }

  protected animation() {
    const now = Date.now()
    const ms = Math.min(50, now - this.now) // max 3 frame lag allowed = 20 fps
    if (!ms) return

    this.children.forEach((child) => {
      child.update(ms)
    })

    this.camera.update(ms)
    this.now = now

    this.render(this.scene, this.camera)
  }

  protected createFog() {
    const far = this.camera.far - Camera.DISTANCE
    return new Fog(Renderer.backgroundColor, far * 0.8, far)
  }
}
