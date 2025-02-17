import {
  CircleGeometry,
  Mesh,
  MeshBasicMaterial,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three';
import { Level } from './level';
import { Math_Half_PI, materialProps, renderer } from './state';

export class Ocean {
  static readonly scale = 4;
  static readonly waveDetail = 16;
  static readonly textureRepeat = 8;
  static readonly shallowWater = {
    opacity: 0.5,
    z: -0.05,
    scale: 1,
    waveForward: -0.015,
    waveHeight: 0.1,
    wavingSpeed: 1.7,
    renderOrder: 1
  };

  animations: Array<(time: number) => void> = [];

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

    renderer.scene.add(this.createDeepWater(texture));
    renderer.scene.add(this.createShallowWater(texture));
  }

  update(ms = 0) {
    this.animations.forEach((animation) => animation(ms));
  }

  protected createDeepWater(texture: Texture) {
    const scale = 2;
    const size = 2 / (scale * Ocean.textureRepeat);
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
    mesh.scale.set(2, 2, 2);
    mesh.position.set(0, -0.25, 0);
    mesh.renderOrder = 0;

    this.animations.push(() => {
      if (!renderer.camera.ref) return;
      const { x, y } = renderer.camera.ref.body;
      mesh.position.set(x * size, -0.25, y * size);
    });

    return mesh;
  }

  protected createShallowWater(texture: Texture) {
    const {
      opacity,
      scale,
      z,
      renderOrder,
      waveForward,
      wavingSpeed,
      waveHeight
    } = Ocean.shallowWater;
    const size = 2 / Ocean.textureRepeat;
    const radius = Math.hypot(this.cols, this.rows) / 2;
    const geometry = new CircleGeometry(radius);
    const map = texture.clone();
    const material = new ShaderMaterial({
      ...materialProps,
      uniforms: {
        time: { value: 0 },
        waveForward: { value: waveForward },
        wavingSpeed: { value: wavingSpeed },
        waveHeight: { value: waveHeight },
        textureRepeat: { value: Ocean.textureRepeat / scale },
        cameraX: { value: 0 },
        cameraY: { value: 0 },
        oceanZ: { value: z },
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
        uniform float oceanZ;
      
        varying vec2 vUv;
        varying float wave;
      
        void main() {
          vUv = uv * textureRepeat + vec2(cameraX, cameraY); // Powtarzanie tekstury
          
          // Kombinacja sinusoid dla bardziej realistycznych fal
          float wave1 = sin(position.x * 3.0 + time * wavingSpeed);
          float wave2 = cos(position.z * 2.0 + time * wavingSpeed * 1.2);
          float wave3 = sin(position.x * 1.5 + position.z * 1.5 + time * wavingSpeed * 0.8);
          
          // Łączymy fale dla bardziej organicznego efektu
          wave = (wave1 + wave2 + wave3) / 3.0;
      
          vec3 pos = position;
          pos.z = oceanZ + wave * waveHeight; // Nowe wysokości fal
      
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float time;
        uniform float waveForward;
        uniform float opacity;
      
        varying vec2 vUv;
        varying float wave;
      
        void main() {
          vec2 repeatedUV = fract(vUv + vec2(0.0, (wave + time) * waveForward)); // Powtarzanie + lekkie przesuwanie
          vec4 color = texture2D(map, repeatedUV);
      
          gl_FragColor = vec4(color.rgb, opacity);
        }
      `
    });

    const mesh = new Mesh(geometry, material);
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math_Half_PI);
    mesh.position.set(0, z, 0);
    mesh.renderOrder = renderOrder;

    this.animations.push((ms: number) => {
      if (!renderer.camera.ref) return;
      const { x, y } = renderer.camera.ref.body;
      mesh.position.set(x, z, y);
      material.uniforms.time.value += ms * 0.001;
      material.uniforms.cameraX.value = x * size;
      material.uniforms.cameraY.value = -y * size;
    });

    return mesh;
  }
}
