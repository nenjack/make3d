import {
  CircleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three';
import { Camera } from './camera';
import { Level } from './level';
import { Math_Half_PI, materialProps, renderer } from './state';

export class Ocean {
  static readonly scale = 4;
  static readonly waveDetail = 16;
  static readonly textureRepeat = 8;
  static readonly deepWaterZ = -0.25;
  static readonly shallowWater = {
    opacity: 0.5,
    scale: 1,
    waveTime: 0.16,
    waveHeight: 0.16,
    wavingSpeed: 2,
    renderOrder: 1
  };

  animations: Array<(time: number) => void> = [];

  readonly mesh = new Group();
  readonly repeat: number;
  readonly cols: number;
  readonly rows: number;

  protected startTime = Date.now();

  constructor(texture: Texture, repeat = 1.1) {
    this.repeat = repeat;
    this.cols = Level.cols * repeat;
    this.rows = Level.rows * repeat;

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    this.mesh.add(this.createDeepWater(texture));
    this.onResize();

    renderer.scene.add(this.mesh);

    setTimeout(() => {
      this.mesh.add(this.createShallowWater(texture));
    });
  }

  update(ms = 0) {
    if (!renderer.camera.ref) return;

    const { x, y } = renderer.camera.ref.body;
    this.mesh.position.set(x, Ocean.deepWaterZ, y);
    this.animations.forEach((animation) => animation(ms));
  }

  onResize() {
    const scale = renderer.camera.far / Camera.far;
    this.mesh.scale.set(scale, scale, scale);
  }

  protected createDeepWater(texture: Texture) {
    const scale = 2;
    const radius = Math.hypot(this.cols, this.rows) / 2;
    const geometry = new CircleGeometry(radius);
    const map = texture.clone();
    map.repeat.set(this.cols * scale, this.rows * scale);

    const material = new MeshBasicMaterial({
      ...materialProps,
      map
    });

    const mesh = new Mesh(geometry, material);
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math_Half_PI);
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(0, 0, 0);
    mesh.renderOrder = 0;

    this.animations.push(() => {
      map.offset.set(
        (this.mesh.position.x * 0.7) % 1,
        1 - ((this.mesh.position.z * 0.7) % 1)
      );
    });

    return mesh;
  }

  protected createShallowWater(texture: Texture) {
    const { opacity, scale, renderOrder, waveTime, wavingSpeed, waveHeight } =
      Ocean.shallowWater;
    const size = 2 / Ocean.textureRepeat;
    const radius = Math.hypot(this.cols, this.rows) / 2;
    const geometry = new CircleGeometry(radius);
    const map = texture.clone();
    const material = new ShaderMaterial({
      ...materialProps,
      uniforms: {
        time: { value: 0 },
        cameraX: { value: 0 },
        cameraY: { value: 0 },
        textureRepeat: { value: Ocean.textureRepeat / scale },
        wavingSpeed: { value: wavingSpeed },
        waveHeight: { value: waveHeight },
        waveTime: { value: waveTime },
        map: { value: map },
        opacity: { value: opacity }
      },
      vertexShader: `
        uniform float time;
        uniform float textureRepeat;
        uniform float wavingSpeed;
        uniform float waveHeight;
        uniform float cameraX;
        uniform float cameraY;
      
        varying vec2 vUv;
        varying float wave;
      
        void main() {
          vec3 pos = position;
          vUv = uv * textureRepeat + vec2(cameraX, cameraY); // Powtarzanie tekstury          
          float wave1 = sin(pos.x * 3.0 + time * wavingSpeed);
          float wave2 = cos(pos.y * 1.5 + time * wavingSpeed * 1.5);
          
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
    });

    const mesh = new Mesh(geometry, material);
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math_Half_PI);
    mesh.position.set(0, Ocean.shallowWater.waveHeight, 0);
    mesh.renderOrder = renderOrder;

    this.animations.push((ms: number) => {
      material.uniforms.time.value =
        (material.uniforms.time.value + ms * 0.0001) % 1_000;
      material.uniforms.cameraX.value = this.mesh.position.x * size;
      material.uniforms.cameraY.value = -this.mesh.position.z * size;
    });

    return mesh;
  }
}
