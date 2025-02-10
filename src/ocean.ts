import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Texture,
  Vector3
} from 'three';
import { Level } from './level';
import { meshProps, renderer } from './state';

export class Ocean {
  static readonly scale = 4;
  static readonly waveLength = 0.1;
  static readonly waveDuration = 1000;
  static readonly config = [
    {
      opacity: 0.5,
      z: -0.01,
      renderOrder: 2
    },
    {
      opacity: 1,
      z: -0.25,
      renderOrder: 0
    }
  ];

  readonly cols: number;
  readonly rows: number;

  constructor(texture: Texture, repeat = 1) {
    this.cols = Level.cols * repeat;
    this.rows = Level.rows * repeat;

    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    renderer.scene.add(
      ...Array.from({ length: Ocean.config.length }, (_: unknown, index) =>
        this.createPlane(texture, index)
      )
    );
  }

  protected createPlane(texture: Texture, index: number) {
    const geometry = new PlaneGeometry(this.cols, this.rows);
    const { opacity, z, renderOrder } = Ocean.config[index];
    const material = new MeshBasicMaterial({
      ...meshProps,
      map: this.createMap(texture, index),
      opacity
    });

    const mesh = new Mesh(geometry, material);
    mesh.setRotationFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
    mesh.position.set(
      this.cols / 2 / Ocean.scale,
      z,
      this.rows / 2 / Ocean.scale
    );

    mesh.renderOrder = renderOrder;

    return mesh;
  }

  protected createMap(texture: Texture, index: number) {
    const map = texture.clone();
    const i = index + 1;
    const scale = i / Ocean.scale;

    map.repeat.set(this.cols * scale, this.rows * scale);
    map.rotation = (Math.PI * index) / 2;

    renderer.animations.push(() => {
      const n = Date.now() / Ocean.waveDuration;

      map.offset.y = Math.sin(n / i) * (i * (Ocean.waveLength / 2));
    });

    return map;
  }
}
