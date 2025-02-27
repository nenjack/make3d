import {
  Matrix4,
  MeshBasicMaterial,
  NearestFilter,
  NearestMipMapLinearFilter,
  NoColorSpace,
  Quaternion,
  Texture,
  Vector3
} from 'three';
import { DeviceDetector } from './detect';
import { CubeDirections } from './model';
import { alphaMaterialProps, loader, Math_Double_PI, textures } from './state';

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
    const material = new MeshBasicMaterial({
      ...alphaMaterialProps,
      map: texture
    });

    if (cols > 1 || rows > 1) {
      texture.repeat.set(1 / cols, 1 / rows);
    }

    return material;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    console.error(
      `texture: "${textureName}" is missing in ${JSON.stringify(Object.keys(textures))}`
    );

    return {} as MeshBasicMaterial;
  }
};

export const getTextureNameFromPath = (path: string) => {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (!fileName) {
    return '';
  }

  return fileName
    .split(/[-_]+/)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};

export const pixelate = (texture: Texture) => {
  texture.colorSpace = NoColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = DeviceDetector.HIGH_END
    ? NearestMipMapLinearFilter
    : NearestFilter;
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
  (Math_Double_PI + angle) % Math_Double_PI;

export const mapCubeTextures = <T>({
  left,
  right,
  up,
  down,
  front,
  back
}: Record<CubeDirections, T>): T[] => [left, right, up, down, front, back];

export const normalize = (n: number) => Math.min(1, Math.max(-1, n));

export const randomFrom = <T>(elements: T[]) =>
  elements[Math.floor(Math.random() * elements.length)];
