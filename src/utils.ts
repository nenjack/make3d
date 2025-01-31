import {
  Euler,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  Vector2,
  Vector3
} from 'three';
import { Material } from './model';
import { textures } from './state';

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
      map: textures[textureName].clone(),
      transparent: true
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
