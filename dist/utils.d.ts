import { Euler, Matrix4, Vector3 } from 'three';
import { Material } from './model';
export declare const randomOf: (array: any[]) => any;
export declare const getMatrix: (
  position: Vector3,
  rotation: Euler,
  scale: Vector3
) => Matrix4;
export declare const createMaterial: (textureName: string) => Material;
//# sourceMappingURL=utils.d.ts.map
