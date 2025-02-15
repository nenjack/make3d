import { Stats } from 'pixi-stats';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer
} from 'three';
import { Camera } from './camera';
import { queryParams } from './query-params';

export class Renderer extends WebGLRenderer {
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
    this.scene.background = new Color(0x99eeff);

    this.onResize();
    window.addEventListener('resize', () => this.onResize());
    document.body.appendChild(this.domElement);

    if ('fps' in queryParams) {
      this.stats = new Stats(this);
    }
  }

  animation() {
    const now = Date.now();
    const time = now - this.now;

    this.animations.forEach((animation) => animation(time));
    this.render(this.scene, this.camera);
    this.now = now;
  }

  onResize() {
    this.setSize(innerWidth, innerHeight);
    this.camera.onResize(innerWidth, innerHeight);
  }
}
