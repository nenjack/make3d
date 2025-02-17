import { MeshBasicMaterial, Vector2, Vector3 } from 'three';
import { Mouse } from './mouse';

export type Material = MeshBasicMaterial & { scale?: Vector3; size?: Vector2 };

export type Direction = 'down' | 'right' | 'up' | 'left';

export type DirectionsToRows = Partial<Record<Direction | 'default', number>>;

export type Key = Direction | 'space';

export type CubeDirections = Direction | 'front' | 'back';

export interface State extends Record<string, any> {
  keys: Record<string, boolean>;
  mouse: Mouse;
}

export interface TexturedBillboardProps {
  textureName: string;
  cols?: number;
  rows?: number;
  totalFrames?: number;
  frameDuration?: number;
  directionsToRows?: DirectionsToRows;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
}
