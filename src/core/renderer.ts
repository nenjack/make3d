import { Stats } from 'pixi-stats'
import {
  Color,
  Fog,
  LinearSRGBColorSpace,
  Object3D,
  Scene,
  Texture,
  WebGLRenderer,
  WebGLRendererParameters
} from 'three'
import { state } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { queryParams } from '../utils/query-params'
import { Ocean } from '../view/ocean'
import { Skybox, SkyboxProps } from '../view/skybox'
import { Camera } from './camera'
import { SetProps } from '../model'

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
  protected readonly animations: Array<(time: number) => void> = []
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
    const props: WebGLRendererParameters = {
      antialias: DeviceDetector.HIGH_END,
      powerPreference: 'high-performance' as const
    }

    if (canvas) {
      props.canvas = canvas
    }

    super(props)
    this.outputColorSpace = LinearSRGBColorSpace
    this.scene.background = new Color(Renderer.backgroundColor)
    this.createFog()
    this.onResize()

    window.addEventListener('resize', () => this.onResize())

    if ('fps' in queryParams) {
      this.stats = new Stats(this)
    }

    const animationFrame = () => this.animation()
    if ('debug' in queryParams) {
      setInterval(animationFrame, 40)
    } else {
      this.setAnimationLoop(animationFrame)
    }

    this.domElement.classList.add('make3d')
    if (!this.domElement.parentElement) {
      document.body.appendChild(this.domElement)
    }
  }

  add(child: RendererChild) {
    this.children.push(child)
  }

  onResize() {
    setTimeout(() => {
      this.setSize(innerWidth, innerHeight)
      this.camera.onResize(innerWidth, innerHeight)
      this.ocean?.onResize()
      this.render(this.scene, this.camera)
    })
  }

  set({ level, target }: SetProps) {
    this.scene.clear()
    this.scene.add(level.mesh)
    this.children.forEach((child) => {
      this.scene.add(child.mesh)
    })

    this.camera.set({ level, target })
  }

  protected animation() {
    const now = Date.now()
    const ms = Math.min(50, now - this.now) // max 3 frame lag allowed = 20 fps
    if (!ms) return

    this.animations.forEach((animation) => {
      animation(ms)
    })

    this.children.forEach((child) => {
      child.update(ms)
    })

    this.camera.update(ms)
    this.ocean?.update(ms)
    this.now = now

    this.render(this.scene, this.camera)
  }

  protected createFog() {
    const far = this.camera.far - Camera.DISTANCE
    return new Fog(Renderer.backgroundColor, far * 0.8, far)
  }
}
