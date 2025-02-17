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

export class Renderer extends WebGLRenderer {
  static backgroundColor = 0xa0e8f0;

  now = Date.now();
  scene = new Scene();
  camera = new Camera();
  animations: Array<(time: number) => void> = [];
  light?: DirectionalLight;
  stats?: Stats;

  constructor() {
    super({ antialias: true, powerPreference: 'high-performance' });

    this.setAnimationLoop(this.animation.bind(this));
    this.outputColorSpace = LinearSRGBColorSpace;

    this.scene.add(new AmbientLight(0xffeecc, 0.5));
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
    const ms = Math.min(250, now - this.now); // 15 fps is lowest allowed

    this.animations.forEach((animation) => animation(ms));
    this.camera.update(ms);
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
