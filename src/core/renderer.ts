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
import { Level } from '../level'
import { state } from '../state'
import { DeviceDetector } from '../utils/detect-mobile'
import { queryParams } from '../utils/query-params'
import { Billboard } from '../view/billboard'
import { Ocean } from '../view/ocean'
import { Skybox, SkyboxProps } from '../view/skybox'
import { Camera } from './camera'

export interface RendererProps {
  canvas?: HTMLCanvasElement
  ocean?: Texture
  skybox?: SkyboxProps
}

export interface RendererChild {
  mesh: Object3D
  update: (ms: number) => void
}

export class Renderer extends WebGLRenderer {
  static backgroundColor = 0x44ccf0

  readonly children: RendererChild[] = []

  now = Date.now()
  scene = new Scene()
  camera = new Camera()
  animations: Array<(time: number) => void> = []

  stats?: Stats
  ocean?: Ocean
  skybox?: Skybox

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

    if (!this.domElement.parentElement) {
      document.body.appendChild(this.domElement)
    }
  }

  add(child: RendererChild) {
    this.children.push(child)
  }

  ready({ level, target }: { level: Level; target: Billboard }) {
    this.scene.clear()
    this.scene.add(level.mesh)
    this.children.forEach((child) => {
      this.scene.add(child.mesh)
    })

    this.camera.setLevelFloor(level)
    this.camera.setTarget(target)
  }

  animation() {
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

  onResize() {
    this.setSize(innerWidth, innerHeight)
    this.camera.onResize(innerWidth, innerHeight)
    this.ocean?.onResize()
    this.scene.fog = this.createFog()

    this.render(this.scene, this.camera)
  }

  protected createFog() {
    const far = this.camera.far - Camera.DISTANCE

    return new Fog(Renderer.backgroundColor, far * 0.8, far)
  }
}
