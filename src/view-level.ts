import { Texture, Vector3 } from 'three';
import { Box } from './box';
import { Cactus } from './cactus';
import { Level } from './level';
import { Ocean } from './ocean';
import { Palm } from './palm';
import { Skybox } from './skybox';
import { maxLevelHeight, renderer } from './state';
import { getMatrix } from './utils';

export class ViewLevel extends Level {
  static readonly floraFill = Level.fill * 0.85;
  static readonly cactusSurviveChance = 0.24;
  static readonly palmSurviceChance = 0.12;
  static readonly minHeightForPalm = maxLevelHeight - 3;

  mesh: Box;

  constructor(
    textures: Texture[],
    {
      ocean,
      skybox
    }: {
      ocean?: () => Ocean;
      skybox?: () => Skybox;
    }
  ) {
    super();
    this.mesh = this.createMesh(textures);

    renderer.ocean = ocean?.();
    renderer.skybox = skybox?.();
  }

  createBox(textures: Texture[]) {
    const box = new Box(textures, Level.cols, Level.rows);
    box.position.set(-Level.cols / 2, 0, -Level.rows / 2);

    return box;
  }

  createMesh(textures: Texture[]) {
    const box = this.createBox(textures);

    this.forEachHeight(this.heights, ({ col, row, height }) => {
      box.setMatrixAt(
        row * Level.rows + col,
        getMatrix(
          new Vector3(col, height / 4 - 0.75, row),
          new Vector3(1, height / 2, 1)
        )
      );

      const x = col - Level.cols / 2;
      const y = row - Level.rows / 2;
      this.createBoxCollider(x, y, height);

      if (
        height >= ViewLevel.minHeightForPalm &&
        Math.random() < ViewLevel.palmSurviceChance
      ) {
        new Palm(this, x + 0.5, y + 0.5);
      }
    });

    const flora = this.createHeights(
      Level.cols * 2,
      Level.rows * 2,
      ViewLevel.floraFill
    );

    this.forEachHeight(flora, ({ col, row }) => {
      const height = this.heights[Math.floor(col / 2)][Math.floor(row / 2)];

      if (
        height &&
        height < ViewLevel.minHeightForPalm &&
        Math.random() < ViewLevel.cactusSurviveChance
      ) {
        const x = col / 2 - Level.cols / 2 + 0.25;
        const y = row / 2 - Level.rows / 2 + 0.25;
        new Cactus(this, x, y);
      }
    });

    return box;
  }
}
