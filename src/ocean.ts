import {
  Mesh,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3
} from 'three';
import { Level } from './level';
import { renderer } from './state';

export class Ocean {
  static readonly scale = 4;
  static readonly waveSpeed = 1;
  static readonly waveHeight = 0.07;
  static readonly waveDetail = 16;
  static readonly textureRepeat = 8; // Powtarzanie tekstury
  static readonly config = [
    {
      opacity: 0.5,
      z: 0,
      renderOrder: 2,
      scale: 0.9
    },
    {
      opacity: 1,
      z: -0.5,
      renderOrder: 1,
      scale: 0.5
    }
  ];

  readonly cols: number;
  readonly rows: number;
  protected startTime = Date.now();

  constructor(texture: Texture, repeat = 1) {
    this.cols = Level.cols * repeat;
    this.rows = Level.rows * repeat;

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    renderer.scene.add(
      ...Array.from(Ocean.config, (_: unknown, index) =>
        this.createPlane(texture, index)
      )
    );
  }

  protected createPlane(texture: Texture, index: number) {
    const geometry = new PlaneGeometry(
      this.cols,
      this.rows,
      Ocean.waveDetail,
      Ocean.waveDetail
    ); // więcej podziałów dla lepszego falowania
    const { opacity, z, renderOrder, scale } = Ocean.config[index];
    const material = new ShaderMaterial({
      uniforms: {
        direction: { value: index ? -1 : 1 },
        z: { value: z },
        time: { value: (index * Math.PI) / 2 },
        map: { value: texture },
        opacity: { value: opacity },
        waveSpeed: { value: Ocean.waveSpeed * scale },
        waveHeight: { value: Ocean.waveHeight * scale },
        textureRepeat: { value: Ocean.textureRepeat * scale }
      },
      vertexShader: `
        uniform float time;
        uniform float waveSpeed;
        uniform float waveHeight;
        uniform float textureRepeat;
        uniform float direction;
        uniform float z;

        varying vec2 vUv;

        void main() {
          vUv = uv * textureRepeat; // Powtarzanie tekstury
          vec3 pos = position;
          float wave = sin(pos.x + pos.z + time * waveSpeed * 2.0);

          pos.y += time * waveSpeed * direction * 0.05;
          pos.z = z + wave * waveHeight;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform float time;
        uniform float textureRepeat;

        varying vec2 vUv;

        void main() {
          vec2 repeatedUV = vUv * textureRepeat + vec2(0.0, time * 0.01); // Powtarzanie + lekkie przesuwanie
          vec4 color = texture2D(map, repeatedUV); // fract() zapewnia powtarzanie

          gl_FragColor = vec4(color.rgb, color.a * opacity);
        }
      `,
      transparent: true
    });

    const mesh = new Mesh(geometry, material);
    const x = this.cols / 2 / Ocean.scale;
    const y = this.rows / 2 / Ocean.scale;

    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
    mesh.position.set(x, z, y);
    mesh.rotateZ(Math.PI / 4 + index * Math.PI);
    mesh.renderOrder = renderOrder;

    // Animacja shadera
    renderer.animations.push((ms: number) => {
      material.uniforms.time.value += ms / 1000;
    });

    return mesh;
  }
}
