import {
  LinearSRGBColorSpace,
  Matrix4,
  MeshBasicMaterial,
  NearestFilter,
  NearestMipMapLinearFilter,
  Quaternion,
  Texture,
  Vector2,
  Vector3
} from 'three';
import { CubeDirections, Material } from './model';
import { loader, meshProps, textures } from './state';

export const randomOf = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

export const getMatrix = (position: Vector3, scale: Vector3) => {
  const matrix = new Matrix4();
  const quaternion = new Quaternion();
  const offset = new Vector3(0.5, 0.5, 0.5);

  matrix.compose(position.add(offset), quaternion, scale);

  return matrix;
};

export const createMaterial = (textureName: string, cols = 1, rows = 1) => {
  try {
    const texture = textures[textureName].clone();
    const image: HTMLImageElement = texture.image;
    const material: Material = new MeshBasicMaterial({
      ...meshProps,
      map: texture
    });

    if (cols > 1 || rows > 1) {
      material.size = new Vector2(image.width / cols, image.height / rows);
      texture.repeat.set(1 / cols, 1 / rows);
    }

    return material;
  } catch (missing: any) {
    console.warn(
      `${textureName} missing in ${Object.keys(textures).join(', ')}`,
      missing.message || missing
    );

    return {} as Material;
  }
};

export const getTextureNameFromPath = (path: string) => {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (!fileName) {
    return '';
  }

  return fileName
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};

export const pixelate = (texture: Texture) => {
  texture.minFilter = NearestMipMapLinearFilter;
  texture.magFilter = NearestFilter;
  texture.colorSpace = LinearSRGBColorSpace;
};

export const loadTextures = async (texturePaths: string[]) => {
  const promises = texturePaths.map((texturePath) => loader.load(texturePath));
  const resolved = await Promise.all(promises);

  texturePaths.forEach((texturePath, index) => {
    const textureName = getTextureNameFromPath(texturePath);
    const texture = resolved[index];

    pixelate(texture);
    textures[textureName] = texture;
  });
};

export const normalizeAngle = (angle: number) =>
  (2 * Math.PI + angle) % (2 * Math.PI);

export const mapCubeTextures = <T>({
  left,
  right,
  up,
  down,
  front,
  back
}: Record<CubeDirections, T>): T[] => [left, right, up, down, front, back];
