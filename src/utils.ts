import {
  Euler,
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
import { Material } from './model';
import { loader, meshProps, textures } from './state';

export const randomOf = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

export const getMatrix = (
  position: Vector3,
  rotation: Euler,
  scale: Vector3
) => {
  const matrix = new Matrix4();
  const quaternion = new Quaternion();
  const offset = new Vector3(0.5, 0.5, 0);

  quaternion.setFromEuler(rotation);
  matrix.compose(position.add(offset), quaternion, scale);

  return matrix;
};

export const createMaterial = (textureName: string) => {
  try {
    const material: Material = new MeshBasicMaterial({
      ...meshProps,
      map: textures[textureName].clone()
    });

    material.size = new Vector2(90 / 3, 240 / 6);

    return material;
  } catch (_missing) {
    console.warn(
      `${textureName} missing in ${Object.keys(textures).join(', ')}`
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
