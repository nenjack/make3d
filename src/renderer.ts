import { Stats } from 'pixi-stats';
import {
  AmbientLight,
  Color,
  Fog,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer
} from 'three';
import { Camera } from './camera';
import { Ocean } from './ocean';
import { queryParams } from './query-params';
import { Billboard } from './billboard';
import { Skybox } from './skybox';

export class Renderer extends WebGLRenderer {
  static backgroundColor = 0xbbf0ff;

  now = Date.now();
  scene = new Scene();
  camera = new Camera();
  light: AmbientLight;
  animations: Array<(time: number) => void> = [];
  stats?: Stats;
  ocean?: Ocean;
  skybox?: Skybox;

  constructor() {
    super({ antialias: true, powerPreference: 'high-performance' });
    this.outputColorSpace = LinearSRGBColorSpace;

    if ('debug' in queryParams) {
      setInterval(this.animation.bind(this), 40);
    } else {
      this.setAnimationLoop(this.animation.bind(this));
    }

    this.light = new AmbientLight(0xffeecc, 0.5);
    this.scene.add(this.light);
    this.scene.background = new Color(Renderer.backgroundColor);
    this.onResize();

    window.addEventListener('resize', () => this.onResize());
    document.body.appendChild(this.domElement);

    if ('fps' in queryParams) {
      this.stats = new Stats(this);
    }

    const frame = () => {
      this.render(this.scene, this.camera);
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

  animation() {
    const now = Date.now();
    const ms = Math.min(50, now - this.now); // max 3 frame lag allowed = 20 fps
    if (!ms) return;

    this.animations.forEach((animation) => animation(ms));
    this.camera.update(ms);
    Billboard.billboards.forEach((billboard) => billboard.update(ms));

    this.ocean?.update(ms);
    this.now = now;
  }

  onResize() {
    this.setSize(innerWidth, innerHeight);
    this.camera.onResize(innerWidth, innerHeight);
    this.ocean?.onResize();
    this.scene.fog = this.createFog();
  }

  protected createFog() {
    const far = this.camera.far - this.camera.distance;

    return new Fog(Renderer.backgroundColor, far * 0.8, far);
  }
}
