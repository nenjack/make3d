import { Euler, Quaternion, Texture, Vector3 } from 'three';
import { Box } from './box';
import { Level } from './level';
import { floors, physics, renderer } from './state';
import { getMatrix } from './utils';

export class ViewLevel extends Level {
  constructor(textures: Texture[]) {
    super();

    const mesh = new Box(textures, Level.cols, Level.rows);
    const forEachHeight = this.forEachHeight(mesh);

    this.heights.forEach(forEachHeight);
    renderer.scene.add(mesh);
  }

  createBox(x: number, y: number, height: number) {
    for (let floor = 0; floor < height; floor++) {
      physics.createBox({ x, y }, 1, 1, {
        isStatic: true,
        group: floors[floor]
      });
    }
  }

  forEachHeight(mesh: Box) {
    return (row: number[], x: number) => {
      row.forEach((height: number, y: number) => {
        const z = height / 2;
        const angle = Math.floor(Math.random() * 4) * 90;
        const quaternion = new Quaternion();

        if (height) {
          quaternion.setFromAxisAngle(
            new Vector3(0, 0, 1),
            (angle * Math.PI) / 180
          );

          const euler = new Euler();
          euler.setFromQuaternion(quaternion);

          const matrix = getMatrix(
            new Vector3(x, y, (z - 0.5) / 2),
            euler,
            new Vector3(1, 1, z)
          );
          mesh.setMatrixAt(y * Level.cols + x, matrix);

          this.createBox(x, y, height);
        }
      });
    };
  }
}
