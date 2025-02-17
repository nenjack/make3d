import { Stats } from 'pixi-stats';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer
} from 'three';
import { Camera } from './camera';
import { queryParams } from './query-params';
import { Ocean } from './ocean';

export class Renderer extends WebGLRenderer {
  static backgroundColor = 0xa0e8f0;

  now = Date.now();
  scene = new Scene();
  camera = new Camera();
  light: AmbientLight;
  animations: Array<(time: number) => void> = [];
  stats?: Stats;
  ocean?: Ocean;

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
  }

  animation() {
    const now = Date.now();
    const ms = Math.min(500, now - this.now); // 30 fps is lowest allowed

    this.animations.forEach((animation) => animation(ms));
    this.camera.update(ms);
    this.ocean?.update(ms);
    this.render(this.scene, this.camera);
    this.now = now;
  }

  onResize() {
    this.setSize(innerWidth, innerHeight);
    this.camera.onResize(innerWidth, innerHeight);
    this.scene.fog = new Fog(
      Renderer.backgroundColor,
      this.camera.far * 0.33,
      this.camera.far * 0.67
    );
  }
}
