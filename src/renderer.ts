import { Stats } from 'pixi-stats'
import {
  Color,
  Fog,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer,
  WebGLRendererParameters
} from 'three'
import { Billboard } from './billboard'
import { Camera } from './camera'
import { DeviceDetector } from './detect'
import { Ocean } from './ocean'
import { queryParams } from './query-params'
import { Skybox } from './skybox'
import { state } from './state'

export interface RendererProps {
  canvas: HTMLCanvasElement
  ocean?: () => Ocean
  skybox?: () => Skybox
}

export class Renderer extends WebGLRenderer {
  static backgroundColor = 0x44ccf0

  /**
   * @param {RendererProps} props
   * @returns {Renderer}
   */
  static create({ canvas, ocean, skybox }: RendererProps): Renderer {
    if (state.renderer) return state.renderer

    state.renderer = new Renderer(canvas)
    state.renderer.ocean = ocean?.()
    state.renderer.skybox = skybox?.()

    return state.renderer
  }

  now = Date.now()
  scene = new Scene()
  camera = new Camera()
  animations: Array<(time: number) => void> = []
  stats?: Stats
  ocean?: Ocean
  skybox?: Skybox

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

    if (!this.domElement.parentElement) {
      document.body.appendChild(this.domElement)
    }

    const animationFrame = () => this.animation()
    if ('debug' in queryParams) {
      setInterval(animationFrame, 40)
    } else {
      this.setAnimationLoop(animationFrame)
    }
  }

  animation() {
    const now = Date.now()
    const ms = Math.min(50, now - this.now) // max 3 frame lag allowed = 20 fps
    if (!ms) return

    this.animations.forEach((animation) => animation(ms))
    this.camera.update(ms)
    Billboard.billboards.forEach((billboard) => billboard.update(ms))

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
