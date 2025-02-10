import {
  AmbientLight,
  Color,
  DirectionalLight,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer
} from 'three';
import { Camera } from './camera';

export class Renderer extends WebGLRenderer {
  now = Date.now();
  scene = new Scene();
  camera = new Camera();
  animations: Array<(time: number) => void> = [];
  light?: DirectionalLight;

  constructor() {
    super({ antialias: true, powerPreference: 'high-performance' });

    this.setAnimationLoop(this.animation.bind(this));
    this.outputColorSpace = LinearSRGBColorSpace;

    this.scene.add(new AmbientLight(0xffeecc, 0.5));
    this.scene.background = new Color(0x000000);

    document.body.appendChild(this.domElement);
    window.addEventListener('resize', () => this.onResize());

    this.onResize();
  }

  animation() {
    const now = Date.now();
    const time = now - this.now;

    this.now = Date.now();
    this.animations.forEach((animation) => animation(time));
    this.render(this.scene, this.camera);
  }

  onResize() {
    this.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
